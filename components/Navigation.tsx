import React, { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Helper for text links
  const NavLink = ({ label, active = false, onClick }: { label: string; active?: boolean; onClick?: () => void }) => (
    <button 
      onClick={onClick}
      className={`text-sm font-semibold uppercase tracking-wide transition-colors ${
        active ? 'text-hs-orange' : 'text-slate-700 hover:text-hs-blue'
      }`}
    >
      {label}
    </button>
  );

  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm h-20 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center">
          
          {/* LOGO */}
          <div className="flex items-center cursor-pointer group" onClick={() => setView(ViewState.HOME)}>
            <div className="border-2 border-hs-accent/50 group-hover:border-hs-orange transition-colors p-1 rounded-sm mr-2">
               <div className="bg-transparent px-1">
                 <span className="text-hs-accent group-hover:text-hs-orange font-light text-2xl tracking-tighter transition-colors">hs</span>
               </div>
            </div>
            <span className="font-light text-2xl text-slate-500 tracking-tight">results</span>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center space-x-8">
            <div className="flex items-center space-x-1 cursor-pointer hover:text-hs-blue text-slate-700">
               <span className="text-sm font-semibold uppercase tracking-wide">Wirkbereiche</span>
               <ChevronDown size={14} />
            </div>
            
            <div className="group relative">
               <div className="flex items-center space-x-1 cursor-pointer text-slate-700 hover:text-hs-blue py-6">
                  <span className="text-sm font-semibold uppercase tracking-wide">Lösungen</span>
                  <ChevronDown size={14} />
               </div>
               {/* Dropdown for AI Tools */}
               <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-b-lg border-t-2 border-hs-orange opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0">
                  <button onClick={() => setView(ViewState.CHANGE_MANAGER)} className="block w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 hover:text-hs-orange text-sm font-medium border-b border-slate-100">
                     AI Change Manager
                  </button>
                  <button onClick={() => setView(ViewState.LEADERSHIP_RADAR)} className="block w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 hover:text-hs-orange text-sm font-medium">
                     Führungsradar
                  </button>
               </div>
            </div>

            <NavLink label="Berater" />
            <NavLink label="Kunden" />
            <NavLink label="Publikationen" />
            <NavLink label="Blog" />
          </div>

          {/* MOBILE TOGGLE / CTA */}
          <div className="flex items-center">
            <button 
               className="hidden lg:block ml-6 bg-hs-orange text-white p-2 rounded hover:bg-orange-600 transition-colors"
               onClick={() => setIsOpen(!isOpen)} // Just visual for desktop usually, but let's make it toggle menu
            >
               <Menu size={24} />
            </button>
            <button className="lg:hidden text-hs-blue" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={28} /> : <Menu size={28} className="text-hs-orange" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-xl lg:hidden flex flex-col p-6 space-y-4">
           <button onClick={() => {setView(ViewState.HOME); setIsOpen(false);}} className="text-left font-bold text-hs-blue uppercase">Startseite</button>
           <button onClick={() => {setView(ViewState.CHANGE_MANAGER); setIsOpen(false);}} className="text-left font-bold text-hs-accent uppercase">AI Change Manager</button>
           <button onClick={() => {setView(ViewState.LEADERSHIP_RADAR); setIsOpen(false);}} className="text-left font-bold text-hs-accent uppercase">Führungsradar</button>
           <hr className="border-slate-100"/>
           <button className="text-left text-slate-600 uppercase text-sm">Wirkbereiche</button>
           <button className="text-left text-slate-600 uppercase text-sm">Berater</button>
           <button className="text-left text-slate-600 uppercase text-sm">Kontakt</button>
        </div>
      )}
    </nav>
  );
};