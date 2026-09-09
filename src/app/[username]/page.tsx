// src/app/[username]/page.tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import AvatarUpload from "@/components/AvatarUpload";
import PostControls from "@/components/PostControls";
import EditProfileModal from "@/components/EditProfileModal";
import GlobalHeader from "@/components/GlobalHeader";
import FollowButton from "@/components/FollowButton";
import PostComments from "@/components/PostComments";
import { getCurrentUser } from "@/app/actions/auth";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // 1. SECURE VISITOR SESSION CHECK
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login"); 

  // 2. FETCH PROFILE PAGE TARGET DATA
  const user = await prisma.user.findUnique({
    where: { username },
    include: { _count: { select: { followers: true, following: true } } }
  });

  if (!user) notFound();

  // 3. FETCH PROFILE POST HISTORY STREAM
  const userPosts = await prisma.post.findMany({
    where: { userId: user.id },
    include: { 
      user: true, 
      reactions: true,
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } }
    },
    orderBy: { createdAt: "desc" }
  });

  // 4. CHECK RELATIONSHIP FOLLOW MATRIX
  const isFollowingResult = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: sessionUser.id,
        followingId: user.id,
      },
    },
  });

  const isFollowing = !!isFollowingResult;
  const isOwner = user.id === sessionUser.id;

  const validatedHeaderUser = {
    id: sessionUser.id,
    status: sessionUser.status || "ONLINE"
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <GlobalHeader currentUser={validatedHeaderUser} />

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Sidebar Navigation Panel */}
        <aside className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <nav className="flex flex-col space-y-1">
              <Link href="/" className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl text-sm transition">
                🏠 Home Feed
              </Link>
              <Link 
                href={`/${sessionUser.username}`} 
                className={`px-4 py-2.5 font-bold rounded-xl text-sm transition ${
                  isOwner ? "bg-rose-50 text-rose-500" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                👤 My Profile
              </Link>
              <Link href="/chat" className="px-4 py-2.5 text-gray-600 hover:bg-rose-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition flex items-center space-x-2">
                <span>💬 Live Chatroom</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* CENTER COLUMN: Profile Deck Layout Canvas */}
        <main className="lg:col-span-6 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
              
              <AvatarUpload user={user} />

              <div className="flex-1 w-full">
                <div className="flex items-start justify-between w-full">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">{user.displayName}</h1>
                    <p className="text-gray-400 font-medium text-sm">@{user.username}</p>
                  </div>
                  
                  {isOwner ? (
                    <EditProfileModal user={user} />
                  ) : (
                    <FollowButton 
                      currentUserId={sessionUser.id} 
                      targetUserId={user.id} 
                      initialIsFollowing={isFollowing} 
                    />
                  )}
                </div>
                
                {/* 📊 VISUAL BIOGRAPHICAL DATA BADGES DECK */}
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  {user.age && <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600">🎂 {user.age} Years Old</span>}
                  {user.genderIdentity && <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600">⚧️ {user.genderIdentity}</span>}
                  {user.location && <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600">📍 {user.location}</span>}
                </div>

                {/* 🚀 CLEAN MATCHING INTERACTIVE LOOKING FOR MULTI-BADGES */}
                {user.lookingFor && user.lookingFor.trim().length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center mt-4">
                    <span className="text-[10px] uppercase font-bold text-gray-400">🔍 Looking For:</span>
                    {user.lookingFor.split(",").map((option) => {
                      const optionLabel = option.trim().replace(/_/g, ' ');
                      if (!optionLabel) return null;
                      return (
                        <span 
                          key={option} 
                          className="bg-rose-50 px-2.5 py-0.5 rounded-full text-[11px] font-black text-rose-500 uppercase tracking-wide border border-rose-100 shadow-sm"
                        >
                          {optionLabel}
                        </span>
                      );
                    })}
                  </div>
                )}

                <p className="mt-4 text-gray-600 leading-relaxed font-medium">
                  {user.bio || "Welcome to my Dollspace profile layout!"}
                </p>
                
                <div className="flex justify-center sm:justify-start space-x-6 mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500 font-medium">
                  <div><strong className="text-gray-900 font-bold">{user._count.following}</strong> Following</div>
                  <div><strong className="text-gray-900 font-bold">{user._count.followers}</strong> Followers</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-1">
            <h2 className="font-black text-lg text-gray-900">Updates by {user.displayName}</h2>
            <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{userPosts.length}</span>
          </div>

          {/* Timeline Loop Stream */}
          <div className="space-y-4">
            {userPosts.map((post) => (
              <div key={post.id} className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  {post.user.avatarUrl ? (
                    <img src={post.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-sm uppercase">{post.user.displayName.charAt(0)}</div>
                  )}
                  <div>
                    <span className="font-bold text-gray-900 block text-sm leading-tight">{post.user.displayName}</span>
                    <span className="text-gray-400 text-xs">@{post.user.username}</span>
                  </div>
                </div>
                {post.content && <p className="text-gray-800 text-base mb-4">{post.content}</p>}
                {post.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-gray-200 max-h-[450px] bg-gray-50 mb-2">
                    <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <PostControls postId={post.id} postOwnerId={post.userId} currentUserId={sessionUser.id} reactions={post.reactions} />
                
                <PostComments 
                  postId={post.id}
                  currentUserId={sessionUser.id}
                  comments={post.comments}
                />
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT COLUMN: Profile Insights Sidebar */}
        <aside className="lg:col-span-3 hidden lg:flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-black text-sm text-gray-900 tracking-wide uppercase mb-2">Profile Metrics</h3>
            <div className="text-xs space-y-2 text-gray-600 font-semibold">
              <div className="flex justify-between border-b border-gray-50 pb-1.5 mb-1.5">
                <span>Profile Views:</span>
                <span className="text-rose-500 font-black">👀 {user.views}</span>
              </div>
              <div className="flex justify-between">
                <span>Account Created:</span>
                <span className="text-gray-900 font-bold">{new Date(user.createdAt).toLocaleDateString('en-AU', { dateStyle: 'medium' })}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Posts Stored:</span>
                <span className="text-gray-900 font-bold">{userPosts.length}</span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
