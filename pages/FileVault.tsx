
import React, { useState, useEffect, useRef } from 'react';
import { 
  db, storage, auth, collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, 
  ref, uploadBytesResumable, getDownloadURL, deleteObject 
} from '../services/firebase';
import { summarizeFileContent } from '../services/geminiService';
import { FileRecord, ViewState, SavedProject } from '../types';
import { 
  File, Upload, Trash2, Download, Search, Sparkles, 
  FileText, Clock, ChevronLeft, CheckCircle, 
  Loader2, AlertCircle, FileSpreadsheet, FileArchive, Eye, Layout, Cpu, FolderOpen, Mail, Check, X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const FileVault: React.FC<{ user: any, setView: (v: ViewState) => void }> = ({ user, setView }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'FILES' | 'PROJECTS'>('FILES');
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [emailModal, setEmailModal] = useState<{ open: boolean, email: string, sending: boolean, success: boolean }>({ open: false, email: '', sending: false, success: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    // Listen for Files
    const filesRef = collection(db, "users", user.uid, "files");
    const qFiles = query(filesRef, orderBy("uploadDate", "desc"));
    const unsubFiles = onSnapshot(qFiles, (snapshot) => {
      setFiles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FileRecord)));
      if (activeTab === 'FILES') setLoading(false);
    });

    // Listen for Projects (Sessions)
    const projectsRef = collection(db, "users", user.uid, "projects");
    const qProjects = query(projectsRef, orderBy("updatedAt", "desc"));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedProject)));
      if (activeTab === 'PROJECTS') setLoading(false);
    });

    return () => { unsubFiles(); unsubProjects(); };
  }, [user, activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 20 * 1024 * 1024) { setUploadError("Max. 20MB"); return; }

    setUploadError(null);
    const fileId = Date.now().toString();
    const storagePath = `user_uploads/${user.uid}/${fileId}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
      (error) => setUploadError(error.message),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const record: FileRecord = {
          id: fileId, fileName: file.name, fileType: file.type, fileSize: file.size,
          uploadDate: new Date().toISOString(), downloadURL, storagePath, notes: '', aiSummary: 'Analyse läuft...', status: 'processing'
        };
        await setDoc(doc(db, "users", user.uid, "files", fileId), record);
        setUploadProgress(null);
        setTimeout(async () => {
           const summary = await summarizeFileContent(file.name, `Content Preview of ${file.name}`, language);
           await updateDoc(doc(db, "users", user.uid, "files", fileId), { aiSummary: summary, status: 'ready' });
        }, 1000);
      }
    );
  };

  const handleFileDownload = async (file: FileRecord) => {
    try {
      const storageRef = ref(storage, file.storagePath);
      const url = await getDownloadURL(storageRef);
      window.open(url, '_blank');
    } catch (err) {
      console.error("Download Error", err);
      alert("Fehler beim Abrufen der Datei.");
    }
  };

  const handleExportProject = (project: SavedProject) => {
    const content = `
HS-RESULTS BERICHT
Titel: ${project.title}
Datum: ${new Date(project.updatedAt).toLocaleString()}
Tool: ${project.toolId}

ZUSAMMENFASSUNG:
${project.results?.summary || 'N/A'}

