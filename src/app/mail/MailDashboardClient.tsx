// src/app/mail/MailDashboardClient.tsx (PART 1 - THREE PIECE SPLIT)
"use client";

import { useState, useTransition } from "react";
import { sendInternalMail, toggleMailState } from "@/app/actions/mail";
import SubmitButton from "@/components/SubmitButton";

type FolderType = "INBOX" | "SENT" | "ARCHIVE" | "DELETED";

export default function MailDashboardClient({ currentUser, initialMails, registeredUsers }: any) {
  const [activeFolder, setActiveFolder] = useState<FolderType>("INBOX");
  const [selectedMail, setSelectedMail] = useState<any>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [recipientInput, setRecipientInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  // Autocomplete Filter Suggestions Matrix Mapping
  const filteredUserSuggestions = recipientInput.trim() === "" 
    ? [] 
    : registeredUsers.filter((u: any) => 
        u.username.toLowerCase().includes(recipientInput.toLowerCase()) ||
        u.displayName.toLowerCase().includes(recipientInput.toLowerCase())
      ).slice(0, 5);

  const handleMailItemSelect = (mail: any) => {
    setSelectedMail(mail);
    if (mail.recipientId === currentUser.id && !mail.isRead) {
      startTransition(async () => {
        await toggleMailState(mail.id, "MARK_READ");
      });
    }
  };

  const handleArchiveClick = (mailId: string) => {
    startTransition(async () => {
      await toggleMailState(mailId, "ARCHIVE");
      setSelectedMail(null);
    });
  };

  const handleDeleteClick = (mailId: string) => {
    startTransition(async () => {
      await toggleMailState(mailId, "DELETE");
      setSelectedMail(null);
    });
  };

  // src/app/mail/MailDashboardClient.tsx (PART 2 - THREE PIECE SPLIT)
  return (
    <div className="flex h-full divide-x divide-gray-200 select-none">
      
      {/* COLUMN A: Folders Selector Sidebar Column (1/4 Width) */}
      <div className="w-1/4 bg-white flex flex-col justify-between shrink-0 p-3 space-y-1">
        <div className="space-y-1">
          <button 
            onClick={() => {
              setRecipientInput("");
              setShowComposeModal(true);
            }} 
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-xs py-3 rounded-xl transition shadow-sm mb-4"
          >
            📝 Compose Mail
          </button>
          
          {(["INBOX", "SENT", "ARCHIVE", "DELETED"] as FolderType[]).map(folder => (
            <button
              key={folder}
              onClick={() => { setActiveFolder(folder); setSelectedMail(null); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeFolder === folder ? "bg-rose-50 text-rose-500 border border-rose-100" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {folder === "INBOX" && "📥 Inbox"}
              {folder === "SENT" && "🚀 Sent Items"}
              {folder === "ARCHIVE" && "📦 Archive Box"}
              {folder === "DELETED" && "🗑️ Trash Bin"}
            </button>
          ))}
        </div>
      </div>

      {/* COLUMN B: Mail Records Feed Selector item Row (1/3 Width) */}
      <div className="w-1/3 bg-gray-50/30 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-white font-black text-xs uppercase tracking-wider text-gray-400 text-left">
          {activeFolder} Messages List
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredMails.length === 0 ? (
            <p className="text-gray-400 text-xs italic py-10 text-center">Folder empty 🌸</p>
          ) : (
            filteredMails.map((mail: any) => {
              const partner = mail.senderId === currentUser.id ? mail.recipient : mail.sender;
              const isUnreadInboxItem = mail.recipientId === currentUser.id && !mail.isRead;

              return (
                <button
                  key={mail.id}
                  onClick={() => handleMailItemSelect(mail)}
                  className={`w-full p-3 rounded-xl border transition text-left flex flex-col gap-1 relative ${
                    selectedMail?.id === mail.id 
                      ? "bg-rose-50/50 border-rose-200 shadow-sm" 
                      : isUnreadInboxItem ? "bg-white border-gray-200 font-bold" : "bg-white border-transparent hover:bg-gray-50/50"
                  }`}
                >
                  {isUnreadInboxItem && <span className="absolute top-3.5 right-3 w-2 h-2 bg-rose-500 rounded-full"></span>}
                  <div className="flex justify-between items-center min-w-0">
                    <span className="text-xs font-black text-gray-900 truncate flex-1 pr-4">{partner.displayName}</span>
                    <span className="text-[9px] text-gray-400 font-bold shrink-0">{new Date(mail.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-700 truncate leading-tight">{mail.subject}</h4>
                  <p className="text-[11px] text-gray-400 line-clamp-1 leading-snug">{mail.body}</p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* src/app/mail/MailDashboardClient.tsx (PART 3 - THREE PIECE SPLIT) */}
      {/* COLUMN C: Mail Full Document Reading Canvas Pane */}
      <div className="flex-1 bg-white flex flex-col overflow-hidden text-left">
        {selectedMail ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 animate-fade-in">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 leading-snug">{selectedMail.subject}</h3>
                <p className="text-xs text-gray-400 mt-1 font-semibold">
                  From: <strong className="text-gray-700">@{selectedMail.sender.username}</strong> to <strong className="text-gray-700">@{selectedMail.recipient.username}</strong>
                </p>
              </div>
              <div className="flex space-x-1 shrink-0">
                {activeFolder !== "ARCHIVE" && activeFolder !== "DELETED" && (
                  <button onClick={() => handleArchiveClick(selectedMail.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition uppercase tracking-wider">Archive</button>
                )}
                {activeFolder !== "DELETED" && (
                  <button onClick={() => handleDeleteClick(selectedMail.id)} className="bg-red-50 hover:bg-red-100 text-red-500 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition uppercase tracking-wider">Delete</button>
                )}
              </div>
            </div>

            <div className="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50/40 p-4 rounded-2xl border border-gray-100 min-h-[150px]">
              {selectedMail.body}
            </div>

            {selectedMail.attachments && selectedMail.attachments.length > 0 && (
              <div className="space-y-1.5 mt-2">
                <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">📷 Attached Postal Media Assets ({selectedMail.attachments.length})</span>
                <div className="grid grid-cols-3 gap-2">
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
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <span className="text-4xl mb-2">💌</span>
            <p className="font-bold text-xs uppercase tracking-wider">No Message Selected</p>
            <p className="text-[11px] mt-0.5">Select an internal mail card folder to scan text details.</p>
          </div>
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
                alert("🌸 Internal rich postal mail dispatched perfectly!");
              } else if (res?.error) {
                alert(res.error);
              }
            }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl max-w-md w-full space-y-4 text-left overflow-visible"
          >
            <h4 className="font-black text-base text-gray-900 uppercase tracking-wide">Compose Internal Mail</h4>
            
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
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
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
              <textarea name="body" rows={5} required placeholder="Type your rich text message parameters directly here..." className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold focus:outline-none resize-none leading-relaxed" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 cursor-pointer hover:text-rose-500 transition bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 border-dashed text-center block">
                <span>📷 Attach Media Photos (Max 3)</span>
                <input type="file" name="attachments" accept="image/*" multiple className="hidden" />
              </label>
            </div>
            <div className="flex space-x-2 pt-2">
              <button type="button" onClick={() => setShowComposeModal(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold p-2.5 rounded-xl text-xs">Cancel</button>
              <SubmitButton label="Dispatch Mail 🚀" loadingLabel="Piping Asset Buffer..." className="flex-1 bg-rose-500 text-white font-black p-2.5 rounded-xl text-xs shadow-sm" />
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
