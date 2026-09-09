// src/app/login/page.tsx
import { loginUser, registerUser } from "@/app/actions/auth";
import SubmitButton from "@/components/SubmitButton";

interface Props {
  searchParams: Promise<{ mode?: string; error?: string }>;
}

export default async function AuthPage({ searchParams }: Props) {
  const params = await searchParams;
  const isRegisterMode = params.mode === "register";

  return (
    <div className="min-h-screen bg-rose-50/30 flex items-center justify-center p-6 text-gray-900">
      <div className="max-w-md w-full bg-white border border-rose-100 p-8 rounded-3xl shadow-md hover:shadow-lg transition duration-300">
        
        {/* Core Branded Title */}
        <h1 className="text-4xl font-black tracking-tight text-rose-500 text-center mb-1">
          Dollspace
        </h1>
        <h2 className="text-sm font-bold text-center text-gray-400 uppercase tracking-wider mb-6">
          {isRegisterMode ? "Create your unique profile" : "Log into your account"}
        </h2>

        {/* Dynamic Error Status Banner Box */}
        {params.error && (
          <div className="p-3 bg-red-50 text-red-700 font-semibold text-xs rounded-xl mb-4 border border-red-100 animate-fade-in">
            {decodeURIComponent(params.error)}
          </div>
        )}

        <form action={isRegisterMode ? registerUser : loginUser} className="space-y-4">
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

          {/* 🚀 ANIMATED SUBMIT ACTION BUTTON MOUNT POINT */}
          <SubmitButton 
            label={isRegisterMode ? "Sign Up" : "Log In"} 
            loadingLabel={isRegisterMode ? "Creating Account..." : "Verifying Secure Token..."}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold p-3 rounded-xl transition shadow-sm mt-2 text-sm"
          />
        </form>

        {/* Toggle Mode Footer Panels */}
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
    </div>
  );
}
