import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AiWaitingProps {
  /** Wechselnde Statusmeldungen, die den Fortschritt in Worten zeigen. */
  messages: string[];
  /** Hinweis zur erwarteten Dauer, z. B. "Das dauert meist 15–30 Sekunden." */
  hint?: string;
  /** Wechselintervall der Meldungen in Millisekunden. */
  intervalMs?: number;
}

export const AiWaiting: React.FC<AiWaitingProps> = ({ messages, hint, intervalMs = 4500 }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const timer = setInterval(() => {
      // Bei der letzten Meldung stehen bleiben statt von vorn zu beginnen.
      setIndex(i => Math.min(i + 1, messages.length - 1));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [messages.length, intervalMs]);

  return (
    <div className="py-20 text-center" role="status" aria-live="polite">
      <Loader2 size={48} className="animate-spin mx-auto text-hs-blue mb-6" />
      <p key={index} className="font-black text-hs-blue uppercase animate-fade-in">{messages[index]}</p>
      {hint && <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest">{hint}</p>}
    </div>
  );
};
