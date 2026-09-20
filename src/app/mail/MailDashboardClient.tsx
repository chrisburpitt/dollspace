// src/app/mail/MailDashboardClient.tsx (PART 1 - FULL FIXED RESPONSIVE MATRIX)
"use client";

import { useState, useTransition } from "react";
import { sendInternalMail, toggleMailState } from "@/app/actions/mail";
import SubmitButton from "@/components/SubmitButton";

type FolderType = "INBOX" | "SENT" | "ARCHIVE" | "DELETED";
type MobileViewStage = "FOLDERS" | "MESSAGES" | "READING" | "COMPOSE";

export default function MailDashboardClient({ currentUser, initialMails, registeredUsers }: any) {
  const [activeFolder, setActiveFolder] = useState<FolderType>("INBOX");
  const [selectedMail, setSelectedMail] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const [recipientInput, setRecipientInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileStage, setMobileStage] = useState<MobileViewStage>("FOLDERS");

  // FOLDER ROUTER FILTER: Segregates mails precisely based on independent folder states
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

  return (
    <div className="flex h-full divide-x divide-gray-200 select-none w-full relative overflow-hidden">
      
      {/* 📥 COLUMN 1: FOLDERS NAVIGATION */}
      <div 
        className={`bg-white flex flex-col justify-between shrink-0 p-3 transition-all duration-300 lg:w-1/4 lg:p-3 lg:px-3 lg:items-start lg:flex ${
          mobileStage === "COMPOSE" || mobileStage === "READING"
            ? "w-[10%] items-center px-1" 
            : mobileStage === "FOLDERS" 
              ? "w-[66%] p-3" 
              : "w-[14%] items-center px-1"
        }`}
      >
        <div className="space-y-1 w-full flex flex-col items-center lg:items-start">
          <button 
            type="button"
            onClick={() => {
              setRecipientInput("");
              setMobileStage("COMPOSE"); 
            }} 
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-xs py-3 rounded-xl transition shadow-sm mb-4 flex items-center justify-center gap-2"
          >
            <span>📝</span>
            <span className={`lg:inline ${mobileStage === "FOLDERS" ? "inline" : "hidden"}`}>Compose</span>
          </button>
          
          {(["INBOX", "SENT", "ARCHIVE", "DELETED"] as FolderType[]).map(folder => (
            <button
              key={folder}
              type="button"
              onClick={() => {
                setActiveFolder(folder);
                setSelectedMail(null);
                setMobileStage("MESSAGES");
              }}
              className={`text-left rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-3 lg:w-full lg:px-4 lg:py-2.5 lg:justify-start ${
                mobileStage === "FOLDERS" ? "w-full px-4 py-2.5 justify-start" : "w-10 h-10 p-0 justify-center"
              } ${activeFolder === folder ? "bg-rose-50 text-rose-500 border border-rose-100" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <span className="text-sm shrink-0">
                {folder === "INBOX" && "📥"}
                {folder === "SENT" && "🚀"}
                {folder === "ARCHIVE" && "📦"}
                {folder === "DELETED" && "🗑️"}
              </span>
              <span className={`lg:inline ${mobileStage === "FOLDERS" ? "inline" : "hidden"}`}>
                {folder === "INBOX" && "Inbox"}
                {folder === "SENT" && "Sent"}
                {folder === "ARCHIVE" && "Archive"}
                {folder === "DELETED" && "Trash"}
              </span>
            </button>
          ))}
        </div>
      </div>


      {/* 📬 COLUMN 2: MESSAGES PREVIEW FEED LIST */}
      {/* 🚀 FIXED: Added 'mobileStage === "COMPOSE" ? "hidden w-0 p-0 opacity-0 border-r-0" : ...' to hide Column 2 globally on desktop and mobile when writing a mail */}
      <div 
        className={`bg-gray-50/30 flex flex-col overflow-hidden transition-all duration-300 text-left ${
          mobileStage === "COMPOSE"
            ? "hidden w-0 p-0 opacity-0 border-r-0" 
            : mobileStage === "READING"
              ? "w-[15%] lg:w-1/3 items-center lg:items-stretch px-1 lg:px-2 border-r"
              : mobileStage === "FOLDERS"
                ? "w-[34%] lg:w-1/3 border-r"
                : "w-[71%] lg:w-1/3 border-r"
        }`}
      >
        <div className={`p-4 border-b border-gray-100 bg-white font-black text-xs uppercase text-gray-400 truncate w-full shrink-0 ${
          mobileStage === "READING" ? "text-center lg:text-left lg:px-4" : "text-left px-4"
        }`}>
          {mobileStage === "READING" ? <span className="lg:hidden">✉️</span> : null}
          <span className={`lg:inline ${mobileStage === "READING" ? "hidden" : "inline"}`}>{activeFolder} Messages</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 w-full">
          {filteredMails.map((mail: any) => {
            const partner = mail.senderId === currentUser.id ? mail.recipient : mail.sender;
            const isUnreadInboxItem = mail.recipientId === currentUser.id && !mail.isRead;
            const isSelected = selectedMail?.id === mail.id;

            return (
              <button
                key={mail.id}
                type="button"
                onClick={() => handleMailItemSelect(mail)}
                className={`w-full rounded-xl border transition flex flex-col gap-1 relative overflow-hidden lg:p-3 lg:text-left ${
                  mobileStage === "READING" ? "p-2 items-center justify-center h-12 lg:h-auto lg:p-3 lg:text-left lg:items-start" : "p-3 text-left"
                } ${
                  isSelected 
                    ? "bg-rose-50/50 border-rose-200 shadow-sm" 
                    : isUnreadInboxItem ? "bg-white border-gray-200 font-bold" : "bg-white border-transparent hover:bg-gray-50/50"
                }`}
                title={mail.subject}
              >
                {isUnreadInboxItem && (mobileStage !== "READING" || isSelected) && (
                  <span className="absolute top-3.5 right-3 w-2 h-2 bg-rose-500 rounded-full lg:block"></span>
                )}
                
                {/* 🚀 FIXED: Added 'lg:block' so desktop view ALWAYS renders the rich full textual name layout details! */}
                <div className={`lg:block ${mobileStage === "READING" ? "hidden" : "block"}`}>
                  <div className="flex justify-between items-center min-w-0">
                    <span className="text-xs font-black text-gray-900 truncate flex-1 pr-4">{partner.displayName}</span>
                    <span className="text-[9px] text-gray-400 font-bold shrink-0">{new Date(mail.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-700 truncate leading-tight">{mail.subject}</h4>
                  <p className="text-[11px] text-gray-400 line-clamp-1 leading-snug">{mail.body}</p>
                </div>

                {/* Compressed avatar circle shown ONLY on mobile during active reading splits */}
                <div className={`lg:hidden ${mobileStage === "READING" ? "block" : "hidden"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border bg-white uppercase shrink-0 shadow-sm ${
                    isSelected ? "bg-rose-500 text-white border-rose-600" : "text-gray-700 border-gray-200"
                  }`}>
                    {partner.displayName.charAt(0)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile View Step-Back Controller Trigger Button */}
        {mobileStage === "READING" && (
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


      {/* 📖 COLUMN 3: TEXT MAIN AREA DISPLAY CANVAS PANEL */}
      {/* 🚀 FIXED: On desktop compose mode, it takes up the entire remaining space right next to the folder icons list (lg:flex-1) */}
      <div 
        className={`bg-white flex flex-col overflow-hidden text-left transition-all duration-300 lg:flex-1 ${
          mobileStage === "COMPOSE" 
            ? "w-[90%] lg:w-auto" 
            : mobileStage === "FOLDERS" 
              ? "w-0 hidden lg:block lg:w-auto" 
              : "w-[75%] lg:w-auto"
        }`}
      >
        {mobileStage === "COMPOSE" ? (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 animate-fade-in w-full h-full text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 w-full">
              <div className="text-left">
                <h4 className="font-black text-sm text-gray-900 uppercase tracking-wide">Create New Mail</h4>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Internal Broadcast Panel</p>
              </div>
              <button 
                type="button"
                onClick={() => setMobileStage("FOLDERS")} 
                className="text-[11px] font-black bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl transition"
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
              className="space-y-4 w-full text-left overflow-visible max-w-3xl"
            >
              <div className="w-full relative text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 text-left">To Recipient Handle</label>
                <input 
                  type="text" 
                  name="recipientUsername" 
                  required 
                  value={recipientInput}
                  onChange={(e) => { setRecipientInput(e.target.value); setShowSuggestions(true); }}
                  placeholder="Type handle... e.g. Chloe" 
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white transition text-left" 
                  autoComplete="off"
                />

                {showSuggestions && filteredUserSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 mt-1 overflow-hidden divide-y divide-gray-50 text-left">
                    {filteredUserSuggestions.map((u: any) => (
                      <button
                        key={u.username}
                        type="button"
                        onClick={() => { setRecipientInput(u.username); setShowSuggestions(false); }}
                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-rose-50 hover:text-rose-500 transition flex items-center justify-between"
                      >
                        <span>{u.displayName}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">@{u.username}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 text-left">Subject</label>
                <input type="text" name="subject" required placeholder="Subject text thoughts..." className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white transition text-left" />
              </div>
              
              <div className="w-full text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 text-left">Rich Content Body</label>
                <textarea name="body" rows={8} required placeholder="Type message data parameter values straight here..." className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs font-semibold focus:outline-none resize-none leading-relaxed focus:bg-white transition text-left" />
              </div>

              <div className="w-full">
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 cursor-pointer hover:text-rose-500 transition bg-gray-50 px-3 py-3 rounded-xl border border-gray-200 border-dashed text-center block w-full">
                  <span>📷 Attach Media Photos (Max 3)</span>
                  <input type="file" name="attachments" accept="image/*" multiple className="hidden" />
                </label>
              </div>

              <div className="pt-2 w-full">
                <SubmitButton label="Send Internal Mail 🚀" loadingLabel="Piping Asset Buffer..." className="w-full bg-rose-500 text-white font-black py-3.5 rounded-xl text-xs shadow-sm" />
              </div>
            </form>
          </div>
        ) : selectedMail ? (
          /* VIEW ARCHITECTURE CONFIG B: STANDARD MAIL MESSAGE DOCUMENT READING WORKSPACE */
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 animate-fade-in w-full h-full text-left">
            <div className="w-full block text-left border-b border-gray-100 pb-4 relative">
              <h3 className="text-lg font-black text-gray-900 leading-snug break-words tracking-tight w-full block text-left">
                {selectedMail.subject}
              </h3>
            </div>
            <div className="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50/40 p-4 rounded-2xl border border-gray-100 min-h-[150px] break-words text-left w-full select-text">
              {selectedMail.body}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 h-full">
            <span className="text-4xl block mb-2">💌</span>
            <p className="font-bold text-xs uppercase tracking-wider">Select a message card</p>
          </div>
        )}
      </div>

    </div>
  );
}