import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";

/**
 * ChatDrawer
 * Props:
 *   open        – boolean
 *   onClose     – () => void
 *   helper      – helper object (id, name, avatar/avatarSrc, category)
 *   currentUser – user object from AuthContext (id, name, avatar)
 *   avatarSrc   – resolved avatar URL for the helper
 */
export default function ChatDrawer({ open, onClose, helper, currentUser, avatarSrc }) {
  const storageKey = `chat_${currentUser?.id ?? "guest"}_${helper?.id}`;

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load messages from localStorage when drawer opens
  useEffect(() => {
    if (!open || !helper) return;
    try {
      const saved = localStorage.getItem(storageKey);
      setMessages(saved ? JSON.parse(saved) : []);
    } catch {
      setMessages([]);
    }
  }, [open, storageKey]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    }
  }, [messages, open]);

  // Focus input when drawer opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const saveMessages = (msgs) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(msgs));
    } catch {}
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;

    const msg = {
      id: Date.now(),
      text,
      senderId: currentUser?.id ?? "guest",
      senderName: currentUser?.name ?? "You",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = [...messages, msg];
    setMessages(updated);
    saveMessages(updated);
    setDraft("");

    // Simulate a reply after a short delay
    setTimeout(() => {
      const replies = [
        `Hi! Thanks for reaching out. I'll get back to you shortly.`,
        `Hello! Yes, I'm available. When do you need help?`,
        `Thanks for your message! Can you tell me more about what you need?`,
        `Sure, I can help with that! What's your location?`,
        `Got it! Let me check my schedule and I'll confirm soon.`,
      ];
      const reply = {
        id: Date.now() + 1,
        text: replies[Math.floor(Math.random() * replies.length)],
        senderId: `helper_${helper.id}`,
        senderName: helper.name,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      const withReply = [...updated, reply];
      setMessages(withReply);
      saveMessages(withReply);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(storageKey);
  };

  if (!helper) return null;

  const isMe = (msg) => msg.senderId === (currentUser?.id ?? "guest");

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — clicking closes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[55]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm sm:max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[60] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div className="relative flex-shrink-0">
                <img
                  src={avatarSrc}
                  alt={helper.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 ring-2 ring-white dark:ring-gray-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {helper.name}
                </p>
                <p className="text-xs text-green-500 font-medium">Active now</p>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="text-xs text-gray-400 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center pb-10">
                  <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                    <MessageCircle size={26} strokeWidth={1.5} className="text-blue-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Start a conversation
                  </p>
                  <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                    Send {helper.name} a message about your job.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const mine = isMe(msg);
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar — only for helper messages */}
                      {!mine && (
                        <img
                          src={avatarSrc}
                          alt={helper.name}
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-0.5"
                        />
                      )}

                      <div className={`flex flex-col gap-0.5 max-w-[75%] ${mine ? "items-end" : "items-start"}`}>
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            mine
                              ? "bg-blue-600 text-white rounded-br-sm"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-gray-400 px-1">{msg.timestamp}</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
              {!currentUser ? (
                <p className="text-xs text-center text-gray-400 py-2">
                  You must be logged in to send messages.
                </p>
              ) : (
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${helper.name}...`}
                    rows={1}
                    className="flex-1 text-sm px-3.5 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all resize-none max-h-28 overflow-y-auto"
                    style={{ lineHeight: "1.5" }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!draft.trim()}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white disabled:text-gray-400 transition-all active:scale-90 flex-shrink-0"
                  >
                    <Send size={16} strokeWidth={2.25} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}