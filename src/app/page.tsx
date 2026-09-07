// src/app/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FeedForm from "@/components/FeedForm";
import PostControls from "@/components/PostControls";

export default async function Home() {
  const currentUser = await prisma.user.findUnique({
    where: { username: "Chloe" }
  });

  const feedPosts = await prisma.post.findMany({
    include: { 
      user: true,
      reactions: true 
    },
    orderBy: { createdAt: "desc" }
  });

  if (!currentUser) return <div className="p-10 text-center text-red-500">Run setup first!</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tight text-blue-600 hover:opacity-90">
            Dollspace
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-gray-500">Status: Local Engine</span>
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      {/* 2. Responsive Multi-Column Desktop Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Profile Sidebar (Takes 3 of 12 columns on desktop) */}
        <aside className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-sm" />
            ) : (
              <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-2xl uppercase shadow-sm">
                {currentUser.displayName.charAt(0)}
              </div>
            )}
            <h2 className="mt-4 font-black text-lg text-gray-900 leading-tight">{currentUser.displayName}</h2>
            <p className="text-gray-400 text-sm">@{currentUser.username}</p>
            <p className="mt-3 text-gray-600 text-sm line-clamp-2">{currentUser.bio || "No bio added yet."}</p>
            
            <Link 
              href={`/${currentUser.username}`} 
              className="mt-5 w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-bold text-center hover:bg-blue-700 transition shadow-sm"
            >
              View Full Profile
            </Link>
          </div>

          {/* Quick Navigation Panel */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hidden lg:block">
            <nav className="flex flex-col space-y-1">
              <Link href="/" className="px-4 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl text-sm transition">
                🏠 Home Feed
              </Link>
              <Link href={`/${currentUser.username}`} className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl text-sm transition">
                👤 My Profile
              </Link>
              <Link href="/api/setup-chloe" className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl text-sm transition">
                ⚙️ Run Setup Route
              </Link>
            </nav>
          </div>
        </aside>

        {/* CENTER COLUMN: The Core Feed Stream (Takes 6 of 12 columns) */}
        <main className="lg:col-span-6 space-y-6">
          {/* Interactive Form Component */}
          <FeedForm currentUser={currentUser} />

          {/* Timeline Feed Container */}
          <div className="space-y-4">
            {feedPosts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-400 font-medium">No updates posted yet.</p>
                <p className="text-gray-400 text-xs mt-1">Write your very first post above!</p>
              </div>
            ) : (
              feedPosts.map((post) => (
                <div key={post.id} className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition">
                  <div className="flex items-center space-x-3 mb-4">
                    {post.user.avatarUrl ? (
                      <img src={post.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                    ) : (
                      <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm uppercase">{post.user.displayName.charAt(0)}</div>
                    )}
                    <div>
                      <Link href={`/${post.user.username}`} className="font-bold text-gray-900 hover:underline block text-sm leading-tight">{post.user.displayName}</Link>
                      <span className="text-gray-400 text-xs">@{post.user.username}</span>
                    </div>
                  </div>
                  {post.content && <p className="text-gray-800 text-base whitespace-pre-wrap mb-4 leading-relaxed">{post.content}</p>}
                  
                  {post.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-gray-200 max-h-[450px] bg-gray-50 mt-2 mb-2">
                      <img src={post.imageUrl} alt="Attached post content" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <PostControls 
                    postId={post.id}
                    postOwnerId={post.userId}
                    currentUserId={currentUser.id}
                    reactions={post.reactions}
                  />
                </div>
              ))
            )}
          </div>
        </main>

        {/* RIGHT COLUMN: Info Dashboard Sidebar (Takes 3 of 12 columns) */}
        <aside className="lg:col-span-3 hidden lg:flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
          {/* Who to Follow Panel */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-black text-sm text-gray-900 tracking-wide uppercase mb-3">Suggested Connections</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full text-white flex items-center justify-center text-xs font-bold">G</div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 leading-tight">Guest Account</p>
                    <p className="text-[10px] text-gray-400">@Guest</p>
                  </div>
                </div>
                <button className="text-xs bg-gray-900 text-white font-bold px-3 py-1 rounded-lg hover:bg-gray-800 transition">
                  Follow
                </button>
              </div>
            </div>
          </div>

          {/* Social Stats Dashboard */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-black text-sm text-gray-900 tracking-wide uppercase mb-2">Platform Metrics</h3>
            <div className="text-xs space-y-2 text-gray-600 font-semibold">
              <div className="flex justify-between">
                <span>Total Stream Updates:</span>
                <span className="text-gray-900 font-bold">{feedPosts.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Database Engine:</span>
                <span className="text-blue-600 font-bold">SQLite Local</span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
