// src/app/actions/auth.ts
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Resend } from "resend"; 

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-dollspace-key-12345";
const resend = new Resend(process.env.RESEND_API_KEY); 

// src/app/actions/auth.ts

// 🚀 1.1 UPGRADED REGISTRATION ACTION WITH AUTOMATED EMAIL ENGINE
export async function registerUser(prevState: any, formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const displayName = (formData.get("displayName") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !email || !displayName || !password) {
    return { error: "All account fields are strictly required." };
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] }
  });

  if (existingUser) {
    if (existingUser.username === username) return { error: "Username is already registered." };
    if (existingUser.email === email) return { error: "Email address is already in use." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Write new record down into your Neon database tables
  const newUser = await prisma.user.create({
    data: { username, email, displayName, passwordHash },
  });

  // 1.2 DISPATCH THE TRANSACTION WELCOME EMAIL PIPELINE
  try {
    await resend.emails.send({
      from: "Dollspace <onboarding@resend.dev>", // Default free sandbox testing address sender
      to: email,
      subject: `🌸 Welcome to Dollspace, ${displayName}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ffe4e6; rounded-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <h1 style="color: #f43f5e; text-align: center; font-size: 28px; font-weight: 900; margin-bottom: 5px;">Dollspace</h1>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 24px;">Registration Successful</p>
          
          <p style="color: #374151; font-size: 15px; line-height: 1.6; font-weight: 500;">Hi <strong>${displayName}</strong>,</p>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">Thank you so much for joining our community! Your account profile has been securely created and registered successfully on the cloud engine.</p>
          
          <div style="background-color: #fff1f2; border: 1px solid #ffe4e6; padding: 15px; border-radius: 16px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: #9f1239; font-size: 12px; font-weight: 700; text-transform: uppercase;">Your Secure Account Username</p>
            <p style="margin: 5px 0 0 0; color: #e11d48; font-size: 20px; font-weight: 900;">@${username}</p>
          </div>

          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">You are now fully authorized to share timeline updates, post picture attachments, follow profiles, and jump right into our live WebSocket lounge spaces!</p>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://chloeishot.vercel.app" style="background-color: #f43f5e; color: white; font-weight: bold; text-decoration: none; padding: 12px 30px; border-radius: 12px; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(244,63,94,0.2);">
              ✨ Return to Dollspace Lounge
            </a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0 15px 0;" />
          <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 0;">Dollspace © 2026 • Live Network Operations</p>
        </div>
      `,
    });
  } catch (emailError) {
    // If an email delivery block happens, console log it but DO NOT crash the registration flow
    console.error("Resend delivery engine paused:", emailError);
  }

  // Bounce them smoothly to the fresh, beautiful pink login page layout to sign in
  redirect("/login");
}

// 2. Update loginUser to also use loose return mapping for the form action type bypass
export async function loginUser(prevState: any, formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  // 🚀 RETURN PLAIN ERROR OBJECTS INSTEAD OF BREAKING THE ROUTER REDIRECT
  if (!username || !password) {
    return { error: "Missing username or password fields." };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return { error: "Invalid username or password credentials." };
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return { error: "Invalid username or password credentials." };
  }

  // Generate cryptographic token
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });

  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  // Successful logins redirect smoothly straight to the feed
  redirect("/");

}// 3. UTILITY: Retrieve the currently validated user session from server components
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
