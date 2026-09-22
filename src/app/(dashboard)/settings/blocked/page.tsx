// src/app/settings/blocked/page.tsx (BLOCKED & IGNORED DOLLS BOARD)
import { getCurrentUser } from "@/app/actions/auth";
import { getPersonalBlockRoster, liftBlockRelationAction } from "@/app/actions/privacySettings";
import GlobalHeader from "@/components/GlobalHeader";
import SidebarNav from "@/components/SidebarNav";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dollspace | Blocked Users",
  description: "Review and manage your blocked or ignored doll connection restrictions.",
};

export default async function BlockedSettingsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const restrictionsList = await getPersonalBlockRoster();

  // Inline Client Action Handler Component passthrough wrapper
  async function handleLiftClick(formData: FormData) {
    "use server";
    const id = formData.get("relationId") as string;
    await liftBlockRelationAction(id);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
      <GlobalHeader currentUser={currentUser} />

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Side Navigation Menu Column */}
        <aside className="hidden lg:block lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          <SidebarNav currentUsername={currentUser.username} unreadMailCount={0} />
        </aside>

        {/* Center Panel Workspace Card */}
        <main className="col-span-1 lg:col-span-9 bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-sm text-left space-y-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-950 flex items-center gap-2">
              Privacy & <span className="text-rose-500">Block Control</span> 🔒
            </h1>
            <p className="text-xs font-semibold text-gray-400 mt-1">
              Manage your connections and restore chat access lines across Dollspace.
            </p>
          </div>

          <div className="border-t border-gray-100 pt-6">
            {restrictionsList.length === 0 ? (
              <div className="border border-dashed border-gray-200 p-16 rounded-2xl text-center text-gray-400">
                <span className="text-3xl block mb-2">🌸</span>
                <p className="font-black text-xs uppercase tracking-wider text-gray-400">Your burn book is empty 🔥</p>
                <p className="text-[11px] mt-0.5 font-medium">You haven't ignored or blocked any users on Dollspace yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {restrictionsList.map((item) => {
                  const isTempIgnore = item.type === "IGNORE";
                  
                  return (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition duration-300 animate-fade-in"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <img 
                          src={item.doll.avatarUrl || "/default-avatar.png"} 
                          className="w-10 h-10 rounded-full object-cover shadow-xs border border-gray-200 shrink-0" 
                        />
                        <div className="min-w-0 text-left">
                          <span className="font-black text-xs block text-gray-900 leading-tight">
                            {item.doll.displayName}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold block truncate">
                            @{item.doll.username}
                          </span>
                          
                          {/* Type Status Badges */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`font-black text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                              isTempIgnore ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                            }`}>
                              {isTempIgnore ? "⏳ Ignored (10m)" : "🚫 Blocked"}
                            </span>
                            {item.expiresAt && (
                              <span className="text-[9px] text-gray-400 font-medium">
                                Active temporary cooldown
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Restore Action Button Form */}
                      <form action={handleLiftClick}>
                        <input type="hidden" name="relationId" value={item.id} />
                        <button 
                          type="submit"
                          className="bg-white hover:bg-rose-50 text-gray-600 hover:text-rose-500 font-black px-4 py-2 border border-gray-200 hover:border-rose-200 rounded-xl text-[11px] uppercase tracking-wider transition shadow-xs cursor-pointer"
                        >
                          Restore Access ✨
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
