// src/app/login/page.tsx
"use client";

import { useActionState, Suspense } from "react"; // 🚀 1. IMPORT SUSPENSE NATIVELY
import { loginUser, registerUser } from "@/app/actions/auth";
import SubmitButton from "@/components/SubmitButton";
import { useSearchParams, useRouter } from "next/navigation";

function AuthFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isRegisterMode = searchParams.get("mode") === "register";

  const [state, formAction] = useActionState(
    isRegisterMode ? registerUser : loginUser,
    null
  );

  if (state?.success && isRegisterMode) {
    return (
      <div className="max-w-md w-full bg-white border border-rose-100 p-8 rounded-3xl shadow-xl text-center animate-scale-up">
        {/* Celebration Graphic Icon */}
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
          🌸
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
          Registration Successful!
        </h1>
        <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6">
          Your account has been securely created in the lounge. We have sent a welcome message straight to your inbox.
        </p>

        {/* Dynamic Forwarding Continue Button Trigger */}
        <button
          onClick={() => {
            // Smoothly takes them back to the login view card frame and drops the query flags
            router.push("/login");
          }}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold p-3 rounded-xl transition shadow-sm text-sm"
        >
          Continue to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-white border border-rose-100 p-8 rounded-3xl shadow-md hover:shadow-lg transition duration-300">
      <h1 className="text-4xl font-black tracking-tight text-rose-500 text-center mb-1">
        Dollspace
      </h1>
      <h2 className="text-sm font-bold text-center text-gray-400 uppercase tracking-wider mb-6">
        {isRegisterMode ? "Create your unique profile" : "Log into your account"}
      </h2>

      {state?.error && (
        <div className="p-3 bg-red-50 text-red-700 font-semibold text-xs rounded-xl mb-4 border border-red-100 animate-fade-in text-center">
          ❌ {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 tracking-wider">
            Username
          </label>
          <input 
            type="text" 
            name="username" 
            required 
            className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition" 
            placeholder="e.g. Chloe" 
          />
        </div>

        {isRegisterMode && (
          <>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 tracking-wider">
                Email Address
              </label>
              <input 
                type="email" 
                name="email" 
                required 
                className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition" 
                placeholder="chloe@example.com" 
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 tracking-wider">
                Display Name
              </label>
              <input 
                type="text" 
                name="displayName" 
                required 
                className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition" 
                placeholder="e.g. Chloe Smith" 
              />
            </div>
          </>
        )}

        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 tracking-wider">
            Password
          </label>
          <input 
            type="password" 
            name="password" 
            required 
            className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition" 
            placeholder="••••••••" 
          />
        </div>

        <SubmitButton 
          label={isRegisterMode ? "Sign Up" : "Log In"} 
          loadingLabel={isRegisterMode ? "Creating Account..." : "Verifying Secure Token..."}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold p-3 rounded-xl transition shadow-sm mt-2 text-sm"
        />
      </form>

      <div className="mt-6 text-center text-xs font-bold border-t border-gray-100 pt-4">
        {isRegisterMode ? (
          <p className="text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-rose-500 hover:underline">
              Log in here
            </a>
          </p>
        ) : (
          <p className="text-gray-400">
            New to Dollspace?{" "}
            <a href="/login?mode=register" className="text-rose-500 hover:underline">
              Create an account
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-rose-50/30 flex items-center justify-center p-6 text-gray-900">
      <Suspense fallback={
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-rose-100 shadow-md flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-4">Loading Dollspace...</p>
        </div>
      }>
        <AuthFormContent />
      </Suspense>
    </div>
  );
}