DETAILS:
${JSON.stringify(project.results?.data || project.results || {}, null, 2)}
    `;
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `HS_Results_${project.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendEmail = () => {
    setEmailModal({ ...emailModal, sending: true });
    // Simulation des E-Mail-Versands
    setTimeout(() => {
      setEmailModal({ ...emailModal, sending: false, success: true });
      setTimeout(() => setEmailModal({ ...emailModal, open: false, success: false }), 2000);
    }, 1500);
  };

  const handleDeleteProject = async (id: string) => {
     if (!confirm("Projekt unwiderruflich löschen?")) return;
     await deleteDoc(doc(db, "users", user.uid, "projects", id));
     if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleDeleteFile = async (file: FileRecord) => {
    if (!confirm(`"${file.fileName}" löschen?`)) return;
    await deleteObject(ref(storage, file.storagePath));
    await deleteDoc(doc(db, "users", user.uid, "files", file.id));
    if (selectedItem?.id === file.id) setSelectedItem(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredItems = (activeTab === 'FILES' ? files : projects).filter(item => {
    const name = activeTab === 'FILES' ? (item as FileRecord).fileName : (item as SavedProject).title;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 space-y-6">
          <div>
            <button onClick={() => setView(ViewState.HOME)} className="flex items-center text-slate-400 hover:text-hs-blue transition-colors font-black uppercase text-xs tracking-widest mb-4">
              <ChevronLeft size={16} className="mr-1" /> {t('ui.back')}
            </button>
            <h1 className="text-4xl font-black text-hs-blue uppercase tracking-tight">Intelligence Vault</h1>
            <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200 mt-4 w-fit">
               <button onClick={() => { setActiveTab('FILES'); setSelectedItem(null); }} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'FILES' ? 'bg-hs-blue text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>Dokumente</button>
               <button onClick={() => { setActiveTab('PROJECTS'); setSelectedItem(null); }} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'PROJECTS' ? 'bg-hs-blue text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>Projekt-Sessions</button>
            </div>
          </div>
          
          <div className="flex space-x-3 w-full md:w-auto">
             <div className="relative flex-grow md:w-64">
                <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                <input type="text" placeholder="Durchsuchen..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-white" />
             </div>
             {activeTab === 'FILES' && (
               <>
                 <button onClick={() => fileInputRef.current?.click()} disabled={uploadProgress !== null} className="bg-hs-blue text-white px-6 py-2.5 rounded-xl font-bold flex items-center shadow-lg hover:bg-hs-orange disabled:opacity-50 transition-all">
                    <Upload size={18} className="mr-2" /> Hochladen
                 </button>
                 <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
               </>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-4">
              {loading ? (
                <div className="bg-white p-20 rounded-3xl text-center shadow-sm"><Loader2 size={40} className="animate-spin mx-auto text-slate-300 mb-4" /></div>
              ) : filteredItems.length === 0 ? (
                <p className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest border-2 border-dashed border-slate-200 rounded-3xl bg-white">Keine Einträge</p>
              ) : activeTab === 'FILES' ? (
                files.map(f => (
                  <div key={f.id} onClick={() => setSelectedItem(f)} className={`group bg-white p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center space-x-5 ${selectedItem?.id === f.id ? 'border-hs-accent shadow-md' : 'border-white hover:border-slate-100'}`}>
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-hs-blue"><FileText size={24}/></div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-hs-blue truncate">{f.fileName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1"><Clock size={10} className="inline mr-1"/> {new Date(f.uploadDate).toLocaleDateString()} • {formatSize(f.fileSize)}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteFile(f); }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500"><Trash2 size={20}/></button>
                  </div>
                ))
              ) : (
                projects.map(p => (
                  <div key={p.id} onClick={() => setSelectedItem(p)} className={`group bg-white p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center space-x-5 ${selectedItem?.id === p.id ? 'border-hs-orange shadow-md' : 'border-white hover:border-slate-100'}`}>
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-hs-orange"><FolderOpen size={24}/></div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-hs-blue truncate">{p.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1"><Clock size={10} className="inline mr-1"/> {new Date(p.updatedAt).toLocaleString()} • {p.toolId}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id); }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500"><Trash2 size={20}/></button>
                  </div>
                ))
              )}
           </div>

           <div className="lg:col-span-4">
              <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 sticky top-24 min-h-[400px]">
                 {selectedItem ? (
                   <div className="animate-fade-in space-y-6">
                      <div className="flex items-center space-x-2 text-hs-accent mb-2">
                        <Sparkles size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Workspace Insights</span>
                      </div>
                      <h3 className="font-black text-xl text-hs-blue leading-tight mb-2">{selectedItem.fileName || selectedItem.title}</h3>
                      
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 italic text-sm text-slate-600 leading-relaxed max-h-48 overflow-y-auto">
                         "{selectedItem.aiSummary || selectedItem.results?.summary || 'Keine Zusammenfassung verfügbar.'}"
                      </div>
                      
                      {activeTab === 'PROJECTS' && (
                         <div className="space-y-3 pt-4">
                            <button 
                               onClick={() => handleExportProject(selectedItem)}
                               className="w-full bg-hs-blue text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-hs-orange transition-all flex items-center justify-center shadow-lg"
                            >
                               <Download size={16} className="mr-2" /> {t('ui.download')}
                            </button>
                            <button 
                               onClick={() => setEmailModal({ ...emailModal, open: true, email: user.email || '' })}
                               className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center"
                            >
                               <Mail size={16} className="mr-2" /> {t('ui.email')}
                            </button>
                         </div>
                      )}
                      
                      {activeTab === 'FILES' && (
                        <button 
                          onClick={() => handleFileDownload(selectedItem)}
                          className="w-full bg-hs-blue text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center shadow-lg"
                        >
                          <Download size={18} className="mr-2" /> Datei herunterladen
                        </button>
                      )}
                      
                      <div className="pt-6 border-t border-slate-100">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Details</p>
                         <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500">
                            <div>Erstellt: {new Date(selectedItem.uploadDate || selectedItem.createdAt).toLocaleDateString()}</div>
                            <div>Typ: {selectedItem.fileType || selectedItem.toolId}</div>
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="py-20 text-center text-slate-300">
                      <Layout size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="font-bold uppercase text-[10px] tracking-widest">Wählen Sie einen Datensatz aus der Liste</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* E-MAIL MODAL */}
      {emailModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4 animate-fade-in">
           <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setEmailModal({ ...emailModal, open: false })} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600"><X size={20}/></button>
              <h3 className="text-xl font-black text-hs-blue uppercase mb-6 flex items-center"><Mail size={24} className="mr-3 text-hs-orange" /> Bericht senden</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">Der Analysebericht wird als formatierte E-Mail an die unten stehende Adresse gesendet.</p>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Empfänger-Email</label>
                    <input 
                      type="email" 
                      value={emailModal.email} 
                      onChange={e => setEmailModal({...emailModal, email: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-hs-blue"
                      placeholder={t('ui.email.placeholder')}
                    />
                 </div>

                 {emailModal.success ? (
                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl flex items-center justify-center font-bold text-sm">
                       <Check size={20} className="mr-2" /> {t('ui.email.success')}
                    </div>
                 ) : (
                    <button 
                      onClick={handleSendEmail}
                      disabled={emailModal.sending || !emailModal.email}
                      className="w-full bg-hs-blue text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all flex items-center justify-center shadow-lg disabled:opacity-30"
                    >
                       {emailModal.sending ? <Loader2 size={20} className="animate-spin" /> : 'Bericht absenden'}
                    </button>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
