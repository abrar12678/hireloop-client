"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getConversations, getMessages, sendMessage } from "@/lib/api-client/messages";
import { MessageSquare, Send, ArrowLeft } from "lucide-react";

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

function formatRelativeTime(dateInput) {
  if (!dateInput) return "";
  const date = new Date(
    typeof dateInput === "object" && dateInput.$date
      ? dateInput.$date
      : dateInput
  );
  if (isNaN(date.getTime())) return "";
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 5) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${Math.floor(diffMonth / 12)}y ago`;
}

function formatMessageTime(dateInput) {
  if (!dateInput) return "";
  const date = new Date(
    typeof dateInput === "object" && dateInput.$date
      ? dateInput.$date
      : dateInput
  );
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ═══════════════════════════════════════════════════
   AVATAR COMPONENT
   ═══════════════════════════════════════════════════ */

function Avatar({ name, image, size = "md" }) {
  const sizeClasses = {
    sm: "w-8 h-8 text-[11px]",
    md: "w-10 h-10 text-[13px]",
    lg: "w-12 h-12 text-[15px]",
  };
  const cls = sizeClasses[size] || sizeClasses.md;

  if (image) {
    return (
      <div
        className={`${cls} rounded-full bg-[#3A3A40] flex items-center justify-center shrink-0 overflow-hidden`}
        aria-hidden="true"
      >
        <img src={image} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`${cls} rounded-full bg-[#3A3A40] flex items-center justify-center shrink-0 text-white font-semibold`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CONVERSATION LIST ITEM
   ═══════════════════════════════════════════════════ */

function ConversationItem({ conversation, active, onClick }) {
  const { partner, lastMessage, lastMessageAt, unreadCount } = conversation;
  const partnerName = partner?.name || "Unknown";
  const lastMsgPreview = lastMessage
    ? lastMessage.length > 40
      ? lastMessage.slice(0, 40) + "..."
      : lastMessage
    : "No messages yet";

  return (
    <button
      onClick={onClick}
      aria-label={`Open conversation with ${partnerName}`}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors duration-150 cursor-pointer ${
        active
          ? "bg-[#3A3A40]"
          : "hover:bg-white/[0.04]"
      }`}
    >
      <Avatar name={partnerName} image={partner?.image} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[14px] font-medium text-white truncate">
            {partnerName}
          </span>
          <span className="text-[12px] text-[#71717A] shrink-0">
            {formatRelativeTime(lastMessageAt)}
          </span>
        </div>
        <p className="text-[13px] text-[#A1A1AA] truncate mt-0.5">
          {lastMsgPreview}
        </p>
      </div>
      {unreadCount > 0 && (
        <span className="shrink-0 w-5 h-5 rounded-full bg-[#3B82F6] text-white text-[11px] font-bold flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   MESSAGE BUBBLE
   ═══════════════════════════════════════════════════ */

function MessageBubble({ message, isMine }) {
  const time = formatMessageTime(message.createdAt);

  return (
    <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} mb-3`}>
      <span className="text-[12px] text-[#71717A] mb-1 px-1">
        {isMine ? "You" : message.senderName || "Unknown"}
      </span>
      <div
        className={`max-w-[75%] px-4 py-2.5 ${
          isMine
            ? "bg-[#3B82F6] text-white rounded-[16px_16px_4px_16px]"
            : "bg-[#222228] text-white rounded-[16px_16px_16px_4px]"
        }`}
      >
        <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">
          {message.message}
        </p>
      </div>
      <span className="text-[11px] text-[#71717A] mt-1 px-1">{time}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   RECRUITER MESSAGES CONTENT (needs useSearchParams)
   ═══════════════════════════════════════════════════ */

function RecruiterMessagesContent() {
  const { data: session, isPending: authPending } = useSession();
  const user = session?.user;
  const searchParams = useSearchParams();
  const initialPartnerId = searchParams.get("partner");

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const initialAutoOpened = useRef(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const currentPartnerRef = useRef(null);

  /* ── Fetch conversations ── */
  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      if (Array.isArray(data)) {
        setConversations(data);
        return data;
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
    return [];
  }, []);

  /* ── Initial fetch + auto-open from ?partner= ── */
  useEffect(() => {
    if (authPending) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const convs = await fetchConversations();
        // Auto-open conversation if ?partner=<id> is in URL
        if (initialPartnerId && !initialAutoOpened.current) {
          initialAutoOpened.current = true;
          const target = convs.find((c) => c.partnerId === initialPartnerId);
          if (target) {
            setActiveConversation(target);
            currentPartnerRef.current = target.partnerId;
            setMobileShowChat(true);
            // Fetch messages for this conversation
            try {
              const msgData = await getMessages(target.partnerId);
              setMessages(Array.isArray(msgData) ? msgData : []);
            } catch {}
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authPending, fetchConversations, initialPartnerId]);

  /* ── Polling: refresh every 5s ── */
  useEffect(() => {
    if (authPending) return;
    const interval = setInterval(() => {
      fetchConversations();
      if (currentPartnerRef.current) {
        getMessages(currentPartnerRef.current).then((data) => {
          if (Array.isArray(data)) {
            setMessages(data);
          }
        }).catch(() => {});
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [authPending, fetchConversations]);

  /* ── Fetch messages for a conversation ── */
  const fetchMessages = useCallback(async (partnerId) => {
    try {
      setMessagesLoading(true);
      const data = await getMessages(partnerId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  /* ── Select a conversation ── */
  const handleSelectConversation = useCallback((conversation) => {
    setActiveConversation(conversation);
    currentPartnerRef.current = conversation.partnerId;
    fetchMessages(conversation.partnerId);
    setMobileShowChat(true);
    setConversations((prev) =>
      prev.map((c) =>
        c.partnerId === conversation.partnerId ? { ...c, unreadCount: 0 } : c
      )
    );
  }, [fetchMessages]);

  /* ── Back to list (mobile) ── */
  const handleBackToList = useCallback(() => {
    setMobileShowChat(false);
  }, []);

  /* ── Auto-scroll ── */
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /* ── Send message ── */
  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || !activeConversation || sending) return;

    const receiverId = activeConversation.partnerId;
    try {
      setSending(true);
      await sendMessage(receiverId, text);
      setInputValue("");
      const data = await getMessages(receiverId);
      if (Array.isArray(data)) {
        setMessages(data);
      }
      fetchConversations();
      inputRef.current?.focus();
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }, [inputValue, activeConversation, sending, fetchConversations]);

  /* ── Handle Enter key ── */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  /* ── Auth loading ── */
  if (authPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading messages">
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  const activePartner = activeConversation?.partner;
  const activePartnerName = activePartner?.name || "Select a conversation";

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">
          Messages
        </h1>
        <p className="text-[15px] text-[#71717A] mt-1 leading-relaxed">
          Communicate with candidates about their applications.
        </p>
      </div>

      {/* ── Split Panel ── */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] overflow-hidden flex h-[calc(100vh-220px)] min-h-[400px] relative">

        {/* ── Left Panel: Conversation List ── */}
        <div
          className={`shrink-0 border-r border-white/[0.05] flex flex-col bg-[#141417] w-[320px]
            max-md:absolute max-md:inset-0 max-md:w-full max-md:z-10 max-md:border-r-0
            ${mobileShowChat ? "max-md:hidden" : "max-md:flex"}`}
        >
          <div className="px-4 py-4 border-b border-white/[0.05]">
            <h2 className="text-[16px] font-semibold text-white">
              Conversations
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <ConversationItem
                  key={conv.partnerId}
                  conversation={conv}
                  active={activeConversation?.partnerId === conv.partnerId}
                  onClick={() => handleSelectConversation(conv)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <MessageSquare
                  size={36}
                  aria-hidden="true"
                  className="text-[#3A3A40] mb-3"
                />
                <p className="text-[14px] text-[#A1A1AA] font-medium mb-1">
                  No messages yet
                </p>
                <p className="text-[13px] text-[#71717A] leading-relaxed">
                  Review applications and reach out to candidates!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Panel: Chat Area ── */}
        <div
          className={`flex-1 flex flex-col min-w-0
            ${!mobileShowChat ? "max-md:hidden" : "max-md:flex"}`}
        >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center gap-3 shrink-0">
                {/* Back button (mobile only) */}
                <button
                  onClick={handleBackToList}
                  aria-label="Back to conversations"
                  className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-colors duration-200 shrink-0 cursor-pointer"
                >
                  <ArrowLeft size={18} />
                </button>
                <Avatar
                  name={activePartnerName}
                  image={activePartner?.image}
                  size="sm"
                />
                <div className="min-w-0">
                  <span className="text-[15px] font-medium text-white truncate block">
                    {activePartnerName}
                  </span>
                  <span className="inline-flex items-center h-5 px-2 rounded-full bg-[#3A3A40] text-[11px] font-medium text-[#A1A1AA] mt-0.5">
                    Seeker
                  </span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full" role="status" aria-label="Loading messages">
                    <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
                    <span className="sr-only">Loading...</span>
                  </div>
                ) : messages.length > 0 ? (
                  <>
                    {messages.map((msg) => (
                      <MessageBubble
                        key={msg._id}
                        message={msg}
                        isMine={msg.senderId === user?.id}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[14px] text-[#71717A]">
                      No messages yet. Say hello!
                    </p>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="px-4 py-3 border-t border-white/[0.05] flex items-center gap-3 shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  disabled={sending}
                  aria-label="Message input"
                  className="flex-1 bg-[#1B1B1F] border border-white/[0.06] rounded-[12px] px-4 h-12 text-[14px] text-white placeholder-[#71717A] outline-none focus:border-[#3B82F6]/40 transition-colors duration-200 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !inputValue.trim()}
                  aria-label="Send message"
                  className="w-12 h-12 rounded-[10px] bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <MessageSquare
                size={48}
                aria-hidden="true"
                className="text-[#3A3A40] mb-4"
              />
              <p className="text-[16px] text-[#A1A1AA] font-medium mb-1">
                Select a conversation
              </p>
              <p className="text-[14px] text-[#71717A]">
                Choose a conversation from the left to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   EXPORTED PAGE (wrapped in Suspense for useSearchParams)
   ═══════════════════════════════════════════════════ */

export default function RecruiterMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading messages">
          <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
          <span className="sr-only">Loading...</span>
        </div>
      }
    >
      <RecruiterMessagesContent />
    </Suspense>
  );
}