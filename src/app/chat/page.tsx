// This is a Server Component by default, which is great for SEO and speed!
import ChatStatus from "@/app/chat/ChatStatus.tsx"; 

export default function HomePage() {
  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to DollSpace chat</h1>
      <p className="text-gray-600 mb-6">
        This part of the page is rendered instantly by the server.
      </p>

      {/* 
        We place our PartySocket component right here. 
        It will gracefully wait for hydration before opening the live connection.
      */}
      <ChatStatus />

      <footer className="mt-8 text-sm text-gray-400">
        © 2026 Dollspace
      </footer>
    </main>
  );
}
