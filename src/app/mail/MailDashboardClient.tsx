// src/app/mail/MailDashboardClient.tsx (PART 1 - RESPONSIVE CONTAINER OVERRIDES)
"use client";

import { useState, useTransition } from "react";
import { sendInternalMail, toggleMailState } from "@/app/actions/mail";
import SubmitButton from "@/components/SubmitButton";

type FolderType = "INBOX" | "SENT" | "ARCHIVE" | "DELETED";
type MobileViewStage = "FOLDERS" | "MESSAGES" | "READING" | "COMPOSE"; // Added COMPOSE view mode

export default function MailDashboardClient({ currentUser, initialMails, registeredUsers }: any) {
  const [activeFolder, setActiveFolder] = useState<FolderType>("INBOX");
  const [selectedMail, setSelectedMail] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const [recipientInput, setRecipientInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 🚀 COLLAPSIBLE CONTROLLER STATE: Keeps structural alignment separate on mobile viewports
  const [mobileStage, setMobileStage] = useState<MobileViewStage>("FOLDERS");

  // 🚀 FOLDER ROUTER FILTER: Segregates mails precisely based on independent folder states
  const filteredMails = initialMails.filter((mail: any) => {
    const isSender = mail.senderId === currentUser.id;
    const isRecipient = mail.recipientId === currentUser.id;

    if (activeFolder === "INBOX") {
      return isRecipient && !mail.recipientArchived && !mail.recipientDeleted;
    }
    if (activeFolder === "SENT") {
      return isSender && !mail.senderArchived && !mail.senderDeleted;
    }
    if (activeFolder === "ARCHIVE") {
      if (isSender && mail.senderArchived && !mail.senderDeleted) return true;
      if (isRecipient && mail.recipientArchived && !mail.recipientDeleted) return true;
      return false;
    }
    if (activeFolder === "DELETED") {
      if (isSender && mail.senderDeleted) return true;
      if (isRecipient && mail.recipientDeleted) return true;
      return false;
    }
    return false;
  });

  const filteredUserSuggestions = recipientInput.trim() === "" 
    ? [] 
    : registeredUsers.filter((u: any) => 
        u.username.toLowerCase().includes(recipientInput.toLowerCase()) ||
        u.displayName.toLowerCase().includes(recipientInput.toLowerCase())
      ).slice(0, 5);

  const handleMailItemSelect = (mail: any) => {
    setSelectedMail(mail);
    setMobileStage("READING"); 
    if (mail.recipientId === currentUser.id && !mail.isRead) {
      startTransition(async () => {
        await toggleMailState(mail.id, "MARK_READ");
      });
    }
  };

  const handleFolderToggleClick = (folder: FolderType) => {
    setActiveFolder(folder);
    setSelectedMail(null);
    setMobileStage("MESSAGES"); 
  };

  const handleArchiveClick = (mailId: string) => {
    startTransition(async () => {
      await toggleMailState(mailId, "ARCHIVE");
      setSelectedMail(null);
      setMobileStage("MESSAGES");
    });
  };

  const handleDeleteClick = (mailId: string) => {
    startTransition(async () => {
      await toggleMailState(mailId, "DELETE");
      setSelectedMail(null);
      setMobileStage("MESSAGES");
    });
  };

  return (
    <div className="flex h-full divide-x divide-gray-200 select-none w-full relative overflow-hidden">
      
      {/* 📥 COLUMN A: FOLDERS SIDEBAR NAVIGATION (Forces wide layout locks on desktop displays) */}
      <div 
        className={`bg-white flex flex-col justify-between shrink-0 p-3 transition-all duration-300 lg:w-1/4 lg:px-3 lg:items-start ${
          mobileStage === "FOLDERS" 
            ? "w-[66%]" 
            : mobileStage === "MESSAGES"
              ? "w-[14%] items-center px-1"
              : "w-[10%] items-center px-1"
        }`}
      >
        <div className="space-y-1 w-full flex flex-col items-center lg:items-start">
          <button 
            type="button"
            onClick={() => {
              setRecipientInput("");
              setMobileStage("COMPOSE"); // Switches canvas directly into full-page compose view mode
            }} 
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-xs py-3 rounded-xl transition shadow-sm mb-4 flex items-center justify-center gap-2"
            title="Compose Mail"
          >
            <span>📝</span>
            <span className={`lg:inline ${mobileStage === "FOLDERS" ? "inline" : "hidden"}`}>Compose Mail</span>
          </button>
          
          {(["INBOX", "SENT", "ARCHIVE", "DELETED"] as FolderType[]).map(folder => {
            const isSelected = activeFolder === folder;
            return (
              <button
                key={folder}
                type="button"
                onClick={() => handleFolderToggleClick(folder)}
                className={`text-left rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-3 lg:w-full lg:px-4 lg:py-2.5 lg:justify-start ${
                  mobileStage === "FOLDERS" ? "w-full px-4 py-2.5 justify-start" : "w-10 h-10 p-0 justify-center"
                } ${
                  isSelected ? "bg-rose-50 text-rose-500 border border-rose-100" : "text-gray-500 hover:bg-gray-50"
                }`}
                title={folder}
              >
                <span className="text-sm shrink-0">
                  {folder === "INBOX" && "📥"}
                  {folder === "SENT" && "🚀"}
                  {folder === "ARCHIVE" && "📦"}
                  {folder === "DELETED" && "🗑️"}
                </span>
                <span className={`lg:inline ${mobileStage === "FOLDERS" ? "inline" : "hidden"}`}>
                  {folder === "INBOX" && "Inbox"}
                  {folder === "SENT" && "Sent Items"}
                  {folder === "ARCHIVE" && "Archive Box"}
                  {folder === "DELETED" && "Trash Bin"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile View Navigation Recovery Controller */}
        {mobileStage !== "FOLDERS" && (
          <button 
            type="button"
            onClick={() => setMobileStage("FOLDERS")}
            className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 shadow-sm transition lg:hidden"
            title="Back to Folders"
          >
            📂
          </button>
        )}
      </div>


      {/* 📬 COLUMN B: MAIL MESSAGES STREAM FEED (Forces wide layout dimensions on desktop screens) */}
      <div 
        className={`bg-gray-50/30 flex flex-col overflow-hidden transition-all duration-300 text-left lg:w-1/3 border-r ${
          mobileStage === "FOLDERS"
            ? "w-[34%]"
            : mobileStage === "MESSAGES"
              ? "w-[71%]"
              : mobileStage === "COMPOSE"
                ? "w-0 border-r-0 opacity-0 hidden lg:flex lg:w-1/3 lg:opacity-100"
                : "w-[15%] items-center px-1"
        }`}
      >
        <div className={`p-4 border-b border-gray-100 bg-white font-black text-xs uppercase tracking-wider text-gray-400 truncate lg:text-left lg:px-4 ${
          mobileStage !== "READING" && mobileStage !== "COMPOSE" ? "text-left px-4" : "text-center px-0 text-[10px]"
        }`}>
          {(mobileStage !== "READING" && mobileStage !== "COMPOSE") ? `${activeFolder} Messages` : "✉️"}
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 w-full">
          {filteredMails.length === 0 ? (
            mobileStage !== "READING" && mobileStage !== "COMPOSE" && <p className="text-gray-400 text-xs italic py-10 text-center animate-fade-in">Empty 🌸</p>
          ) : (
            filteredMails.map((mail: any) => {
              const partner = mail.senderId === currentUser.id ? mail.recipient : mail.sender;
              const isUnreadInboxItem = mail.recipientId === currentUser.id && !mail.isRead;
              const isSelected = selectedMail?.id === mail.id;

              return (
                <button
                  key={mail.id}
                  type="button"
                  onClick={() => handleMailItemSelect(mail)}
                  className={`w-full rounded-xl border transition flex flex-col gap-1 relative overflow-hidden lg:p-3 lg:text-left ${
                    mobileStage === "READING" || mobileStage === "COMPOSE" ? "p-2 items-center justify-center h-12" : "p-3 text-left"
                  } ${
                    isSelected 
                      ? "bg-rose-50/50 border-rose-200 shadow-sm" 
                      : isUnreadInboxItem ? "bg-white border-gray-200 font-bold" : "bg-white border-transparent hover:bg-gray-50/50"
                  }`}
                  title={mail.subject}
                >
                  {isUnreadInboxItem && mobileStage !== "READING" && mobileStage !== "COMPOSE" && (
                    <span className="absolute top-3.5 right-3 w-2 h-2 bg-rose-500 rounded-full"></span>
                  )}
                  
                  {/* 🚀 DESKTOP LOCKOUT FIX: Forces regular textual lines on desktop layouts */}
                  <div className={`lg:block ${mobileStage === "READING" || mobileStage === "COMPOSE" ? "hidden" : "block"}`}>
                    <div className="flex justify-between items-center min-w-0">
                      <span className="text-xs font-black text-gray-900 truncate flex-1 pr-4">{partner.displayName}</span>
                      <span className="text-[9px] text-gray-400 font-bold shrink-0">{new Date(mail.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-700 truncate leading-tight">{mail.subject}</h4>
                    <p className="text-[11px] text-gray-400 line-clamp-1 leading-snug">{mail.body}</p>
                  </div>

                  {/* Icon Thumbnail visible ONLY during extreme compressed mobile reading stage */}
                  <div className={`lg:hidden ${mobileStage === "READING" || mobileStage === "COMPOSE" ? "block" : "hidden"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border uppercase shrink-0 shadow-sm ${
                      isSelected ? "bg-rose-500 text-white border-rose-600" : "bg-white text-gray-700 border-gray-200"
                    }`}>
                      {partner.displayName.charAt(0)}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Mobile View Step-Back Trigger Container Control Node */}
        {(mobileStage === "READING" || mobileStage === "COMPOSE") && (
          <button 
            type="button"
            onClick={() => setMobileStage("MESSAGES")}
            className="mx-auto my-3 w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-xs font-bold shadow-sm transition lg:hidden"
            title="Back to Messages"
          >
            ⬅️
          </button>
        )}
      </div>


      {/* 📖 COLUMN C: MAIN FULL CONSOLE DISPLAY CANVAS (Forces flat flex layouts on desktop view displays) */}
      <div 
        className={`bg-white flex flex-col overflow-hidden text-left transition-all duration-300 lg:flex-1 lg:w-auto lg:opacity-100 lg:block ${
          mobileStage === "FOLDERS"
            ? "w-0 opacity-0 hidden lg:block"
            : mobileStage === "MESSAGES"
              ? "w-[15%] cursor-pointer border-l bg-gray-50/20 hover:bg-gray-50/60 hidden lg:block"
              : "w-[75%]"
        }`}
      >
        {/* VIEW ARCHITECTURE CONFIG A: FULL PAGE INLINE COMPOSE DIALOGUE MATRIX CONTAINER */}
        {mobileStage === "COMPOSE" ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 animate-fade-in w-full h-full max-w-2xl mx-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h4 className="font-black text-base text-gray-900 uppercase tracking-wide">Create New Mail</h4>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Internal Postal Broadcast</p>
              </div>
              <button 
                type="button"
                onClick={() => setMobileStage("MESSAGES")} 
                className="text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl transition"
              >
                Close View ❌
              </button>
            </div>

            <form
              action={async (formData) => {
                const res = await sendInternalMail(formData);
                if (res?.success) {
                  setRecipientInput("");
                  setMobileStage("MESSAGES");
                  alert("🌸 Email Sent!!");
                } else if (res?.error) {
                  alert(res.error);
                }
              }}
              className="space-y-4 w-full text-left overflow-visible"
            >
              <div className="relative">
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">To (Recipient Username Handle)</label>
                <input 
                  type="text" 
                  name="recipientUsername" 
                  required 
                  value={recipientInput}
                  onChange={(e) => {
                    setRecipientInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => { setTimeout(() => setShowSuggestions(false), 200); }}
                  placeholder="Type name or handle... e.g. Chloe" 
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition" 
                  autoComplete="off"
                />

                {showSuggestions && filteredUserSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 mt-1 overflow-hidden divide-y divide-gray-50 animate-scale-up">
                    {filteredUserSuggestions.map((u: any) => (
                      <button
                        key={u.username}
                        type="button"
                        onClick={() => {
                          setRecipientInput(u.username);
                          setShowSuggestions(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-rose-50 hover:text-rose-500 transition flex items-center justify-between"
                      >
                        <span>{u.displayName}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">@{u.username}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Subject</label>
                <input type="text" name="subject" required placeholder="e.g. Secret Outfit Preview Thoughts 🩰" className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Rich Content Body</label>
                <textarea name="body" rows={6} required placeholder="Type your rich text message parameters directly here..." className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs font-semibold focus:outline-none resize-none leading-relaxed focus:ring-2 focus:ring-rose-400 focus:bg-white transition" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 cursor-pointer hover:text-rose-500 transition bg-gray-50 px-3 py-3 rounded-xl border border-gray-200 border-dashed text-center block">
                  <span>📷 Attach Media Photos (Max 3)</span>
                  <input type="file" name="attachments" accept="image/*" multiple className="hidden" />
                </label>
              </div>
              <div className="pt-2">
                <SubmitButton label="Send Internal Mail 🚀" loadingLabel="Piping Asset Buffer..." className="w-full bg-rose-500 text-white font-black py-3.5 rounded-xl text-xs shadow-sm" />
              </div>
            </form>
          </div>
        ) : selectedMail ? (
          /* VIEW ARCHITECTURE CONFIG B: STANDARD MAIL MESSAGE DOCUMENT READING WORKSPACE */
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 animate-fade-in w-full h-full">
            
            {/* 🚀 FIXED HEADING: Forced 'w-full block text-left' to clear out all vertical title squeeze formatting glitches! */}
            <div className="w-full block text-left border-b border-gray-100 pb-4 relative">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 w-full">
                <div className="w-full text-left min-w-0">
                  <h3 className="text-xl font-black text-gray-900 leading-snug break-words tracking-tight w-full block text-left">
                    {selectedMail.subject}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1.5 font-semibold block text-left">
                    From: <strong className="text-gray-700">@{selectedMail.sender.username}</strong> to <strong className="text-gray-700">@{selectedMail.recipient.username}</strong>
                  </p>
                </div>
                
                <div className="flex gap-1 shrink-0 self-start mt-1">
                  {activeFolder !== "ARCHIVE" && activeFolder !== "DELETED" && (
                    <button type="button" onClick={() => handleArchiveClick(selectedMail.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition uppercase tracking-wider">Archive</button>
                  )}
                  {activeFolder !== "DELETED" && (
                    <button type="button" onClick={() => handleDeleteClick(selectedMail.id)} className="bg-red-50 hover:bg-red-100 text-red-500 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition uppercase tracking-wider">Delete</button>
                  )}
                </div>
              </div>
            </div>

            <div className="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50/40 p-5 rounded-2xl border border-gray-100 min-h-[150px] select-text break-words text-left w-full">
              {selectedMail.body}
            </div>

            {selectedMail.attachments && selectedMail.attachments.length > 0 && (
              <div className="space-y-1.5 mt-2 w-full block text-left">
                <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">📷 Attached Postal Media Assets ({selectedMail.attachments.length})</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedMail.attachments.map((pic: any) => (
                    <a key={pic.id} href={pic.url} target="_blank" rel="noreferrer" className="aspect-video bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:opacity-95 transition block">
                      <img src={pic.url} alt="" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Standard fallback workspace card dashboard */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 h-full">
            <span className="text-4xl mb-2">💌</span>
            <p className="font-bold text-xs uppercase tracking-wider">No Message Selected</p>
            <p className="text-[11px] mt-0.5">Select an internal mail card folder to scan text details.</p>
          </div>
        )}
      </div>

    </div>
  );
}
