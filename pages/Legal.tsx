import React, { useEffect } from 'react';
import { ViewState } from '../types';
import { ChevronLeft, ShieldCheck, Scale, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LegalProps {
  setView: (view: ViewState) => void;
}

export const Legal: React.FC<LegalProps> = ({ setView }) => {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-20 bg-white min-h-screen px-4 font-sans text-slate-700">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => setView(ViewState.HOME)} 
          className="mb-10 flex items-center text-slate-400 hover:text-hs-blue transition-colors font-black uppercase text-xs tracking-[0.3em]"
        >
          <ChevronLeft size={20} className="mr-2" /> {t('nav.back_home')}
        </button>

        <div className="space-y-16 animate-fade-in">
          {/* IMPRESSUM */}
          <section id="imprint">
            <div className="flex items-center space-x-3 mb-8">
              <Scale className="text-hs-orange" size={32} />
              <h1 className="text-4xl font-black text-hs-blue uppercase tracking-tight">{t('legal.imprint.title')}</h1>
            </div>
            
            <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 shadow-sm leading-relaxed">
              <div className="space-y-6">
                <div>
                  <h3 className="font-black text-hs-blue uppercase text-xs tracking-widest mb-2">{t('legal.imprint.publisher')}</h3>
                  <p className="text-sm">{t('legal.imprint.responsible')}</p>
                </div>

                <div className="text-lg font-bold text-slate-800">
                  <p>Olaf Heger</p>
                  <p>Weyerstraße 1</p>
                  <p>45131 Essen</p>
                </div>

                <div className="space-y-1">
                  <p className="flex items-center text-sm font-medium"><span className="text-hs-blue w-20 uppercase text-[10px] font-black">{t('legal.imprint.email')}:</span> olafheger@hs-results.com</p>
                  <p className="flex items-center text-sm font-medium"><span className="text-hs-blue w-20 uppercase text-[10px] font-black">{t('legal.imprint.tel')}:</span> 0173 – 527 72 27</p>
                  <p className="flex items-center text-sm font-medium"><span className="text-hs-blue w-20 uppercase text-[10px] font-black">{t('legal.imprint.fax')}:</span> 0201 . 44 20 09</p>
                </div>

                <div>
                  <p className="text-sm"><span className="font-black text-hs-blue uppercase text-[10px] tracking-widest">{t('legal.imprint.tax')}:</span> 112/5150/0299</p>
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <p className="text-xs text-slate-500 italic">{t('legal.imprint.copyright')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* DATENSCHUTZ */}
          <section id="privacy">
            <div className="flex items-center space-x-3 mb-8">
              <ShieldCheck className="text-hs-accent" size={32} />
              <h2 className="text-4xl font-black text-hs-blue uppercase tracking-tight">{t('legal.privacy.title')}</h2>
            </div>

            <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed">
              <div className="bg-hs-blue/5 p-8 rounded-3xl border border-hs-blue/10">
                <p>{t('legal.privacy.responsible_body')}</p>
                <div className="mt-4 font-bold text-hs-blue">
                  <p>Olaf Heger</p>
                  <p>Weyerstraße 1</p>
                  <p>45131 Essen</p>
                  <p className="mt-2">olafheger@hs-results.com</p>
                  <p>Tel.: 0173 – 527 72 27</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-hs-blue uppercase mb-4">{t('legal.privacy.rights_title')}</h3>
                <p>{t('legal.privacy.rights_intro')}</p>
                <ul className="list-disc pl-5 space-y-2 mt-4">
                  <li>{t('legal.privacy.rights_list1')}</li>
                  <li>{t('legal.privacy.rights_list2')}</li>
                  <li>{t('legal.privacy.rights_list3')}</li>
                  <li>{t('legal.privacy.rights_list4')}</li>
                  <li>{t('legal.privacy.rights_list5')}</li>
                </ul>
                <p className="mt-4">{t('legal.privacy.rights_outro')}</p>
                <p className="mt-4">{t('legal.privacy.rights_complaint')} Eine Liste der Aufsichtsbehörden finden Sie unter: <a href="https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html" target="_blank" rel="noopener noreferrer" className="text-hs-accent underline">BfDI Link</a>.</p>
              </div>

              <div>
                <h3 className="text-xl font-black text-hs-blue uppercase mb-4">{t('legal.privacy.purposes_title')}</h3>
                <p>{t('legal.privacy.purposes_intro')}</p>
                <ul className="list-disc pl-5 space-y-2 mt-4">
                  <li>{t('legal.privacy.purposes_list1')}</li>
                  <li>{t('legal.privacy.purposes_list2')}</li>
                  <li>{t('legal.privacy.purposes_list3')}</li>
                  <li>{t('legal.privacy.purposes_list4')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-black text-hs-blue uppercase mb-4">{t('legal.privacy.deletion_title')}</h3>
                <p>{t('legal.privacy.deletion_text')}</p>
              </div>

              <div>
                <h3 className="text-xl font-black text-hs-blue uppercase mb-4">{t('legal.privacy.ssl_title')}</h3>
                <p>{t('legal.privacy.ssl_text')}</p>
              </div>

              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                <h3 className="text-xl font-black text-hs-blue uppercase mb-4">{t('legal.privacy.analytics_title')}</h3>
                <p>{t('legal.privacy.analytics_text')}</p>
              </div>

              <div>
                <h3 className="text-xl font-black text-hs-blue uppercase mb-4">{t('legal.privacy.fonts_title')}</h3>
                <p>{t('legal.privacy.fonts_text')}</p>
              </div>

              <div>
                <h3 className="text-xl font-black text-hs-blue uppercase mb-4">{t('legal.privacy.maps_title')}</h3>
                <p>{t('legal.privacy.maps_text')}</p>
              </div>

              <div className="pt-10 border-t border-slate-100 text-xs text-slate-400 italic">
                <p>{t('legal.privacy.generator_notice')}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
