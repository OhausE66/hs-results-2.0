import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ViewState } from '../types';

interface FooterProps {
  setView?: (view: ViewState) => void;
}

export const Footer: React.FC<FooterProps> = ({ setView }) => {
  const { t } = useLanguage();

  const handleNavigate = (v: ViewState) => {
    if (setView) {
      setView(v);
      window.scrollTo(0, 0);
    }
  };

  return (
    <footer className="bg-[#777777] text-white pt-16 pb-12 font-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* LOGO AREA */}
        <div className="mb-12">
           <div className="flex items-center cursor-pointer group w-fit" onClick={() => handleNavigate(ViewState.HOME)}>
            <div className="bg-white p-1 rounded-full shadow-xl group-hover:scale-105 transition-transform duration-300">
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/hs-results.firebasestorage.app/o/homepage_assets%2Flogo-hs-results-rund.png?alt=media&token=0e7328b9-7045-4b3a-bff8-65ba27ec824c" 
                alt="hs:results logo" 
                className="h-20 w-20 object-contain"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-sm leading-relaxed">
          {/* LOCATION ESSEN */}
          <div>
            <h3 className="font-bold uppercase mb-4 tracking-widest border-b border-white/20 pb-2">{t('footer.essen')}</h3>
            <p className="mb-4">
              {t('footer.contact')}: Olaf Heger
            </p>
            <p className="text-white/80">
              Weyerstraße 1<br/>
              45131 Essen
            </p>
            <p className="mt-4 text-white/80">
              {t('footer.phone')}: +49 173 527 72 27
            </p>
          </div>

          {/* LOCATION POTSDAM */}
          <div>
            <h3 className="font-bold uppercase mb-4 tracking-widest border-b border-white/20 pb-2">{t('footer.potsdam')}</h3>
            <p className="mb-4">
               {t('footer.contact')}: Andre Stuer
            </p>
            <p className="text-white/80">
              Immenseestraße 10<br/>
              14471 Potsdam
            </p>
            <p className="mt-4 text-white/80">
               {t('footer.phone')}: +49 160 823 41 41
            </p>
          </div>

           {/* LEGAL LINKS */}
           <div>
            <h3 className="font-bold uppercase mb-4 tracking-widest border-b border-white/20 pb-2">{t('footer.legal')}</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => handleNavigate(ViewState.LEGAL)} 
                  className="hover:text-hs-accent transition-colors uppercase text-xs font-bold tracking-widest text-left"
                >
                  {t('footer.imprint')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigate(ViewState.LEGAL)} 
                  className="hover:text-hs-accent transition-colors uppercase text-xs font-bold tracking-widest text-left"
                >
                  {t('footer.privacy')}
                </button>
              </li>
            </ul>
          </div>

          {/* COPYRIGHT */}
          <div className="flex flex-col justify-end">
             <div className="bg-white/5 p-4 rounded-xl border border-white/10">
               <p className="text-[10px] text-white/60 leading-tight">
                 © hs-results {new Date().getFullYear()}.<br/>
                 {t('footer.rights')}
               </p>
               <p className="text-[10px] mt-2 text-hs-accent font-bold uppercase tracking-widest">
                 EXPERIENCED. INDIVIDUAL. INNOVATIVE. EFFECTIVE.
               </p>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};