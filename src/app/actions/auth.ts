// src/app/actions/auth.ts
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-dollspace-key-12345";

// src/app/actions/auth.ts

// 1. Update registerUser to return an explicit type that accommodates errors safely
export async function registerUser(formData: FormData): Promise<any> {
  const username = (formData.get("username") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const displayName = (formData.get("displayName") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !email || !displayName || !password) {
    return { error: "All fields are strictly required." };
  }

  if (!email.includes("@") || !email.includes(".")) {
    return { error: "Please enter a valid email address." };
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] }
  });

  if (existingUser) {
    if (existingUser.username === username) return { error: "Username is already registered." };
    if (existingUser.email === email) return { error: "Email address is already in use." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { username, email, displayName, passwordHash },
  });

  redirect("/login");
}

// 2. Update loginUser to also use loose return mapping for the form action type bypass
export async function loginUser(formData: FormData): Promise<any> {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !password) return { error: "Missing username or password." };

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return { error: "Invalid username or password credentials." };

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) return { error: "Invalid username or password credentials." };

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });

  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
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
