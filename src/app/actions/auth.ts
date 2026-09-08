// src/app/actions/auth.ts
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-dollspace-key-12345";

// 1. ACTION: Register a brand new unique user account
export async function registerUser(formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase(); // 👈 EXTRACT EMAIL
  const displayName = (formData.get("displayName") as string)?.trim();
  const password = formData.get("password") as string;

  // 1. Guard against empty fields
  if (!username || !email || !displayName || !password) {
    return { error: "All fields are strictly required." };
  }

  // 2. Simple verification check to ensure email follows an accurate format
  if (!email.includes("@") || !email.includes(".")) {
    return { error: "Please enter a valid email address." };
  }

  // 3. Double-check if the username OR the email address is already registered
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email }
      ]
    }
  });

  if (existingUser) {
    if (existingUser.username === username) return { error: "Username is already registered." };
    if (existingUser.email === email) return { error: "Email address is already in use." };
  }

  // Hash password securely (10 salt rounds)
  const passwordHash = await bcrypt.hash(password, 10);

  // 4. Create record with the new email string
  await prisma.user.create({
    data: { username, email, displayName, passwordHash },
  });

  redirect("/login");
}

// 2. ACTION: Log in an existing user and drop an encrypted session cookie
export async function loginUser(formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !password) return { error: "Missing username or password." };

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return { error: "Invalid username or password credentials." };

  // Verify plain text password against database hash
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) return { error: "Invalid username or password credentials." };

  // Create session JWT token valid for 7 days
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });

  // Store token safely inside an HTTP-Only secure cookie structure
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true, // Prevents client-side scripts from reading the cookie
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  redirect("/");
}

// 3. UTILITY: Retrieve the currently validated user session from server components
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
    return await prisma.user.findUnique({ where: { id: decoded.userId } });
  } catch {
    return null;
  }
}

// 4. ACTION: Clear cookies and log out instantly
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  redirect("/login");
}
