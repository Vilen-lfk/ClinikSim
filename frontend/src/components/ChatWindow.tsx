import { KeyboardEvent, useEffect, useRef, useState } from "react";
import type { Message } from "../types";
import Button from "./Button";
import MessageBubble from "./MessageBubble";

interface Props {
  messages: Message[];
  isStreaming: boolean;
  disabled?: boolean;
  patientName: string;
  onSend: (text: string) => Promise<boolean>;
}

export default function ChatWindow({ messages, isStreaming, disabled, patientName, onSend }: Props) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const canSend = !disabled && !isStreaming && text.trim().length > 0;

  const submit = async () => {
    if (!canSend) return;
    const value = text.trim();
    setText("");
    const ok = await onSend(value);
    if (!ok) setText(value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };
  

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-paper">
      <div className="thin-scroll flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="pt-8 text-center text-sm text-muted">
            Начните приём: поздоровайтесь и задайте первый вопрос пациенту.
          </p>
        )}
        {messages.map((m, i) => (
          <MessageBubble
            key={m.id}
            message={m}
            patientName={patientName}
            streaming={isStreaming && i === messages.length - 1 && m.role === "patient"}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t border-line bg-card p-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          maxLength={1000}
          disabled={disabled}
          placeholder="Ваш вопрос пациенту… (Enter — отправить, Shift+Enter — новая строка)"
          className="flex-1 resize-none rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-teal focus:outline-none disabled:opacity-60"
        />
        <Button onClick={() => void submit()} disabled={!canSend} className="self-end">
          Отправить
        </Button>
      </div>
    </div>
  );
}