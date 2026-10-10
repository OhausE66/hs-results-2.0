import React from 'react';
import { Lock } from 'lucide-react';
import { Auth } from './Auth';
import { useLanguage } from '../contexts/LanguageContext';

interface ResultTeaserProps {
  /** Überschrift der Vorschau, z. B. "Audit abgeschlossen". */
  title: string;
  /** Kurzer Einstieg in das Ergebnis, wird nach ca. zwei Sätzen gekürzt. */
  lead?: string;
  /** Optionale Kennzahl, die kostenlos sichtbar ist. */
  score?: { label: string; value: string | number; max?: string | number };
  /** Was nach der Anmeldung freigeschaltet wird, z. B. ["4 Stärken", "5 Handlungsfelder"]. */
  locked: string[];
}

// Kürzt auf höchstens zwei Sätze, damit die Vorschau Appetit macht, aber das Ergebnis nicht ersetzt.
const firstSentences = (text: string, count = 2): string => {
  const parts = text.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!parts) return text.slice(0, 220);
  return parts.slice(0, count).join('').trim();
};

export const ResultTeaser: React.FC<ResultTeaserProps> = ({ title, lead, score, locked }) => {
  const { language } = useLanguage();
  const de = language === 'de';

  return (
    <div className="max-w-2xl mx-auto py-12 animate-fade-in px-4">
      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 mb-10">
        <h2 className="text-2xl font-black text-hs-blue uppercase mb-6 text-center">{title}</h2>

        {score && (
          <div className="text-center mb-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{score.label}</p>
            <p className="text-6xl font-black tracking-tighter text-hs-blue">
              {score.value}{score.max !== undefined && <span className="text-lg text-hs-accent">/{score.max}</span>}
            </p>
          </div>
        )}

        {lead && <p className="text-slate-600 leading-relaxed mb-6">{firstSentences(lead)}</p>}

        {locked.length > 0 && (
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 mb-6">
            <p className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              <Lock size={12} className="mr-2" />
              {de ? 'Nach der Anmeldung freigeschaltet' : 'Unlocked after sign-in'}
            </p>
            <ul className="space-y-2">
              {locked.map((item, i) => (
                <li key={i} className="flex items-center text-sm font-bold text-slate-500 blur-[1.5px] select-none">
                  <span className="w-2 h-2 rounded-full bg-hs-orange mr-3 flex-shrink-0" />{item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-slate-500 text-sm text-center">
          {de
            ? 'Melden Sie sich an oder erstellen Sie ein kostenloses Konto, um das vollständige Ergebnis zu sehen.'
            : 'Sign in or create a free account to see the full result.'}
        </p>
      </div>
      <Auth inline={true} />
    </div>
  );
};
