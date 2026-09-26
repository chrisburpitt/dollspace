// src/app/actions/auth.ts (PART 1 - SEAMLESS AUTH INDICATOR SYNCHRONIZATION)
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Resend } from "resend"; 

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-dollspace-key-12345";
const resend = new Resend(process.env.RESEND_API_KEY); 

// 🚀 1. REGISTRATION ACTION WITH AUTOMATED EMAIL ENGINE
// 🎯 UPDATE your registerUser implementation block inside src/app/actions/auth.ts:

export async function registerUser(prevState: any, formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const displayName = (formData.get("displayName") as string)?.trim();
  const password = formData.get("password") as string;

  // 🚀 EXTRACTION UNLOCK: Read your custom form payload elements from the network channel stream!
  const dateOfBirthRaw = formData.get("dateOfBirth") as string;
  const genderIdentity = (formData.get("genderIdentity") as string)?.trim();
  const location = (formData.get("location") as string)?.trim();

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

  // 🚀 TYPESAFE DATE BUFFER: Converts input date string tokens into strict database ISO timestamps
  let parsedBirthdayDateObj: Date | null = null;
  if (dateOfBirthRaw) {
    parsedBirthdayDateObj = new Date(dateOfBirthRaw);
  }

  // Write new record down into your Neon database tables with ALL custom metadata properties active!
  const newUser = await prisma.user.create({
    data: { 
      username, 
      email, 
      displayName, 
      passwordHash,
      // 🚀 DATABASE LINK MAPPINGS: Maps variables directly to match your EditProfileModal schema constraints!
      birthday: parsedBirthdayDateObj,
      genderIdentity: genderIdentity || "Cis woman",
      location: location || null,
      status: "ONLINE", // Automatically flag their landing status map state to active
    },
  });

  // DISPATCH THE TRANSACTION WELCOME EMAIL PIPELINE
  try {
    await resend.emails.send({
      from: "Dollspace <onboarding@resend.dev>", 
      to: email,
      subject: `🌸 Welcome to Dollspace, ${displayName}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ffe4e6; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
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
    console.error("Resend delivery engine paused:", emailError);
  }
  return { success: true };
}


// 🚀 2. LOGIN USER ACTION WITH DYNAMIC STATUS LEASE ACTIVATION
export async function loginUser(prevState: any, formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Missing username or password fields." };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return { error: "Invalid username or password credentials." };
  }

  if (user.isBanned) {
    return { error: `🚫 ACCESS DENIED: This account is currently banned. Reason: ${user.banReason || "Moderation rule violation"}\nPlease email chloeannabrookes@outlook.com to appeal this decision.` };
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return { error: "Invalid username or password credentials." };
  }

  // 🎯 THE FIX: Force their initial indicator column away from "OFFLINE" to "ONLINE" inside Neon PostgreSQL on successful authentication
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      status: "ONLINE",
      lastActive: new Date()
    }
  });

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

  redirect("/");
}


// src/app/actions/auth.ts (PART 2 - STICKY STATUS & ROUTER SECURITY RESCUE)

// 🚀 3. RETRIEVE CURRENT USER & ENFORCE STICKY REAL-TIME PARAMETERS
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
    if (!decoded || !decoded.userId) return null;

    // Fetch account attributes freshly from Neon with recent notification arrays pre-loaded
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        notificationsReceived: {
          include: { issuer: true },
          orderBy: { createdAt: "desc" },
          take: 15
        }
      }
    });

    if (!user) return null;

    // 🚨 ADMINISTRATIVE BAN GUARD CHECKS
    if (user.isBanned) {
      const headerList = await headers();
      const currentUrlPath = headerList.get("x-url") || headerList.get("referer") || "";
      
      console.warn(`Administrative Safeguard: Evicting restricted routing profile: @${user.username}`);

      // Stop redirect loops if they are already landing on the /banned route viewport
      if (currentUrlPath.includes("/banned")) {
        return user;
      }

      redirect("/banned");
    }

    // 🎯 THE STICKY STATUS RESOLUTION:
    // By returning the 'user' object directly without setting static token string overrides,
    // Next.js will faithfully read whatever status choice ("AWAY", "BUSY", "OFFLINE") is 
    // inside your database table row right now, keeping it perfectly locked on page swaps!
    return user;
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    
    console.error("Session verification token crashed:", error);
    return null;
  }
}

// 🚀 4. ACTION: Clear cookies and log out instantly
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  redirect("/login");
}
