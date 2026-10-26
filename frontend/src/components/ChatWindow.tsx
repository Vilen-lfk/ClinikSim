import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { Lightbulb, SendHorizontal } from "lucide-react";
import type { Message } from "../types";
import { formatClock } from "../utils/time";
import MessageBubble from "./MessageBubble";

interface Props {
  messages: Message[];
  isStreaming: boolean;
  disabled?: boolean;
  patientInitials: string;
  sessionStartedAt?: string;
  hint?: string | null;
  suggestions?: string[];
  onSend: (text: string) => Promise<boolean>;
}


export default function ChatWindow({
  messages,
  isStreaming,
  disabled,
  patientInitials,
  sessionStartedAt,
  hint,
  suggestions = [],
  onSend,
}: Props) {
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

  const startedAt = formatClock(sessionStartedAt);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="thin-scroll flex-1 space-y-2 overflow-y-auto px-6 py-5 lg:px-14">
        {startedAt && (
          <div className="mb-3 flex justify-center">
            <span className="rounded-full bg-line/60 px-3 py-1 text-[11px] text-muted">Сессия начата · {startedAt}</span>
          </div>
        )}
        {messages.length === 0 && (
          <p className="pt-8 text-center text-sm text-muted">
            Начните приём: поздоровайтесь и задайте первый вопрос пациенту.
          </p>
        )}
        {messages.map((m, i) => (
          <MessageBubble
            key={m.id}
            message={m}
            patientInitials={patientInitials}
            streaming={isStreaming && i === messages.length - 1 && m.role === "patient"}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-6 pb-4 lg:px-14">
        {hint && (
          <div className="mb-3 flex gap-3 rounded-xl border border-teal/15 bg-teal-light/60 px-4 py-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
            <div>
              <div className="text-sm font-semibold text-ink">Подсказка</div>
              <p className="mt-0.5 text-xs text-muted">{hint}</p>
            </div>
          </div>
        )}

        <div className="flex items-end gap-2 rounded-xl border border-line bg-card p-2 pl-3 shadow-sm focus-within:border-teal/60">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={1000}
            disabled={disabled}
            placeholder="Задайте вопрос пациенту…"
            className="max-h-32 flex-1 resize-none self-center bg-transparent py-1.5 text-sm text-ink placeholder:text-muted focus:outline-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!canSend}
            aria-label="Отправить"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal text-white transition hover:bg-teal-dark disabled:bg-teal/40"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>

        {suggestions.length > 0 && (
          <p className="mt-2 text-[11px] text-muted">
            Попробуйте:{" "}
            {suggestions.map((s, i) => (
              <span key={s}>
                <button
                  type="button"
                  onClick={() => setText(s)}
                  disabled={disabled}
                  className="hover:text-teal hover:underline"
                >
                  «{s}»
                </button>
                {i < suggestions.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
