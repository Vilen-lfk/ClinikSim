import { motion } from "framer-motion";
import type { Message } from "../types";
import PatientAvatar from "./PatientAvatar";
import PulseLine from "./PulseLine";
import TypingDots from "./TypingDots";

interface Props {
  message: Message;
  streaming?: boolean;
  patientName?: string;
}

export default function MessageBubble({ message, streaming = false, patientName = "Пациент" }: Props) {
  const isStudent = message.role === "student";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex items-end gap-2 ${isStudent ? "justify-end" : "justify-start"}`}
    >
      {!isStudent && <PatientAvatar name={patientName} />}
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
          isStudent ? "rounded-br-sm bg-teal text-white" : "rounded-bl-sm border border-line bg-card text-ink"
        }`}
      >
        <div className={`mb-1 flex items-center gap-2 text-xs ${isStudent ? "text-white/70" : "text-muted"}`}>
          {isStudent ? "Вы" : patientName}
          {streaming && message.content && <PulseLine size="inline" active className="w-8" />}
        </div>
        {message.content ? message.content : streaming ? <TypingDots /> : ""}
      </div>
    </motion.div>
  );
}