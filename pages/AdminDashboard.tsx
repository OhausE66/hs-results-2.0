import React, { useState, useEffect, useRef } from 'react';
import { ViewState } from '../types';
import { 
  X, Plus, Edit, Trash2, Upload, Loader2, Database, ShieldAlert, Terminal, Eye, FileArchive, ChevronLeft, ExternalLink, Lock, Unlock, Settings2, ShieldCheck, Save, Image as ImageIcon, User, Mail, Phone, MapPin, ListPlus, FileText
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  db, 
  collection, 
  onSnapshot, 
  listHomepageAssets,
  deleteHomepageAsset,
  deleteConsultant,
  saveConsultant,
  uploadConsultantImage,
  uploadConsultantCV
} from '../services/firebase';

const ADMIN_EMAILS = [
  'olafheger@hs-results.com',
  'heger@hs-results.com', 
  'olaf.heger@gmail.com',
  'olafheger@arcor.de'
];

interface AdminDashboardProps {
  setView: (view: ViewState) => void;
  user: any;
}

interface ConsultantFormState {
  id?: string;
  name: string;
  title: string;
  img: string;
  cvUrl: string;
  email: string;
  phone: string;
  address: string;
  intro: string;
  focus: string; // Will be split by comma
  background: string; // Will be split by comma
  projects: string; // Will be split by comma
  customers: string; // Will be split by comma
}

