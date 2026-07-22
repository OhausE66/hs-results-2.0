import React from 'react';
import { ViewState } from '../types';
import { 
  ChevronLeft, ShieldCheck, Lock, Server, Globe, 
  EyeOff, UserCheck, ShieldAlert, Cpu, Database, 
  CheckCircle2, FileCheck
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SecurityProps {
  setView: (view: ViewState) => void;
}

export const Security: React.FC<SecurityProps> = ({ setView }) => {
  const { t, language } = useLanguage();

  const securityFeatures = [
    {
      title: language === 'de' ? "DSGVO-konform" : "GDPR Compliant",
      desc: language === 'de' ? "Verarbeitung nach klaren Zwecken, Datenminimierung, transparente Information." : "Processing for clear purposes, data minimization, transparent information.",
      icon: FileCheck,
      accent: "hs-blue"
    },
    {
      title: language === 'de' ? "EU-Hosting" : "EU Hosting",
      desc: language === 'de' ? "Datenverarbeitung auf Servern in der EU (keine unnötigen Drittlandtransfers)." : "Data processing on servers in the EU (no unnecessary third-country transfers).",
      icon: Server,
      accent: "hs-orange"
    },
    {
      title: language === 'de' ? "Verschlüsselung" : "Encryption",
      desc: language === 'de' ? "TLS bei der Übertragung, Verschlüsselung im Ruhezustand; optional Ende-zu-Ende für sensible Inhalte." : "TLS during transmission, encryption at rest; optional end-to-end for sensitive content.",
      icon: Lock,
      accent: "hs-accent"
    },
    {
      title: language === 'de' ? "Zugriffsschutz" : "Access Protection",
      desc: language === 'de' ? "Rollenspezifische Rechte, Need-to-know-Prinzip, MFA für Administratoren." : "Role-specific rights, need-to-know principle, MFA for administrators.",
      icon: UserCheck,
      accent: "emerald-500"
    },
    {
      title: language === 'de' ? "Sicherheitsbetrieb" : "Security Operations",
      desc: language === 'de' ? "Regelmäßige Audits, Patch-Management und Incident-Response-Prozesse." : "Regular audits, patch management, and incident response processes.",
      icon: ShieldAlert,
      accent: "hs-orange"
    },
    {
      title: language === 'de' ? "Keine Drittweitergabe" : "No Third-Party Sharing",
      desc: language === 'de' ? "Kein Datenverkauf. Dienstleister nur als geprüfte Auftragsverarbeiter mit AV-Vertrag." : "No data sale. Service providers only as vetted order processors with DPA.",
      icon: EyeOff,
      accent: "hs-blue"
    }
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button 
          onClick={() => setView(ViewState.HOME)} 
          className="mb-10 flex items-center text-slate-400 hover:text-hs-blue transition-colors font-black uppercase text-xs tracking-widest no-print"
        >
          <ChevronLeft size={16} className="mr-1" /> {t('ui.back')}
        </button>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center space-x-4 mb-2">
              <div className="h-[3px] w-16 bg-hs-orange"></div>
              <p className="text-hs-orange font-black uppercase tracking-[0.3em] text-sm">Trust & Security</p>
            </div>
            <h1 className="text-6xl font-black text-hs-blue uppercase tracking-tight leading-[0.95]">
              {language === 'de' ? 'Sicherheit & Vertrauen' : 'Security & Trust'}
            </h1>
            <p className="text-2xl font-bold text-hs-accent leading-tight">
              {language === 'de' ? 'Ihre Daten sind das wertvollste Gut Ihrer Organisation. Wir schützen sie mit höchster Sorgfalt.' : 'Your data is your organization\'s most valuable asset. We protect it with the utmost care.'}
            </p>
            
            <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
              <p className="font-medium">
                {language === 'de' 
                  ? 'Wir von hs-results wissen: Viele Menschen begegnen KI mit Misstrauen – und sind bei Daten zu Recht vorsichtig. KI ist ein mächtiges Instrument, dessen volle Auswirkungen heute noch niemand komplett überblicken kann.'
                  : 'At hs-results, we know: Many people view AI with suspicion – and are rightly cautious about data. AI is a powerful tool, the full implications of which no one can yet fully foresee today.'}
              </p>
              <div className="bg-white p-8 rounded-[2.5rem] border-l-8 border-hs-blue shadow-sm">
                <p className="font-bold text-hs-blue leading-relaxed">
                  {language === 'de'
                    ? 'Gerade deshalb behandeln wir Ihre Informationen so, als wären es unsere eigenen: mit klaren Regeln, maximaler Transparenz und höchsten Sicherheitsstandards. Sie entscheiden, was Sie teilen – wir sorgen dafür, dass es geschützt bleibt.'
                    : 'That is precisely why we treat your information as if it were our own: with clear rules, maximum transparency, and the highest security standards. You decide what you share – we ensure it stays protected.'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative group animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="bg-hs-blue rounded-[3rem] p-12 shadow-2xl relative overflow-hidden aspect-[4/3] flex flex-col justify-center">
               <div className="relative z-10 space-y-6">
                  <div className="w-20 h-20 bg-hs-orange text-white rounded-3xl flex items-center justify-center shadow-lg">
                     <ShieldCheck size={48} />
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase">Corporate Protection</h3>
                  <div className="space-y-4">
                     <div className="flex items-center space-x-3 text-hs-accent">
                        <CheckCircle2 size={20} />
                        <span className="font-bold text-lg">{language === 'de' ? 'ISO-Standard Architektur' : 'ISO-Standard Architecture'}</span>
                     </div>
                     <div className="flex items-center space-x-3 text-hs-accent">
                        <CheckCircle2 size={20} />
                        <span className="font-bold text-lg">End-to-End Encryption</span>
                     </div>
                     <div className="flex items-center space-x-3 text-hs-accent">
                        <CheckCircle2 size={20} />
                        <span className="font-bold text-lg">Strict Access Protocols</span>
                     </div>
                  </div>
               </div>
               <Lock size={300} className="absolute -bottom-20 -right-20 text-white/5 pointer-events-none" />
               <Cpu size={200} className="absolute top-0 right-0 text-hs-orange/10 pointer-events-none animate-pulse" />
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mb-32">
          <div className="flex flex-col items-center text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black text-hs-blue uppercase tracking-tight">{language === 'de' ? 'Datenschutz & Security – verlässlich umgesetzt' : 'Data Privacy & Security – reliably implemented'}</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">{language === 'de' ? 'Unsere 6 Säulen der Informationssicherheit' : 'Our 6 pillars of information security'}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((f, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col h-full"
              >
                <div className={`w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-${f.accent} mb-8 group-hover:bg-hs-blue group-hover:text-white transition-all duration-500 shadow-inner`}>
                  <f.icon size={32} />
                </div>
                <h3 className="text-xl font-black text-hs-blue uppercase mb-4 tracking-tight group-hover:text-hs-orange transition-colors">{f.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed flex-grow">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Global Compliance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch">
          <div className="lg:col-span-2 bg-hs-blue text-white p-12 rounded-[4rem] relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Globe size={240} />
             </div>
             <h3 className="text-2xl font-black uppercase mb-8 flex items-center">
                <Database size={24} className="mr-3 text-hs-orange" /> {language === 'de' ? 'Datensouveränität' : 'Data Sovereignty'}
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-4">
                   <p className="text-lg font-bold text-hs-accent">{language === 'de' ? 'Sie behalten die volle Kontrolle.' : 'You maintain full control.'}</p>
                   <p className="text-slate-300 text-sm leading-relaxed">
                      {language === 'de' 
                        ? 'Jeder Datenupload, jede KI-Analyse und jedes Beraterprofil wird in isolierten Sicherheitscontainern verwaltet. Wir nutzen modernste Infrastruktur, um sicherzustellen, dass keine Datenmischung stattfindet.'
                        : 'Every data upload, AI analysis, and consultant profile is managed in isolated security containers. We use state-of-the-art infrastructure to ensure no data mixing occurs.'}
                   </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-center">
                   <div className="flex items-center space-x-4 mb-4">
                      <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg">
                         <ShieldCheck size={20} />
                      </div>
                      <span className="font-black uppercase text-xs tracking-widest">Compliance Ready</span>
                   </div>
                   <p className="text-[11px] text-slate-400 italic">
                      {language === 'de'
                        ? 'Unsere Systeme sind darauf ausgelegt, die strengen Anforderungen von Compliance-Abteilungen in regulierten Industrien (Finanzen, Healthcare, Automotive) zu erfüllen.'
                        : 'Our systems are designed to meet the strict requirements of compliance departments in regulated industries (finance, healthcare, automotive).'}
                   </p>
                </div>
             </div>
          </div>
          
          <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col justify-center text-center relative overflow-hidden">
             <div className="text-hs-orange text-5xl font-serif mb-6 leading-none">“</div>
             <p className="text-xl font-bold text-hs-blue leading-tight mb-8">
                {language === 'de'
                  ? 'KI ist kein Ersatz für Verantwortung, sondern ein Werkzeug, das mit höchster ethischer und technischer Verantwortung geführt werden muss.'
                  : 'AI is no substitute for responsibility, but a tool that must be managed with the highest ethical and technical accountability.'}
             </p>
             <div className="w-12 h-[2px] bg-hs-accent mx-auto mb-4"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">hs:results Security Promise</p>
          </div>
        </div>

      </div>
    </div>
  );
};