import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#777777] text-white pt-16 pb-8 font-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* LOGO */}
        <div className="mb-12">
           <div className="flex items-center">
            <div className="border border-white p-1 rounded-sm mr-2">
               <div className="bg-transparent px-1">
                 <span className="text-white font-light text-2xl tracking-tighter">hs</span>
               </div>
            </div>
            <span className="font-light text-2xl text-white tracking-tight">results</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-sm leading-relaxed">
          {/* COL 1: ESSEN */}
          <div>
            <h3 className="font-bold uppercase mb-4 tracking-wider">HS Results Büro Essen</h3>
            <p className="mb-4">
              Ihr Ansprechpartner: Olaf Heger
            </p>
            <p>
              Weyerstraße 1<br/>
              45131 Essen
            </p>
            <p className="mt-4">
              Telefon: +49 173 527 72 27
            </p>
          </div>

          {/* COL 2: POTSDAM */}
          <div>
            <h3 className="font-bold uppercase mb-4 tracking-wider">HS Results Büro Potsdam</h3>
            <p className="mb-4">
              Ihr Ansprechpartner: Andre Stuer
            </p>
            <p>
              Immenseestraße 10<br/>
              14471 Potsdam
            </p>
            <p className="mt-4">
              Telefon: +49 160 – 823 41 41
            </p>
          </div>

           {/* COL 3: RECHTLICHES */}
           <div>
            <h3 className="font-bold uppercase mb-4 tracking-wider">Rechtliches</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-slate-200 transition-colors uppercase">Impressum</a></li>
              <li><a href="#" className="hover:text-slate-200 transition-colors uppercase">Datenschutzerklärung</a></li>
            </ul>
          </div>

          {/* COL 4: COPYRIGHT / SOCIAL (Optional placeholder) */}
          <div className="flex flex-col justify-end">
             <p className="text-xs text-slate-300">
               © hs-results {new Date().getFullYear()}.<br/> All Rights Reserved.
             </p>
          </div>
        </div>
      </div>
    </footer>
  );
};