const INITIAL_FORM: ConsultantFormState = {
  name: '',
  title: '',
  img: '',
  cvUrl: '',
  email: '',
  phone: '',
  address: '',
  intro: '',
  focus: '',
  background: '',
  projects: '',
  customers: ''
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setView, user }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'consultants' | 'assets' | 'system'>('consultants');
  const [consultants, setConsultants] = useState<any[]>([]);
  const [assets, setAssets] = useState<{name: string, url: string}[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Consultant Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ConsultantFormState>(INITIAL_FORM);
  const [savingConsultant, setSavingConsultant] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  useEffect(() => {
    if (!user || !isAdmin) return;
    const unsub = onSnapshot(collection(db, "consultants"), (snap) => {
      setConsultants(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [user, isAdmin]);

  useEffect(() => {
    if (activeTab === 'assets' && isAdmin) loadAssets();
  }, [activeTab, isAdmin]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const items = await listHomepageAssets();
      setAssets(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditConsultant = (c: any) => {
    setFormData({
      id: c.id,
      name: c.name || '',
      title: c.title || '',
      img: c.img || '',
      cvUrl: c.cvUrl || '',
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      intro: c.intro || '',
      focus: Array.isArray(c.focus) ? c.focus.join(', ') : '',
      background: Array.isArray(c.background) ? c.background.join(', ') : '',
      projects: Array.isArray(c.projects) ? c.projects.join(', ') : '',
      customers: Array.isArray(c.customers) ? c.customers.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  const handleSaveConsultant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setSavingConsultant(true);
    try {
      const dataToSave = {
        ...formData,
        focus: formData.focus.split(',').map(s => s.trim()).filter(s => s !== ''),
        background: formData.background.split(',').map(s => s.trim()).filter(s => s !== ''),
        projects: formData.projects.split(',').map(s => s.trim()).filter(s => s !== ''),
        customers: formData.customers.split(',').map(s => s.trim()).filter(s => s !== '')
      };
      await saveConsultant(dataToSave);
      setIsModalOpen(false);
      setFormData(INITIAL_FORM);
    } catch (err) {
      console.error("Save Consultant Error:", err);
      alert("Fehler beim Speichern des Profils.");
    } finally {
      setSavingConsultant(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData.name) {
      if (!formData.name) alert("Bitte geben Sie zuerst einen Namen ein, um das Bild zuzuordnen.");
      return;
    }
    setUploadingImage(true);
    try {
      const url = await uploadConsultantImage(file, formData.name);
      setFormData(prev => ({ ...prev, img: url }));
    } catch (err) {
      console.error("Image Upload Error:", err);
      alert("Fehler beim Hochladen des Bildes.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData.name) {
      if (!formData.name) alert("Bitte geben Sie zuerst einen Namen ein, um die PDF zuzuordnen.");
      return;
    }
    setUploadingCV(true);
    try {
      const url = await uploadConsultantCV(file, formData.name);
      setFormData(prev => ({ ...prev, cvUrl: url }));
    } catch (err) {
      console.error("CV Upload Error:", err);
      alert("Fehler beim Hochladen der PDF.");
    } finally {
      setUploadingCV(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="pt-32 min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <ShieldAlert size={64} className="text-red-500 mb-6" />
        <h1 className="text-2xl font-black uppercase">Zugriff verweigert</h1>
        <p className="text-slate-400 mt-2">Sie verfügen nicht über Administrator-Rechte.</p>
        <button onClick={() => setView(ViewState.HOME)} className="mt-8 bg-hs-blue px-8 py-3 rounded-xl font-bold uppercase text-xs">Zurück zur Startseite</button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-900 text-white px-4">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => setView(ViewState.HOME)} 
          className="mb-8 flex items-center text-slate-500 hover:text-hs-orange transition-colors font-black uppercase text-xs tracking-widest"
        >
          <ChevronLeft size={16} className="mr-1" /> {t('ui.back')}
        </button>

        <div className="bg-slate-800 rounded-[3rem] p-10 shadow-2xl border border-white/5">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-hs-orange rounded-2xl shadow-lg">
                <Terminal size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight">Backend Control Center</h1>
                <p className="text-hs-orange font-bold uppercase text-[10px] tracking-widest">Master Management Module</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
               <a 
                 href="https://console.firebase.google.com/project/hs-results/overview" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl transition-all font-black text-xs uppercase"
               >
                 <ExternalLink size={16} /> <span>Firebase Console</span>
               </a>
            </div>
          </div>

          <div className="flex space-x-2 mb-10 bg-white/5 p-1 rounded-2xl w-fit border border-white/10">
            <button onClick={() => setActiveTab('consultants')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'consultants' ? 'bg-hs-orange text-white' : 'text-slate-400 hover:text-white'}`}>Berater</button>
            <button onClick={() => setActiveTab('assets')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'assets' ? 'bg-hs-orange text-white' : 'text-slate-400 hover:text-white'}`}>Cloud Assets</button>
            <button onClick={() => setActiveTab('system')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'system' ? 'bg-hs-orange text-white' : 'text-slate-400 hover:text-white'}`}>Sicherheit & Regeln</button>
          </div>

          {activeTab === 'consultants' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold uppercase">Berater-Profile ({consultants.length})</h3>
                <button 
                  onClick={() => { setFormData(INITIAL_FORM); setIsModalOpen(true); }}
                  className="flex items-center space-x-2 bg-hs-blue hover:bg-hs-orange px-6 py-3 rounded-xl transition-all font-black text-xs uppercase shadow-lg"
                >
                  <Plus size={16} /> <span>Neu anlegen</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {consultants.map((c, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center space-x-6 group">
                    <img src={c.img} className="w-16 h-16 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" alt={c.name} />
                    <div className="flex-grow">
                      <p className="font-bold text-lg">{c.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[150px]">{c.title}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEditConsultant(c)} className="p-2 bg-white/5 hover:bg-hs-accent rounded-lg transition-colors"><Edit size={16}/></button>
                      <button onClick={() => deleteConsultant(c.name, c.id)} className="p-2 bg-white/5 hover:bg-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold uppercase">Mediathek (Homepage Assets)</h3>
                <button className="flex items-center space-x-2 bg-hs-blue hover:bg-hs-orange px-6 py-3 rounded-xl transition-all font-black text-xs uppercase shadow-lg">
                  <Upload size={16} /> <span>Asset Hochladen</span>
                </button>
              </div>
              {loading ? <Loader2 size={32} className="animate-spin mx-auto text-hs-orange" /> : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {assets.map((asset, i) => (
                    <div key={i} className="group relative aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                      <img src={asset.url} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" alt={asset.name} />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button onClick={() => window.open(asset.url, '_blank')} className="p-2 bg-white/10 hover:bg-hs-accent rounded-lg"><Eye size={16}/></button>
                        <button onClick={() => deleteHomepageAsset(asset.name)} className="p-2 bg-white/10 hover:bg-red-500 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/40 backdrop-blur-sm">
                        <p className="text-[8px] font-bold truncate uppercase tracking-widest">{asset.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-10 animate-fade-in">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2rem] flex items-start space-x-6">
                <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase text-emerald-500 mb-2">Plattform ist gesichert</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Der Login-Bypass wurde entfernt. Nur autorisierte Admins können systemkritische Daten ändern. Nutzer haben nur Zugriff auf ihre eigenen Dokumente im Vault.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-black/40 border border-white/5 p-8 rounded-3xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <Database className="text-hs-orange" />
                    <h4 className="font-bold uppercase tracking-widest text-xs">Firestore Rules (Vorschau)</h4>
                  </div>
                  <pre className="p-6 rounded-2xl text-[10px] font-mono text-emerald-500 overflow-x-auto whitespace-pre">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth.token.email in [
        'olafheger@hs-results.com',
        'heger@hs-results.com',
        'olaf.heger@gmail.com',
        'olafheger@arcor.de'
      ];
    }
    match /users/{userId}/{all=**} {
      allow read, write: if request.auth.uid == userId || isAdmin();
    }
    match /consultants/{all=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}`}
                  </pre>
                </div>
                <div className="bg-black/40 border border-white/5 p-8 rounded-3xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <FileArchive className="text-hs-accent" />
                    <h4 className="font-bold uppercase tracking-widest text-xs">Storage Rules (Vorschau)</h4>
                  </div>
                  <pre className="p-6 rounded-2xl text-[10px] font-mono text-hs-accent overflow-x-auto whitespace-pre">
{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth.token.email in [
        'olafheger@hs-results.com',
        'heger@hs-results.com',
        'olaf.heger@gmail.com',
        'olafheger@arcor.de'
      ];
    }
    match /user_uploads/{userId}/{all=**} {
      allow read, write: if request.auth.uid == userId || isAdmin();
    }
    match /homepage_assets/{all=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Consultant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-800 w-full max-w-4xl my-8 rounded-[3rem] shadow-2xl border border-white/10 relative flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
               <div className="flex items-center space-x-4">
                  <div className="p-3 bg-hs-blue rounded-2xl">
                     <User size={24} />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">{formData.id ? 'Berater bearbeiten' : 'Neuen Berater anlegen'}</h3>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-red-500 rounded-full transition-colors">
                  <X size={24} />
               </button>
            </div>
            
            <form onSubmit={handleSaveConsultant} className="p-10 overflow-y-auto flex-grow space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Vollständiger Name</label>
                        <input 
                          type="text" 
                          required
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-hs-orange transition-all" 
                          placeholder="z.B. Olaf Heger"
                        />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Titel / Rolle</label>
                        <input 
                          type="text" 
                          value={formData.title} 
                          onChange={e => setFormData({...formData, title: e.target.value})}
                          className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-hs-orange transition-all" 
                          placeholder="z.B. Co-Founder hs:results"
                        />
                     </div>
                     <div className="grid grid-cols-1 gap-4">
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Profilbild URL</label>
                           <div className="flex space-x-2">
                              <input 
                                type="text" 
                                value={formData.img} 
                                onChange={e => setFormData({...formData, img: e.target.value})}
                                className="flex-grow p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-hs-orange transition-all text-xs" 
                                placeholder="https://..."
                              />
                              <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="bg-hs-blue p-4 rounded-2xl hover:bg-hs-orange transition-all disabled:opacity-50"
                              >
                                 {uploadingImage ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                              </button>
                              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                           </div>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 gap-4">
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Profil-PDF (Lebenslauf)</label>
                           <div className="flex space-x-2">
                              <input 
                                type="text" 
                                value={formData.cvUrl} 
                                onChange={e => setFormData({...formData, cvUrl: e.target.value})}
                                className="flex-grow p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-hs-orange transition-all text-xs" 
                                placeholder="https://..."
                              />
                              <button 
                                type="button"
                                onClick={() => cvInputRef.current?.click()}
                                disabled={uploadingCV}
                                className="bg-hs-accent p-4 rounded-2xl hover:bg-hs-orange transition-all disabled:opacity-50"
                              >
                                 {uploadingCV ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                              </button>
                              <input type="file" ref={cvInputRef} onChange={handleCVUpload} className="hidden" accept="application/pdf" />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex items-center space-x-3 text-hs-accent border-b border-white/5 pb-2">
                        <Mail size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Kontakt-Details</span>
                     </div>
                     <div>
                        <input 
                          type="email" 
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-hs-accent transition-all text-sm mb-3" 
                          placeholder="E-Mail"
                        />
                        <input 
                          type="text" 
                          value={formData.phone} 
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-hs-accent transition-all text-sm mb-3" 
                          placeholder="Telefon"
                        />
                        <input 
                          type="text" 
                          value={formData.address} 
                          onChange={e => setFormData({...formData, address: e.target.value})}
                          className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-hs-accent transition-all text-sm" 
                          placeholder="Adresse"
                        />
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Intro / Mission</label>
                     <textarea 
                       value={formData.intro} 
                       onChange={e => setFormData({...formData, intro: e.target.value})}
                       className="w-full h-24 p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-hs-orange transition-all text-sm resize-none" 
                       placeholder="Persönlicher Fokus..."
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Expertise (kommagetrennt)</label>
                        <textarea 
                          value={formData.focus} 
                          onChange={e => setFormData({...formData, focus: e.target.value})}
                          className="w-full h-32 p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm resize-none" 
                          placeholder="Change Management, Agilität, ..."
                        />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-hs-accent mb-2">Schwerpunkte / Projekte (kommagetrennt)</label>
                        <textarea 
                          value={formData.projects} 
                          onChange={e => setFormData({...formData, projects: e.target.value})}
                          className="w-full h-32 p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-hs-accent transition-all text-sm resize-none" 
                          placeholder="Post-Merger-Integration, ..."
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Hintergrund (kommagetrennt)</label>
                        <textarea 
                          value={formData.background} 
                          onChange={e => setFormData({...formData, background: e.target.value})}
                          className="w-full h-24 p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-white transition-all text-sm resize-none" 
                          placeholder="Dipl.-Kfm, Zertifizierter Coach, ..."
                        />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-hs-orange mb-2">Kunden-Referenzen (kommagetrennt)</label>
                        <textarea 
                          value={formData.customers} 
                          onChange={e => setFormData({...formData, customers: e.target.value})}
                          className="w-full h-24 p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-hs-orange transition-all text-sm resize-none" 
                          placeholder="Siemens, Lufthansa, ..."
                        />
                     </div>
                  </div>
               </div>

               <div className="pt-8 border-t border-white/5 flex justify-end space-x-4 shrink-0">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-4 rounded-2xl font-black uppercase text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button 
                    type="submit"
                    disabled={savingConsultant || !formData.name}
                    className="bg-hs-orange text-white px-10 py-4 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-hs-blue transition-all flex items-center disabled:opacity-50"
                  >
                    {savingConsultant ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                    Profil speichern
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};