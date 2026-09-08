// src/app/login/page.tsx
import { loginUser, registerUser } from "@/app/actions/auth";

interface Props {
  searchParams: Promise<{ mode?: string; error?: string }>;
}

export default async function AuthPage({ searchParams }: Props) {
  const params = await searchParams;
  const isRegisterMode = params.mode === "register";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-gray-900">
      <div className="max-w-md w-full bg-white border border-gray-200 p-8 rounded-3xl shadow-sm">
        <h1 className="text-3xl font-black tracking-tight text-blue-600 text-center mb-2">Dollspace</h1>
        <h2 className="text-xl font-bold text-center text-gray-700 mb-6">
          {isRegisterMode ? "Create your unique profile" : "Log into your account"}
        </h2>

<form action={isRegisterMode ? registerUser : loginUser} className="space-y-4">
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Username</label>
    <input type="text" name="username" required className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Chloe" />
  </div>

  {/* NEW INTERACTIVE FIELD BLOCK INJECTED HERE */}
  {isRegisterMode && (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Email Address</label>
      <input type="email" name="email" required className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="chloe@example.com" />
    </div>
  )}

  {isRegisterMode && (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Display Name</label>
      <input type="text" name="displayName" required className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Chloe Smith" />
    </div>
  )}

  <div>
    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Password</label>
    <input type="password" name="password" required className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
  </div>

  <button type="submit" className="w-full bg-blue-600 text-white font-bold p-3 rounded-xl hover:bg-blue-700 transition shadow-sm mt-2">
    {isRegisterMode ? "Sign Up" : "Log In"}
  </button>
</form>

        <div className="mt-6 text-center text-sm">
          {isRegisterMode ? (
            <p className="text-gray-500">Already have an account? <a href="/login" className="text-blue-600 font-bold hover:underline">Log in here</a></p>
          ) : (
            <p className="text-gray-500">New to Dollspace? <a href="/login?mode=register" className="text-blue-600 font-bold hover:underline">Create an account</a></p>
          )}
        </div>
      </div>
    </div>
  );
}
