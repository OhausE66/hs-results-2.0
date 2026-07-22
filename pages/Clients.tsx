import React from 'react';
import { ViewState } from '../types';
import { ChevronLeft, Building2, Globe, Users, Trophy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ClientsProps {
  setView: (view: ViewState) => void;
}

export const Clients: React.FC<ClientsProps> = ({ setView }) => {
  const { t, language } = useLanguage();

  const clients = [
    "Adidas AG, Herzogenaurach",
    "Arcor AG & Co. KG, Eschborn",
    "Architekten Schröder Schulte-Ladbeck, Dortmund",
    "Aspera GmbH, Aachen",
    "BASF SE, Berlin",
    "Bertelsmann AG, Gütersloh",
    "Robert Bosch GmbH, Berlin",
    "Carl Zeiss AG, Oberkochen",
    "Continental AG, Hannover",
    "Coperion GmbH, Stuttgart",
    "Daimler AG, Stuttgart",
    "Daimler Financial Services AG, Stuttgart",
    "Deutsche Bahn AG, Berlin",
    "Deutsche Bahn Systel, Frankfurt",
    "Deutsche Post AG, Bonn",
    "Deutsche Telekom AG, Bonn",
    "DSW 21, Stadtwerke Dortmund",
    "Edna AG, Zusmarshausen",
    "ESMT, Berlin",
    "TDK Electronics, Berlin",
    "Evonik Industries AG, Essen",
    "Gazprom Germania GmbH, Berlin",
    "GIZ GmbH, Berlin",
    "GVH, Großraum Verkehr Hannover TDK",
    "Heraeus GmbH, Hanau",
    "Heraeus Kulzer GmbH, Hanau",
    "Homag Group AG, Schopfloch",
    "IMD, Lausanne",
    "Infineon Technologies AG, Neubiberg",
    "Johnson & Johnson / Janssen Pharmaceutica N.V., Beerse",
    "Kasseler Verkehrsgesellschaft AG",
    "KION Group AG, Wiesbaden",
    "Lufthansa Group AG, Köln",
    "MairDumont GmbH, Ostfildern",
    "OBI GmbH, Wermelskirchen",
    "Renault Deutschland AG, Brühl",
    "Rheinbahn AG, Düsseldorf",
    "Siemens AG, München, Berlin",
    "Sitronic GmbH, Gärtringen",
    "Stadtwerke Bonn Verkehrs-GmbH",
    "Stadtwerke Duisburg",
    "Stadtwerke Münster",
    "Stadtwerke Regensburg",
    "SWK, Stadtwerke Krefeld",
    "Wilhelm Stoll Maschinenfabrik GmbH, Lengede",
    "Thyssen-Krupp AG, Essen, Duisburg",
    "T-Systems International GmbH, Frankfurt",
    "VIP, Verkehrsbetriebe Potsdam",
    "Vodafone GmbH, Düsseldorf"
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
              <p className="text-hs-orange font-black uppercase tracking-[0.3em] text-sm">{language === 'de' ? 'Partnerschaften' : 'Partnerships'}</p>
            </div>
            <h1 className="text-6xl font-black text-hs-blue uppercase tracking-tight leading-[0.95]">
              {language === 'de' ? 'Unsere Kunden' : 'Our Clients'}
            </h1>
            <p className="text-2xl font-bold text-hs-accent leading-tight italic">
              {language === 'de' ? 'Vertrauen durch Kompetenz.' : 'Trust through competence.'}
              <br/><span className="text-hs-blue not-italic">{language === 'de' ? 'Ein Auszug aus unserer Erfolgsgeschichte.' : 'An excerpt from our success story.'}</span>
            </p>
            
            <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
              <p>
                {language === 'de' 
                  ? 'Von globalen DAX-Konzernen bis hin zu innovativen mittelständischen Hidden Champions – hs:results begleitet Organisationen über Branchengrenzen hinweg.' 
                  : 'From global DAX corporations to innovative medium-sized hidden champions – hs:results accompanies organizations across industry boundaries.'}
              </p>
              <div className="bg-white p-8 rounded-[2.5rem] border-l-8 border-hs-accent shadow-sm">
                <p className="font-bold text-hs-blue leading-relaxed">
                  {language === 'de' 
                    ? 'Wir sind stolz darauf, mit den Besten ihrer Branche zusammenzuarbeiten und gemeinsam nachhaltige Veränderungen zu bewirken.'
                    : 'We are proud to work with the best in their industries and to bring about sustainable change together.'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative group animate-fade-in" style={{ animationDelay: '200ms' }}>
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
              className="rounded-[3rem] shadow-2xl z-10 relative group-hover:scale-[1.02] transition-transform duration-700" 
              alt="Corporate skyscraper and networking" 
            />
            <div className="absolute -bottom-8 -right-8 w-full h-full border-4 border-hs-orange/30 rounded-[3rem] -z-10 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-700"></div>
            
            <div className="absolute -top-10 -left-10 bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-hs-blue border border-slate-100 hidden md:flex">
               <Trophy size={48} className="mb-2 text-hs-orange" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{language === 'de' ? 'Referenz-Klasse' : 'Reference Class'}</span>
            </div>
          </div>
        </div>

        {/* Clients Grid */}
        <div className="mb-32">
          <div className="flex items-center space-x-4 mb-12">
            <h2 className="text-3xl font-black text-hs-blue uppercase tracking-tight">{language === 'de' ? 'Kooperationen & Partner' : 'Cooperations & Partners'}</h2>
            <div className="flex-grow h-[1px] bg-slate-200"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-hs-accent hover:shadow-md transition-all group flex items-center space-x-4"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-hs-accent group-hover:bg-hs-blue group-hover:text-white transition-all duration-300 shadow-inner">
                  <Building2 size={20} />
                </div>
                <span className="text-sm font-bold text-hs-blue/80 group-hover:text-hs-blue transition-colors">{client}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Global Impact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 bg-hs-blue text-white p-12 rounded-[4rem] relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Globe size={240} />
             </div>
             <h3 className="text-2xl font-black uppercase mb-8 flex items-center">
                <Users className="mr-3 text-hs-orange" /> {language === 'de' ? 'Branchenübergreifende Expertise' : 'Cross-industry expertise'}
             </h3>
             <p className="text-slate-300 mb-10 leading-relaxed text-lg">
                {language === 'de' 
                  ? 'Unsere Arbeit ist so vielfältig wie unsere Kunden. Ob Automotive, Chemie, Logistik oder der öffentliche Sektor – wir verstehen die spezifischen Dynamiken und Herausforderungen jeder Branche.'
                  : 'Our work is as diverse as our clients. Whether automotive, chemicals, logistics or the public sector – we understand the specific dynamics and challenges of every industry.'}
             </p>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                   <p className="font-black text-xl text-hs-accent">DAX 40</p>
                   <p className="text-[10px] uppercase font-bold text-slate-400">{language === 'de' ? 'Marktführer' : 'Market Leaders'}</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                   <p className="font-black text-xl text-hs-orange">Gov</p>
                   <p className="text-[10px] uppercase font-bold text-slate-400">{language === 'de' ? 'Öffentl. Sektor' : 'Public Sector'}</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                   <p className="font-black text-xl text-hs-accent">Tech</p>
                   <p className="text-[10px] uppercase font-bold text-slate-400">Innovation</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                   <p className="font-black text-xl text-hs-orange">{language === 'de' ? 'Mittelst.' : 'SME'}</p>
                   <p className="text-[10px] uppercase font-bold text-slate-400">Hidden Champions</p>
                </div>
             </div>
          </div>
          
          <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col h-full justify-center text-center relative overflow-hidden">
             <div className="text-hs-orange text-5xl font-serif mb-6 leading-none">“</div>
             <p className="text-xl font-bold text-hs-blue leading-tight mb-8 italic">
                {language === 'de' 
                  ? '„Erfolg ist die Summe richtiger Entscheidungen – wir unterstützen unsere Kunden dabei, diese auch in turbulenten Zeiten sicher zu treffen.“'
                  : '„Success is the sum of correct decisions – we support our clients in making them reliably, even in turbulent times.“'}
             </p>
             <div className="w-12 h-[2px] bg-hs-accent mx-auto mb-4"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{language === 'de' ? 'Leitbild hs:results' : 'hs:results Guiding Principle'}</p>
          </div>
        </div>

      </div>
    </div>
  );
};