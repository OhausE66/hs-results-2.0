import React, { useState } from 'react';
import { Menu, X, ChevronDown, LogOut, User as UserIcon, LogIn, Settings, Database, HardDrive, Lock } from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { signOut, auth } from '../services/firebase';

const ADMIN_EMAILS = [
  'olafheger@hs-results.com',
  'heger@hs-results.com', 
  'olaf.heger@gmail.com',
  'olafheger@arcor.de'
];

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  user: any;
  usedStorage?: number;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, user, usedStorage = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  const STORAGE_LIMIT = 5 * 1024 * 1024 * 1024; // 5 GB
  const storagePercentage = Math.min((usedStorage / STORAGE_LIMIT) * 100, 100);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView(ViewState.HOME);
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const handleNavigate = (view: ViewState) => {
    setView(view);
    setIsOpen(false);
  };

  const scrollToConsultants = () => {
    handleNavigate(ViewState.HOME);
    setTimeout(() => {
      const element = document.getElementById('consultants-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm h-20 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center">
          
          <div className="flex items-center cursor-pointer group" onClick={() => handleNavigate(ViewState.HOME)}>
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/hs-results.firebasestorage.app/o/homepage_assets%2Flogo-hs-results-rund.png?alt=media&token=0e7328b9-7045-4b3a-bff8-65ba27ec824c" 
              alt="hs:results logo" 
              className="h-14 w-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="hidden lg:flex items-center space-x-8">
            {/* Wirkbereiche (Renamed from Lösungen) */}
            <div className="group relative">
               <div className="flex items-center space-x-1 cursor-pointer text-slate-700 hover:text-hs-blue py-6">
                  <span className="text-sm font-semibold uppercase tracking-wide">{t('nav.loesungen')}</span>
                  <ChevronDown size={14} />
               </div>
               <div className="absolute top-full left-0 w-72 bg-white shadow-2xl rounded-b-2xl border-t-4 border-hs-orange opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 overflow-hidden">
                  <button onClick={() => handleNavigate(ViewState.ORGANIZATION_ANALYZER)} className="block w-full text-left px-6 py-4 hover:bg-slate-50 text-slate-700 hover:text-hs-orange text-sm font-bold border-b border-slate-50 transition-colors">
                     Organisation & Reorg
                  </button>
                  <button onClick={() => handleNavigate(ViewState.STRATEGY_CLARIFIER)} className="block w-full text-left px-6 py-4 hover:bg-slate-50 text-slate-700 hover:text-hs-orange text-sm font-bold border-b border-slate-50 transition-colors">
                     Strategie
                  </button>
                  <button onClick={() => handleNavigate(ViewState.CULTURE_SCANNER)} className="block w-full text-left px-6 py-4 hover:bg-slate-50 text-slate-700 hover:text-hs-orange text-sm font-bold border-b border-slate-50 transition-colors">
                     Unternehmenskultur
                  </button>
                  <button onClick={() => handleNavigate(ViewState.CHANGE_MANAGER)} className="block w-full text-left px-6 py-4 hover:bg-slate-50 text-slate-700 hover:text-hs-orange text-sm font-bold border-b border-slate-50 transition-colors">
                     {t('nav.tool.change')}
                  </button>
                  <button onClick={() => handleNavigate(ViewState.LEADERSHIP_RADAR)} className="block w-full text-left px-6 py-4 hover:bg-slate-50 text-slate-700 hover:text-hs-orange text-sm font-bold border-b border-slate-50 transition-colors">
                     {t('nav.tool.radar')}
                  </button>
                  <button onClick={() => handleNavigate(ViewState.INNOVATION_IDEATOR)} className="block w-full text-left px-6 py-4 border-b border-slate-50 bg-hs-blue text-white hover:bg-hs-orange text-sm font-bold transition-all">
                     VentureForge Plattform
                  </button>
                  {user && (
                    <button onClick={() => handleNavigate(ViewState.FILE_VAULT)} className="block w-full text-left px-6 py-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-sm font-black uppercase tracking-widest transition-all">
                       <Database size={14} className="inline mr-2" /> File Vault
                    </button>
                  )}
               </div>
            </div>

            {/* New Lösungen Field with 6 sub-items */}
            <div className="group relative">
               <div className="flex items-center space-x-1 cursor-pointer text-slate-700 hover:text-hs-blue py-6">
                  <span className="text-sm font-semibold uppercase tracking-wide">{t('nav.solutions')}</span>
                  <ChevronDown size={14} />
               </div>
               <div className="absolute top-full left-0 w-72 bg-white shadow-2xl rounded-b-2xl border-t-4 border-hs-accent opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 overflow-hidden">
                  <button onClick={() => handleNavigate(ViewState.MICROTRAININGS)} className="block w-full text-left px-6 py-4 hover:bg-slate-50 text-slate-700 hover:text-hs-accent text-sm font-bold border-b border-slate-50 transition-colors">
                     {t('nav.sol.micro')}
                  </button>
                  <button onClick={() => handleNavigate(ViewState.MINIMAL_INVASIVE_CHANGE)} className="block w-full text-left px-6 py-4 hover:bg-slate-50 text-slate-700 hover:text-hs-accent text-sm font-bold border-b border-slate-50 transition-colors">
                     {t('nav.sol.invasive')}
                  </button>
                  <button onClick={() => handleNavigate(ViewState.QUICKSTART)} className="block w-full text-left px-6 py-4 hover:bg-slate-50 text-slate-700 hover:text-hs-accent text-sm font-bold border-b border-slate-50 transition-colors">
                     {t('nav.sol.quick')}
                  </button>
                  <button onClick={() => handleNavigate(ViewState.SPRINT_MY_ORG)} className="block w-full text-left px-6 py-4 hover:bg-slate-50 text-slate-700 hover:text-hs-accent text-sm font-bold border-b border-slate-50 transition-colors">
                     {t('nav.sol.sprint')}
                  </button>
                  <button onClick={() => handleNavigate(ViewState.PIMP_MY_ORG)} className="block w-full text-left px-6 py-4 hover:bg-slate-50 text-slate-700 hover:text-hs-accent text-sm font-bold border-b border-slate-50 transition-colors">
                     {t('nav.sol.pimp')}
                  </button>
                  <button onClick={() => handleNavigate(ViewState.AGILE_CHANGE_BOOTCAMP)} className="block w-full text-left px-6 py-4 hover:bg-slate-50 text-slate-700 hover:text-hs-accent text-sm font-bold transition-colors">
                     {t('nav.sol.bootcamp')}
                  </button>
               </div>
            </div>

            <button 
              onClick={scrollToConsultants} 
              className="text-sm font-semibold uppercase tracking-wide text-slate-700 hover:text-hs-blue transition-colors"
            >
              {t('nav.berater')}
            </button>
            <button 
              onClick={() => handleNavigate(ViewState.CLIENTS)} 
              className={`text-sm font-semibold uppercase tracking-wide transition-colors ${currentView === ViewState.CLIENTS ? 'text-hs-blue' : 'text-slate-700 hover:text-hs-blue'}`}
            >
              {t('nav.kunden')}
            </button>
            <button 
              onClick={() => handleNavigate(ViewState.PUBLICATIONS)} 
              className={`text-sm font-semibold uppercase tracking-wide transition-colors ${currentView === ViewState.PUBLICATIONS ? 'text-hs-blue' : 'text-slate-700 hover:text-hs-blue'}`}
            >
              {t('nav.publications')}
            </button>
            
            {/* ADMIN LINK (Visible if logged in with specific emails) */}
            {isAdmin && (
              <button 
                onClick={() => handleNavigate(ViewState.ADMIN)} 
                className={`text-sm font-black uppercase tracking-widest flex items-center space-x-1 px-3 py-1 rounded-lg transition-all ${currentView === ViewState.ADMIN ? 'bg-hs-orange text-white' : 'text-hs-orange hover:bg-hs-orange/10'}`}
              >
                <Lock size={12} />
                <span>Admin</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
             {user ? (
               <div className="relative group/user">
                 <div 
                  className="hidden md:flex items-center mr-4 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 cursor-pointer hover:bg-slate-100 transition-all"
                 >
                   {user.photoURL ? (
                     <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full mr-2 object-cover" />
                   ) : (
                     <UserIcon size={14} className="mr-2 text-hs-blue" />
                   )}
                   {user.displayName || user.email}
                   <Settings size={12} className="ml-2 text-slate-300" />
                 </div>
                 
                 {/* User Dropdown with Storage Info */}
                 <div className="absolute top-full right-4 w-64 bg-white shadow-2xl rounded-2xl border border-slate-100 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all transform translate-y-2 group-hover/user:translate-y-0 overflow-hidden p-4">
                    <div className="mb-4">
                       <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                             <HardDrive size={12} className="mr-1" /> Storage
                          </span>
                          <span className="text-[10px] font-bold text-hs-blue">{formatBytes(usedStorage)} / 5 GB</span>
                       </div>
                       <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-500 ${storagePercentage > 90 ? 'bg-red-500' : 'bg-hs-accent'}`} 
                            style={{ width: `${storagePercentage}%` }}
                          />
                       </div>
                    </div>
                    <button onClick={() => handleNavigate(ViewState.PROFILE)} className="flex items-center w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors mb-1">
                       <UserIcon size={14} className="mr-3 text-hs-blue" /> Profile Settings
                    </button>
                    <button onClick={() => handleNavigate(ViewState.FILE_VAULT)} className="flex items-center w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors mb-1">
                       <Database size={14} className="mr-3 text-emerald-500" /> My File Vault
                    </button>
                    <div className="border-t border-slate-50 my-2"></div>
                    <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition-colors">
                       <LogOut size={14} className="mr-3" /> Log Out
                    </button>
                 </div>
               </div>
             ) : (
               <button 
                onClick={() => handleNavigate(ViewState.LOGIN)}
                className="hidden md:flex items-center bg-hs-blue text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-md"
               >
                 <LogIn size={14} className="mr-2" /> Anmelden
               </button>
             )}

             <div className="hidden md:flex items-center bg-slate-100 rounded-full p-1 cursor-pointer" onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}>
                <div className={`px-2 py-1 rounded-full text-[10px] font-black transition-all ${language === 'de' ? 'bg-white text-hs-blue shadow-sm' : 'text-slate-400'}`}>DE</div>
                <div className={`px-2 py-1 rounded-full text-[10px] font-black transition-all ${language === 'en' ? 'bg-white text-hs-blue shadow-sm' : 'text-slate-400'}`}>EN</div>
             </div>

             {user && (
               <button 
                onClick={handleLogout}
                className="md:hidden p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Abmelden"
               >
                 <LogOut size={20} />
               </button>
             )}

            <button className="lg:hidden text-hs-blue" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={28} /> : <Menu size={28} className="text-hs-orange" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-xl lg:hidden flex flex-col p-6 space-y-4 animate-fade-in overflow-y-auto max-h-[80vh]">
           {user && (
             <div className="bg-slate-50 p-4 rounded-2xl mb-2">
                <div className="flex items-center space-x-3 mb-3">
                   <div className="w-10 h-10 rounded-full bg-hs-blue flex items-center justify-center text-white overflow-hidden">
                      {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <UserIcon size={20} />}
                   </div>
                   <div>
                      <p className="font-bold text-hs-blue text-sm">{user.displayName || user.email}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Storage: {formatBytes(usedStorage)} / 5 GB</p>
                   </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                   <div className="bg-hs-accent h-1.5 rounded-full" style={{ width: `${storagePercentage}%` }} />
                </div>
             </div>
           )}
           <button onClick={() => handleNavigate(ViewState.HOME)} className="text-left font-bold text-hs-blue uppercase">{t('nav.startseite')}</button>
           <button onClick={() => handleNavigate(ViewState.CHANGE_MANAGER)} className="text-left font-bold text-hs-accent uppercase">{t('nav.tool.change')}</button>
           <button onClick={() => handleNavigate(ViewState.INNOVATION_IDEATOR)} className="text-left font-bold text-hs-orange uppercase">VentureForge</button>
           {user && (
             <button onClick={() => handleNavigate(ViewState.FILE_VAULT)} className="text-left font-bold text-emerald-600 uppercase flex items-center">
               <Database size={18} className="mr-2" /> File Vault
             </button>
           )}
           <button onClick={() => handleNavigate(ViewState.ORGANIZATION_ANALYZER)} className="text-left font-bold text-slate-600 uppercase">Organisation</button>
           <button onClick={scrollToConsultants} className="text-left font-bold text-hs-blue uppercase">{t('nav.berater')}</button>
           <button onClick={() => handleNavigate(ViewState.CLIENTS)} className="text-left font-bold text-hs-blue uppercase">{t('nav.kunden')}</button>
           <button onClick={() => handleNavigate(ViewState.PUBLICATIONS)} className="text-left font-bold text-hs-blue uppercase">{t('nav.publications')}</button>
           <button onClick={() => handleNavigate(ViewState.SECURITY)} className="text-left font-bold text-hs-blue uppercase">{t('nav.security')}</button>
           
           {isAdmin && (
             <button onClick={() => handleNavigate(ViewState.ADMIN)} className="text-left font-black text-hs-orange uppercase flex items-center">
               <Lock size={18} className="mr-2" /> Admin Dashboard
             </button>
           )}

           <button onClick={() => handleNavigate(ViewState.MICROTRAININGS)} className="text-left font-bold text-hs-accent uppercase">{t('nav.sol.micro')}</button>
           <button onClick={() => handleNavigate(ViewState.MINIMAL_INVASIVE_CHANGE)} className="text-left font-bold text-hs-accent uppercase">{t('nav.sol.invasive')}</button>
           <button onClick={() => handleNavigate(ViewState.QUICKSTART)} className="text-left font-bold text-hs-accent uppercase">{t('nav.sol.quick')}</button>
           <button onClick={() => handleNavigate(ViewState.SPRINT_MY_ORG)} className="text-left font-bold text-hs-accent uppercase">{t('nav.sol.sprint')}</button>
           <button onClick={() => handleNavigate(ViewState.PIMP_MY_ORG)} className="text-left font-bold text-hs-accent uppercase">{t('nav.sol.pimp')}</button>
           <button onClick={() => handleNavigate(ViewState.AGILE_CHANGE_BOOTCAMP)} className="text-left font-bold text-hs-accent uppercase">{t('nav.sol.bootcamp')}</button>
           {user && (
             <button onClick={() => handleNavigate(ViewState.PROFILE)} className="text-left font-bold text-hs-blue uppercase flex items-center">
               <UserIcon size={18} className="mr-2" /> Profil & Einstellungen
             </button>
           )}
           {!user && (
             <button onClick={() => handleNavigate(ViewState.LOGIN)} className="text-left font-bold text-hs-orange uppercase flex items-center">
               <LogIn size={18} className="mr-2" /> Anmelden
             </button>
           )}
           {user && (
             <button onClick={handleLogout} className="text-left font-bold text-red-500 uppercase flex items-center">
               <LogOut size={18} className="mr-2" /> Abmelden
             </button>
           )}
        </div>
      )}
    </nav>
  );
};