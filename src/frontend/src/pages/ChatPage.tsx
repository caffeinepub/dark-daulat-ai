import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { Bot, Loader2, Send, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Message } from "../backend.d";
import { MessageRole } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddMessage,
  useClearMessages,
  useGetMessages,
} from "../hooks/useQueries";

const TIPS = [
  "Pooch sakte ho: 'Kamaai kaise badhayein?'",
  "Pooch sakte ho: 'Kaunsa deal best hai?'",
  "Pooch sakte ho: 'Referral system kaise kaam karta hai?'",
  "Pooch sakte ho: 'Withdrawal request kaise karein?'",
];

function formatTime(ts: bigint) {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageBubble({ msg, index }: { msg: Message; index: number }) {
  const isUser = msg.role === MessageRole.user;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center mr-2 shrink-0 self-end mb-1"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.14 0.03 85), oklch(0.20 0.05 85))",
            border: "1px solid oklch(0.78 0.12 85 / 0.3)",
          }}
        >
          <Bot size={16} style={{ color: "oklch(0.78 0.12 85)" }} />
        </div>
      )}
      <div
        className={`max-w-[80%] flex flex-col ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className="px-4 py-2.5 rounded-2xl text-base leading-relaxed"
          style={
            isUser
              ? {
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                  color: "oklch(0.08 0 0)",
                  borderBottomRightRadius: "4px",
                  boxShadow: "0 2px 10px oklch(0.78 0.12 85 / 0.3)",
                }
              : {
                  background:
                    "linear-gradient(135deg, oklch(0.15 0.005 85), oklch(0.18 0.01 85))",
                  color: "oklch(0.88 0.015 85)",
                  borderBottomLeftRadius: "4px",
                  border: "1px solid oklch(0.28 0.04 85 / 0.4)",
                }
          }
        >
          {msg.message}
        </div>
        <span
          className="text-xs mt-1 px-1"
          style={{ color: "oklch(0.58 0.010 85)" }}
        >
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: messages = [], isLoading } = useGetMessages();
  const addMessage = useAddMessage();
  const clearMessages = useClearMessages();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated (wait for initialization first)
  useEffect(() => {
    if (!isInitializing && !identity) {
      navigate({ to: "/login" });
    }
  }, [identity, isInitializing, navigate]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    try {
      await addMessage.mutateAsync(text);
    } catch {
      toast.error("Message send nahi hua. Dobara try karo.");
    }
  };

  const handleClear = async () => {
    try {
      await clearMessages.mutateAsync();
      toast.success("Sab messages delete ho gaye");
    } catch {
      toast.error("Delete fail hui");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)]">
      {/* Header */}
      <header
        className="px-4 py-4 flex items-center justify-between shrink-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.16 0.010 255) 0%, oklch(0.16 0.010 255 / 0.95) 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid oklch(0.30 0.015 255 / 0.5)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.14 0.03 85), oklch(0.20 0.05 85))",
              border: "1px solid oklch(0.78 0.12 85 / 0.4)",
              boxShadow: "0 0 12px oklch(0.78 0.12 85 / 0.3)",
            }}
          >
            <Bot size={16} style={{ color: "oklch(0.86 0.14 85)" }} />
          </div>
          <div>
            <h1
              className="text-base font-bold"
              style={{ color: "oklch(0.86 0.14 85)" }}
            >
              AI Assistant
            </h1>
            <p className="text-xs" style={{ color: "oklch(0.65 0.010 85)" }}>
              Online • Dark Daulat AI
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={clearMessages.isPending || messages.length === 0}
          data-ocid="chat.clear_button"
          className="p-2 rounded-lg transition-colors disabled:opacity-40"
          style={{
            background: "oklch(0.62 0.22 25 / 0.1)",
            border: "1px solid oklch(0.62 0.22 25 / 0.3)",
          }}
        >
          {clearMessages.isPending ? (
            <Loader2
              size={15}
              className="animate-spin"
              style={{ color: "oklch(0.68 0.22 25)" }}
            />
          ) : (
            <Trash2 size={15} style={{ color: "oklch(0.68 0.22 25)" }} />
          )}
        </button>
      </header>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4"
        data-ocid="chat.message_list"
        style={{ background: "oklch(0.13 0.008 255)" }}
      >
        {/* Tips */}
        {messages.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4"
          >
            <div className="flex flex-col items-center mb-6 mt-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 animate-pulse-gold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.14 0.03 85), oklch(0.20 0.05 85))",
                  border: "2px solid oklch(0.78 0.12 85 / 0.4)",
                  boxShadow: "0 0 30px oklch(0.78 0.12 85 / 0.2)",
                }}
              >
                <Bot size={28} style={{ color: "oklch(0.86 0.14 85)" }} />
              </div>
              <h3
                className="font-bold text-base"
                style={{ color: "oklch(0.86 0.14 85)" }}
              >
                Dark Daulat AI Assistant
              </h3>
              <p
                className="text-xs text-center mt-1"
                style={{ color: "oklch(0.65 0.010 85)" }}
              >
                Hindi/Urdu mein pooch sakte ho
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {TIPS.map((tip) => (
                <button
                  type="button"
                  key={tip}
                  onClick={() =>
                    setInput(
                      tip.replace("Pooch sakte ho: ", "").replace(/'/g, ""),
                    )
                  }
                  className="text-left p-3 rounded-xl text-xs leading-relaxed transition-all"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.13 0.005 85), oklch(0.16 0.01 85))",
                    border: "1px solid oklch(0.28 0.04 85 / 0.4)",
                    color: "oklch(0.62 0.01 85)",
                  }}
                >
                  {tip}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="animate-shimmer rounded-2xl"
                  style={{
                    width: `${60 + Math.random() * 20}%`,
                    height: "44px",
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg: Message, i) => (
              <MessageBubble key={Number(msg.timestamp)} msg={msg} index={i} />
            ))}
          </AnimatePresence>
        )}

        {addMessage.isPending && (
          <div className="flex justify-start mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center mr-2 shrink-0 self-end mb-1"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.14 0.03 85), oklch(0.20 0.05 85))",
                border: "1px solid oklch(0.78 0.12 85 / 0.3)",
              }}
            >
              <Bot size={16} style={{ color: "oklch(0.78 0.12 85)" }} />
            </div>
            <div
              className="px-4 py-3 rounded-2xl"
              style={{
                background: "oklch(0.15 0.005 85)",
                border: "1px solid oklch(0.28 0.04 85 / 0.4)",
                borderBottomLeftRadius: "4px",
              }}
            >
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map((dot) => (
                  <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "oklch(0.78 0.12 85)" }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 1,
                      delay: dot * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div
        className="px-4 py-3 shrink-0"
        style={{
          background: "oklch(0.16 0.010 255)",
          borderTop: "1px solid oklch(0.22 0.01 85)",
        }}
      >
        <div className="flex gap-2 items-end">
          <Input
            placeholder="Message likhiye... (Hindi/Urdu)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            data-ocid="chat.message_input"
            className="flex-1 h-12 rounded-xl text-base"
            style={{
              background: "oklch(0.18 0.010 255)",
              border: "1px solid oklch(0.28 0.04 85 / 0.5)",
              color: "oklch(0.96 0.015 85)",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || addMessage.isPending}
            data-ocid="chat.send_button"
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40 active:scale-95"
            style={{
              background: input.trim()
                ? "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))"
                : "oklch(0.22 0.012 255)",
              border: "none",
              boxShadow: input.trim()
                ? "0 2px 12px oklch(0.78 0.12 85 / 0.4)"
                : "none",
            }}
          >
            {addMessage.isPending ? (
              <Loader2
                size={18}
                className="animate-spin"
                style={{ color: "oklch(0.08 0 0)" }}
              />
            ) : (
              <Send
                size={18}
                style={{
                  color: input.trim()
                    ? "oklch(0.08 0 0)"
                    : "oklch(0.45 0.01 85)",
                }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
