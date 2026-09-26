import { motion } from "framer-motion";
import type { Message } from "../types";
import PulseLine from "./PulseLine";

interface Props {
  message: Message;
  streaming?: boolean;
}

export default function MessageBubble({ message, streaming = false }: Props) {
  const isStudent = message.role === "student";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
          isStudent ? "rounded-br-sm bg-teal text-white" : "rounded-bl-sm border border-line bg-card text-ink"
        }`}
      >
        <div className={`mb-1 flex items-center gap-2 text-xs ${isStudent ? "text-white/70" : "text-muted"}`}>
          {isStudent ? "Вы" : "Пациент"}
          {streaming && <PulseLine size="inline" active className="w-8" />}
        </div>
        {message.content || (streaming ? "…" : "")}
      </div>
    </motion.div>
  );
}