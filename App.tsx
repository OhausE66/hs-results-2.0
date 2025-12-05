import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { ChangeManager } from './pages/ChangeManager';
import { LeadershipRadar } from './pages/LeadershipRadar';
import { Footer } from './components/Footer';
import { ViewState } from './types';
import { UserCheck } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);

  const renderView = () => {
    switch (view) {
      case ViewState.HOME:
        return <Home setView={setView} />;
      case ViewState.CHANGE_MANAGER:
        return <ChangeManager />;
      case ViewState.LEADERSHIP_RADAR:
        return <LeadershipRadar />;
      case ViewState.LOGIN:
        return (
          <div className="min-h-screen flex items-center justify-center bg-slate-100 pt-20">
             <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                <div className="w-16 h-16 bg-hs-blue rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                  <UserCheck size={32} />
                </div>
                <h2 className="text-2xl font-bold text-hs-blue mb-2">Willkommen zurück</h2>
                <p className="text-slate-500 mb-6">Bitte loggen Sie sich ein, um auf Ihre Tools zuzugreifen.</p>
                <div className="space-y-4">
                  <input type="email" placeholder="E-Mail Adresse" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-hs-accent outline-none" />
                  <input type="password" placeholder="Passwort" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-hs-accent outline-none" />
                  <button 
                    onClick={() => setView(ViewState.LEADERSHIP_RADAR)}
                    className="w-full bg-hs-blue text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors"
                  >
                    Einloggen
                  </button>
                </div>
                <p className="mt-4 text-sm text-slate-400">Demo Mode: Klick auf Einloggen führt zum Radar</p>
             </div>
          </div>
        );
      default:
        return <Home setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Navigation currentView={view} setView={setView} />
      <main className="flex-grow">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
};

export default App;