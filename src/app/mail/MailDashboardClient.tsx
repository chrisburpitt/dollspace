// src/app/mail/MailDashboardClient.tsx (PART 1 - COLLAPSIBLE MOBILE LAYOUT HOOKS)
"use client";

import { useState, useTransition } from "react";
import { sendInternalMail, toggleMailState } from "@/app/actions/mail";
import SubmitButton from "@/components/SubmitButton";

type FolderType = "INBOX" | "SENT" | "ARCHIVE" | "DELETED";
type MobileViewStage = "FOLDERS" | "MESSAGES" | "READING"; // 🚀 Tracks responsive view layers

export default function MailDashboardClient({ currentUser, initialMails, registeredUsers }: any) {
  const [activeFolder, setActiveFolder] = useState<FolderType>("INBOX");
  const [selectedMail, setSelectedMail] = useState<any>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [recipientInput, setRecipientInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 🚀 MOBILE ACTIVE DEPTH TRACKER: Dynamically controls column widths based on current selection layer
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
    setMobileStage("READING"); // 🚀 Advance to full text depth layer on click
    if (mail.recipientId === currentUser.id && !mail.isRead) {
      startTransition(async () => {
        await toggleMailState(mail.id, "MARK_READ");
      });
    }
  };

  const handleFolderToggleClick = (folder: FolderType) => {
    setActiveFolder(folder);
    setSelectedMail(null);
    setMobileStage("MESSAGES"); // 🚀 Collapse to message preview feed layer
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
      
      {/* 📂 COLUMN A: FOLDERS NAVIGATION SELECTOR (Responsive fluid widths) */}
      <div 
        className={`bg-white flex flex-col justify-between shrink-0 p-3 transition-all duration-300 ${
          /* 📱 Mobile Accordion Config: Shifts between 66% width, icon list, and narrow icon list */
          mobileStage === "FOLDERS" 
            ? "w-[66%] lg:w-1/4" 
            : mobileStage === "MESSAGES"
              ? "w-[14%] lg:w-1/4 items-center px-1"
              : "w-[10%] lg:w-1/4 items-center px-1"
        }`}
      >
        <div className="space-y-1 w-full flex flex-col items-center">
          <button 
            onClick={() => {
              setRecipientInput("");
              setShowComposeModal(true);
            }} 
            className={`bg-rose-500 hover:bg-rose-600 text-white font-black text-xs py-3 rounded-xl transition shadow-sm mb-4 flex items-center justify-center gap-2 ${
              mobileStage === "FOLDERS" ? "w-full" : "w-10 h-10 p-0 rounded-full"
            }`}
            title="Compose Mail"
          >
            <span>📝</span>
            {mobileStage === "FOLDERS" && <span>Compose Mail</span>}
          </button>
          
          {(["INBOX", "SENT", "ARCHIVE", "DELETED"] as FolderType[]).map(folder => {
            const isSelected = activeFolder === folder;
            return (
              <button
                key={folder}
                onClick={() => handleFolderToggleClick(folder)}
                className={`text-left rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-3 ${
                  mobileStage === "FOLDERS" ? "w-full px-4 py-2.5" : "w-10 h-10 justify-center p-0"
                } ${
                  isSelected ? "bg-rose-50 text-rose-500 border border-rose-100" : "text-gray-500 hover:bg-gray-50"
                }`}
                title={folder}
              >
                <span className="text-sm">
                  {folder === "INBOX" && "📥"}
                  {folder === "SENT" && "🚀"}
                  {folder === "ARCHIVE" && "📦"}
                  {folder === "DELETED" && "🗑️"}
                </span>
                {mobileStage === "FOLDERS" && (
                  <span>
                    {folder === "INBOX" && "Inbox"}
                    {folder === "SENT" && "Sent Items"}
                    {folder === "ARCHIVE" && "Archive Box"}
                    {folder === "DELETED" && "Trash Bin"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Reset Shortcut Button */}
        {mobileStage !== "FOLDERS" && (
          <button 
            onClick={() => setMobileStage("FOLDERS")}
            className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 shadow-sm transition lg:hidden"
            title="Back to Folders"
          >
            📂
          </button>
        )}
      </div>

      {/* 📬 COLUMN B: MAIL MESSAGES STREAM FEED (Collapses when reading text) */}
      <div 
        className={`bg-gray-50/30 flex flex-col overflow-hidden transition-all duration-300 text-left ${
          mobileStage === "FOLDERS"
            ? "w-[34%] lg:w-1/3 border-r"
            : mobileStage === "MESSAGES"
              ? "w-[71%] lg:w-1/3"
              : "w-[15%] lg:w-1/3 items-center px-1"
        }`}
      >
        <div className={`p-4 border-b border-gray-100 bg-white font-black text-xs uppercase tracking-wider text-gray-400 truncate ${
          mobileStage !== "READING" ? "text-left px-4" : "text-center px-0 text-[10px]"
        }`}>
          {mobileStage !== "READING" ? `${activeFolder} Messages` : "✉️"}
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 w-full">
          {filteredMails.length === 0 ? (
            mobileStage !== "READING" && <p className="text-gray-400 text-xs italic py-10 text-center animate-fade-in">Empty 🌸</p>
          ) : (
            filteredMails.map((mail: any) => {
              const partner = mail.senderId === currentUser.id ? mail.recipient : mail.sender;
              const isUnreadInboxItem = mail.recipientId === currentUser.id && !mail.isRead;
              const isSelected = selectedMail?.id === mail.id;

              return (
                <button
                  key={mail.id}
                  onClick={() => handleMailItemSelect(mail)}
                  className={`w-full rounded-xl border transition flex flex-col gap-1 relative overflow-hidden ${
                    mobileStage === "READING" ? "p-2 items-center justify-center h-12" : "p-3 text-left"
                  } ${
                    isSelected 
                      ? "bg-rose-50/50 border-rose-200 shadow-sm" 
                      : isUnreadInboxItem ? "bg-white border-gray-200 font-bold" : "bg-white border-transparent hover:bg-gray-50/50"
                  }`}
                  title={mail.subject}
                >
                  {isUnreadInboxItem && mobileStage !== "READING" && (
                    <span className="absolute top-3.5 right-3 w-2 h-2 bg-rose-500 rounded-full"></span>
                  )}
                  
                  {mobileStage !== "READING" ? (
                    // Standard Text Layout block view
                    <>
                      <div className="flex justify-between items-center min-w-0">
                        <span className="text-xs font-black text-gray-900 truncate flex-1 pr-4">{partner.displayName}</span>
                        <span className="text-[9px] text-gray-400 font-bold shrink-0">{new Date(mail.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-700 truncate leading-tight">{mail.subject}</h4>
                      <p className="text-[11px] text-gray-400 line-clamp-1 leading-snug">{mail.body}</p>
                    </>
                  ) : (
                    // Compact stacked thumbnail view representation row
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border uppercase shrink-0 shadow-sm ${
                      isSelected ? "bg-rose-500 text-white border-rose-600" : "bg-white text-gray-700 border-gray-200"
                    }`}>
                      {partner.displayName.charAt(0)}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Mobile Stage Step-Back Control Node */}
        {mobileStage === "READING" && (
          <button 
            onClick={() => setMobileStage("MESSAGES")}
            className="mx-auto my-3 w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-xs font-bold shadow-sm transition lg:hidden"
            title="Back to Messages"
          >
            ⬅️
          </button>
        )}
      </div>

      {/* 📖 COLUMN C: MAIL DOCUMENT READING PANEL CANVAS (Expands to maximize text focus) */}
      <div 
        className={`bg-white flex flex-col overflow-hidden text-left transition-all duration-300 ${
          mobileStage === "FOLDERS"
            ? "w-0 lg:flex-1 opacity-0 lg:opacity-100"
            : mobileStage === "MESSAGES"
              ? "w-[15%] lg:flex-1 cursor-pointer border-l bg-gray-50/20 hover:bg-gray-50/60"
              : "w-[75%] lg:flex-1"
        }`}
        onClick={() => mobileStage === "MESSAGES" && selectedMail && setMobileStage("READING")}
      >
        {selectedMail ? (
          mobileStage === "MESSAGES" ? (
            /* 🚀 MOBILE STEP-IN PREVIEW TRIGGER HUD: Displays a preview stack icon indicator on mobile width columns */
            <div className="flex-1 flex flex-col items-center justify-center p-2 text-center h-full lg:hidden animate-pulse">
              <span className="text-xl block">📖</span>
              <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider vertical-text mt-2 block">Read</span>
            </div>
          ) : (
            /* Main Content Reading Node Document Workspace Block */
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 animate-fade-in w-full">
              <div className="flex items-start justify-between border-b border-gray-100 pb-4 w-full">
                <div className="min-w-0 flex-1 pr-4">
                  <h3 className="text-lg font-black text-gray-900 leading-snug break-words">{selectedMail.subject}</h3>
                  <p className="text-xs text-gray-400 mt-1 font-semibold truncate">
                    From: <strong className="text-gray-700">@{selectedMail.sender.username}</strong> to <strong className="text-gray-700">@{selectedMail.recipient.username}</strong>
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {activeFolder !== "ARCHIVE" && activeFolder !== "DELETED" && (
                    <button onClick={() => handleArchiveClick(selectedMail.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition uppercase tracking-wider">Archive</button>
                  )}
                  {activeFolder !== "DELETED" && (
                    <button onClick={() => handleDeleteClick(selectedMail.id)} className="bg-red-50 hover:bg-red-100 text-red-500 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition uppercase tracking-wider">Delete</button>
                  )}
                </div>
              </div>

              <div className="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50/40 p-4 rounded-2xl border border-gray-100 min-h-[150px] select-text break-words">
                {selectedMail.body}
              </div>

              {selectedMail.attachments && selectedMail.attachments.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">📷 Attached Postal Media Assets ({selectedMail.attachments.length})</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedMail.attachments.map((pic: any) => (
                      <a key={pic.id} href={pic.url} target="_blank" rel="noreferrer" className="aspect-video bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:opacity-95 transition block">
                        <img src={pic.url} alt="" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          /* Empty baseline layout view fallback rows */
          mobileStage !== "FOLDERS" && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
              <span className="text-3xl mb-1">💌</span>
              <p className="font-bold text-xs uppercase tracking-wider">No Selection</p>
            </div>
          )
        )}
      </div>

      {/* MODAL COMPOSE MAIL WIDGET FORM WITH SUGGESTIONS DROP WINDOW */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            action={async (formData) => {
              const res = await sendInternalMail(formData);
              if (res?.success) {
                setShowComposeModal(false);
                setRecipientInput("");
                alert("🌸 Email Sent!!");
              } else if (res?.error) {
                alert(res.error);
              }
            }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl max-w-md w-full space-y-4 text-left overflow-visible"
          >
            <h4 className="font-black text-base text-gray-900 uppercase tracking-wide">Create Mail</h4>
            
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
                className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none" 
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
              <input type="text" name="subject" required placeholder="e.g. Secret Outfit Preview Thoughts 🩰" className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Rich Content Body</label>
              <textarea name="body" rows={4} required placeholder="Type your rich text message parameters directly here..." className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none resize-none leading-relaxed" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 cursor-pointer hover:text-rose-500 transition bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 border-dashed text-center block">
                <span>📷 Attach Media Photos (Max 3)</span>
                <input type="file" name="attachments" accept="image/*" multiple className="hidden" />
              </label>
            </div>
            <div className="flex space-x-2 pt-2">
              <button type="button" onClick={() => setShowComposeModal(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold p-2.5 rounded-xl text-xs">Cancel</button>
              <SubmitButton label="Send 🚀" loadingLabel="Piping Asset Buffer..." className="flex-1 bg-rose-500 text-white font-black p-2.5 rounded-xl text-xs shadow-sm" />
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
