import React from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { ViewState } from '../types';

interface ChatMessageProps {
  text: string;
  lang: 'de' | 'en';
  onOpenTool: (view: ViewState) => void;
}

const TOOL_LABELS: Record<string, { de: string; en: string }> = {
  ORGANIZATION_ANALYZER: { de: 'Organisations-Audit', en: 'Organization audit' },
  STRATEGY_CLARIFIER: { de: 'Strategie-Klärer', en: 'Strategy clarifier' },
  CULTURE_SCANNER: { de: 'Kultur-Scanner', en: 'Culture scanner' },
  LEADERSHIP_RADAR: { de: 'Leadership Radar', en: 'Leadership radar' },
  CHANGE_MANAGER: { de: 'Veränderungs-Begleiter', en: 'Change companion' },
  INNOVATION_IDEATOR: { de: 'VentureForge', en: 'VentureForge' },
  REORG_SIMULATOR: { de: 'Reorg Simulator', en: 'Reorg simulator' },
};

const CONTACT_MAIL = 'kontakt@hs-results.com';

// Inline: **fett**
const renderInline = (text: string, keyPrefix: string): React.ReactNode[] =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4
      ? <strong key={`${keyPrefix}-${i}`} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>
      : <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>
  );

// Blöcke: Absätze, Aufzählungen (* / - / 1.)
const renderBlocks = (text: string): React.ReactNode[] => {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push(<p key={`p${blocks.length}`} className="mb-2 last:mb-0">{renderInline(para.join(' '), `p${blocks.length}`)}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      const Tag = list.ordered ? 'ol' : 'ul';
      const k = `l${blocks.length}`;
      blocks.push(
        <Tag key={k} className={`mb-2 last:mb-0 pl-5 space-y-1 ${list.ordered ? 'list-decimal' : 'list-disc'}`}>
          {list.items.map((it, i) => <li key={i}>{renderInline(it, `${k}-${i}`)}</li>)}
        </Tag>
      );
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    const bullet = line.match(/^[*-]\s+(.*)$/);
    const numbered = line.match(/^\d+\.\s+(.*)$/);
    if (bullet || numbered) {
      flushPara();
      const ordered = !!numbered;
      if (!list || list.ordered !== ordered) { flushList(); list = { ordered, items: [] }; }
      list.items.push((bullet || numbered)![1]);
    } else if (line === '') {
      flushPara(); flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara(); flushList();
  return blocks;
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ text, lang, onOpenTool }) => {
  const toolIds: string[] = [];
  let wantsContact = false;

  const body = text
    .replace(/\[TOOL:([A-Z_]+)\]/g, (_m, id) => { if (!toolIds.includes(id)) toolIds.push(id); return ''; })
    .replace(/\[CTA:ERSTGESPRAECH\]/g, () => { wantsContact = true; return ''; })
    .trim();

  const subject = encodeURIComponent(lang === 'en' ? 'Initial conversation' : 'Erstgespräch');

  return (
    <div>
      {renderBlocks(body)}
      {(toolIds.length > 0 || wantsContact) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {toolIds.map(id => (
            <button
              key={id}
              onClick={() => onOpenTool(id as ViewState)}
              className="inline-flex items-center px-3 py-1.5 bg-hs-orange/10 border border-hs-orange/30 text-hs-orange rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-hs-orange hover:text-white transition-all shadow-sm"
            >
              {lang === 'en' ? 'To tool: ' : 'Zum Tool: '}{TOOL_LABELS[id]?.[lang] ?? id.replace(/_/g, ' ')} <ArrowRight size={12} className="ml-1" />
            </button>
          ))}
          {wantsContact && (
            <a
              href={`mailto:${CONTACT_MAIL}?subject=${subject}`}
              className="inline-flex items-center px-3 py-1.5 bg-hs-blue text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-sm"
            >
              <Mail size={12} className="mr-1.5" /> {lang === 'en' ? 'Book an initial conversation' : 'Erstgespräch vereinbaren'}
            </a>
          )}
        </div>
      )}
    </div>
  );
};
