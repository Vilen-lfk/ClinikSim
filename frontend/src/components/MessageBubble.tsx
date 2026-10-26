import { motion } from "framer-motion";
import type { Message } from "../types";
import { formatClock } from "../utils/time";
import TypingDots from "./TypingDots";

interface Props {
  message: Message;
  streaming?: boolean;
  patientInitials?: string;
}


export default function MessageBubble({ message, streaming = false, patientInitials = "П" }: Props) {
  const isStudent = message.role === "student";
  const time = formatClock(message.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex items-end gap-2.5 ${isStudent ? "justify-end" : "justify-start"}`}
    >
      {!isStudent && (
        <span
          aria-hidden="true"
          className="mb-5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-light text-[10px] font-semibold text-teal-dark"
        >
          {patientInitials}
        </span>
      )}
      <div className={`flex max-w-[75%] flex-col ${isStudent ? "items-end" : "items-start"}`}>
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isStudent
              ? "rounded-br-md bg-teal-dark font-medium text-white shadow-sm"
              : "rounded-bl-md border border-line bg-card text-ink shadow-sm"
          }`}
        >
          {message.content ? message.content : streaming ? <TypingDots /> : ""}
        </div>
        <span className="mt-1 h-4 px-1 font-mono text-[10px] text-muted">{time}</span>
      </div>
    </motion.div>
  );
}
