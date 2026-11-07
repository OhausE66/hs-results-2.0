
import React, { useState, useEffect, useRef } from 'react';
import { 
  auth, 
  db, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  deleteUser, 
  signOut,
  updateProfile,
  uploadUserProfileImage,
  deleteUserProfileImage,
  collection,
  getDocs,
  writeBatch,
  storage,
  ref,
  listAll,
  deleteObject
} from '../services/firebase';
import { User, Mail, Shield, Trash2, Save, Loader2, CheckCircle, Camera, AlertTriangle, AlertCircle, X, HardDrive, Download } from 'lucide-react';
import { ViewState, UserProfile } from '../types';

interface ProfileProps {
  user: any;
  setView: (view: ViewState) => void;
  usedStorage?: number;
}

export const Profile: React.FC<ProfileProps> = ({ user, setView, usedStorage = 0 }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STORAGE_LIMIT = 5 * 1024 * 1024 * 1024; // 5 GB
  const storagePercentage = Math.min((usedStorage / STORAGE_LIMIT) * 100, 100);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const [editData, setEditData] = useState({
    name: '',
    photoURL: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          setEditData({ name: data.name, photoURL: data.photoURL });
        } else {
          // Fallback to auth user data if firestore doc doesn't exist yet
          setEditData({ 
            name: user.displayName || '', 
            photoURL: user.photoURL || '' 
          });
        }
      } catch {
        console.error('Profile load failed');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMsg(null);
    try {
      const docRef = doc(db, "users", user.uid);
      const updateData = {
        name: editData.name,
        photoURL: editData.photoURL,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(docRef, updateData);
      
      await updateProfile(user, { 
        displayName: editData.name,
        photoURL: editData.photoURL
      });

      setProfile(prev => prev ? { ...prev, name: editData.name, photoURL: editData.photoURL } : null);
      setMsg({ type: 'success', text: 'Profil erfolgreich aktualisiert.' });
    } catch {
      setMsg({ type: 'error', text: 'Fehler beim Speichern. Bitte versuchen Sie es erneut.' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMsg({ type: 'error', text: 'Bitte wählen Sie ein JPG-, PNG- oder WebP-Bild.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'Das Bild ist zu groß (Max. 5MB).' });
      return;
    }

    setUploadingImage(true);
    setMsg(null);
    try {
      const url = await uploadUserProfileImage(user.uid, file);
      
      // Update local state
      setEditData(prev => ({ ...prev, photoURL: url }));
      
      // Update Firebase Auth
      await updateProfile(user, { photoURL: url });
      
      // Update Firestore
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { photoURL: url, updatedAt: new Date().toISOString() });
      
      setProfile(prev => prev ? { ...prev, photoURL: url } : null);
      setMsg({ type: 'success', text: 'Profilbild erfolgreich hochgeladen.' });
    } catch {
      setMsg({ type: 'error', text: 'Das Profilbild konnte nicht hochgeladen werden. Bitte versuchen Sie es erneut.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user || !editData.photoURL) return;
    if (!confirm("Profilbild wirklich löschen?")) return;

    setUploadingImage(true);
    setMsg(null);
    try {
      await deleteUserProfileImage(user.uid);
      
      setEditData(prev => ({ ...prev, photoURL: '' }));
      await updateProfile(user, { photoURL: '' });
      
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { photoURL: '', updatedAt: new Date().toISOString() });
      
      setProfile(prev => prev ? { ...prev, photoURL: '' } : null);
      setMsg({ type: 'success', text: 'Profilbild gelöscht.' });
    } catch {
      setMsg({ type: 'error', text: 'Das Profilbild konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const listStoragePaths = async (folderPath: string): Promise<string[]> => {
    const folder = await listAll(ref(storage, folderPath));
    const nested = await Promise.all(folder.prefixes.map((prefix) => listStoragePaths(prefix.fullPath)));
    return [...folder.items.map((item) => item.fullPath), ...nested.flat()];
  };

  const deleteStorageFolder = async (folderPath: string) => {
    const folder = await listAll(ref(storage, folderPath));
    await Promise.all([
      ...folder.items.map((item) => deleteObject(item)),
      ...folder.prefixes.map((prefix) => deleteStorageFolder(prefix.fullPath)),
    ]);
  };

  const getExportDownloadLinks = async (): Promise<Array<{ path: string; url: string; expiresAt: string }>> => {
    const token = await user.getIdToken();
    const links: Array<{ path: string; url: string; expiresAt: string }> = [];
    let cursor: string | null = null;
    do {
      const response = await fetch('/api/account/export-downloads', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cursor ? { cursor } : {}),
      });
      if (!response.ok) throw new Error('Export links unavailable');
      const page = await response.json();
      if (!Array.isArray(page.links) || (page.nextCursor !== null && typeof page.nextCursor !== 'string')) {
        throw new Error('Invalid export response');
      }
      links.push(...page.links);
      cursor = page.nextCursor;
    } while (cursor);
    return links;
  };

  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);
    setMsg(null);
    try {
      const uid = user.uid;
      const collectionNames = ['files', 'projects', 'orgContexts'];
      const [userSnap, ...collectionSnaps] = await Promise.all([
        getDoc(doc(db, 'users', uid)),
        ...collectionNames.map((name) => getDocs(collection(db, 'users', uid, name))),
      ]);
      const [uploads, profileImages, downloadLinks] = await Promise.all([
        listStoragePaths(`user_uploads/${uid}`),
        listStoragePaths(`user_profiles/${uid}`),
        // Ohne Download-Links soll der übrige Export trotzdem funktionieren.
        getExportDownloadLinks().catch(() => null),
      ]);
      const collections = Object.fromEntries(collectionSnaps.map((snap, index) => [
        collectionNames[index],
        snap.docs.map((entry) => ({ id: entry.id, data: entry.data() })),
      ]));
      const exportData = {
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        firebaseAuth: {
          uid: user.uid,
          email: user.email || null,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          emailVerified: Boolean(user.emailVerified),
          providerIds: (user.providerData || []).map((provider: any) => provider.providerId),
          metadata: {
            creationTime: user.metadata?.creationTime || null,
            lastSignInTime: user.metadata?.lastSignInTime || null,
          },
        },
        firestore: {
          user: userSnap.exists() ? userSnap.data() : null,
          collections,
        },
        storage: {
          objectPaths: [...uploads, ...profileImages],
          downloadLinks: downloadLinks ?? [],
          ...(downloadLinks === null ? { downloadLinksError: 'Die Download-Links konnten gerade nicht erstellt werden. Bitte versuchen Sie den Export später erneut.' } : {}),
          note: 'Binärdateien sind nicht in die JSON-Datei eingebettet. Die Download-Links gelten jeweils nur 15 Minuten ab Erstellung; danach kann der Export erneut erzeugt werden.',
        },
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hs-results-meine-daten-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMsg({ type: 'success', text: 'Ihr Datenexport wurde heruntergeladen.' });
    } catch {
      setMsg({ type: 'error', text: 'Der Datenexport konnte nicht erstellt werden. Bitte versuchen Sie es erneut.' });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    setMsg(null);
    
    try {
      const uid = user.uid;

      // Delete all user storage paths, including the separately stored profile image.
      await deleteStorageFolder(`user_uploads/${uid}`);
      await deleteStorageFolder(`user_profiles/${uid}`);

      // Delete every user-owned Firestore path used by this application. Firestore
      // batches permit 500 writes, so large vaults are processed in safe chunks.
      const collectionNames = ['files', 'projects', 'orgContexts'];
      const snapshots = await Promise.all(collectionNames.map((name) => getDocs(collection(db, 'users', uid, name))));
      const references = [...snapshots.flatMap((snapshot) => snapshot.docs.map((entry) => entry.ref)), doc(db, 'users', uid)];
      for (let offset = 0; offset < references.length; offset += 500) {
        const batch = writeBatch(db);
        references.slice(offset, offset + 500).forEach((reference) => batch.delete(reference));
        await batch.commit();
      }

      // 3. Delete user from Firebase Authentication
      await deleteUser(user);
      
      // 4. Sign out and redirect
      await signOut(auth);
      setView(ViewState.HOME);
      
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setMsg({ 
          type: 'error', 
          text: 'Um Ihr Konto zu löschen, müssen Sie sich aus Sicherheitsgründen erneut anmelden.' 
        });
      } else {
        setMsg({ 
          type: 'error', 
          text: 'Ein Fehler ist beim Löschen Ihres Kontos aufgetreten. Bitte versuchen Sie es erneut.'
        });
      }
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <Loader2 className="animate-spin text-hs-blue" size={48} />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen px-4">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        
        {/* Storage Space Loader */}
        <div className="bg-white p-6 rounded-[1.5rem] shadow-md border border-slate-100 flex items-center space-x-6">
           <div className={`p-4 rounded-2xl ${storagePercentage > 90 ? 'bg-red-50 text-red-600' : 'bg-hs-blue/5 text-hs-blue'}`}>
              <HardDrive size={32} />
           </div>
           <div className="flex-grow">
              <div className="flex justify-between items-end mb-2">
                 <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Memory Usage</h4>
                    <p className="text-2xl font-black text-hs-blue">{formatBytes(usedStorage)}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-bold text-slate-400">Total: 5 GB</p>
                    <p className={`text-xs font-black ${storagePercentage > 90 ? 'text-red-500' : 'text-hs-accent'}`}>{Math.round(storagePercentage)}% taken</p>
                 </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                 <div 
                   className={`h-full rounded-full transition-all duration-1000 ease-out ${storagePercentage > 90 ? 'bg-red-500' : 'bg-hs-accent'}`} 
                   style={{ width: `${storagePercentage}%` }}
                 />
              </div>
           </div>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-hs-blue p-10 text-white text-center relative">
            <div className="relative inline-block group mb-4">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg relative">
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                    <Loader2 className="animate-spin text-white" size={32} />
                  </div>
                )}
                {editData.photoURL ? (
                  <img src={editData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-hs-blue">
                    <User size={64} />
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-hs-orange p-2 rounded-full border-2 border-white shadow-md cursor-pointer hover:bg-hs-accent transition-colors"
                title="Bild ändern"
                disabled={uploadingImage}
              >
                <Camera size={16} />
              </button>
              {editData.photoURL && !uploadingImage && (
                <button 
                  onClick={handleRemovePhoto}
                  className="absolute top-0 right-0 bg-red-500 p-1.5 rounded-full border-2 border-white shadow-md cursor-pointer hover:bg-red-600 transition-colors"
                  title="Bild entfernen"
                >
                  <X size={12} />
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight">{profile?.name || user.displayName || 'Gast'}</h1>
            <p className="text-hs-accent text-sm font-bold opacity-80 uppercase tracking-widest mt-1">
              Mitglied seit {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
            </p>
          </div>

          <div className="p-10 space-y-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Vollständiger Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-hs-accent outline-none"
                      placeholder="Ihr Name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">E-Mail Adresse (Gelesen aus Auth)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-300" size={18} />
                    <input 
                      type="email" 
                      value={user.email}
                      disabled
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {msg && (
              <div className={`p-4 rounded-xl flex items-center space-x-3 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="text-sm font-bold">{msg.text}</span>
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <button 
                onClick={handleSave}
                disabled={saving || uploadingImage}
                className="flex-grow bg-hs-blue text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-lg flex items-center justify-center disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save className="mr-2" size={20} />}
                Änderungen speichern
              </button>
            </div>

            <div className="border-t border-slate-100 pt-10">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                <Shield size={16} className="mr-2 text-red-500" /> Account Verwaltung
              </h3>
              <button
                onClick={handleExportData}
                disabled={exporting || deleting}
                className="w-full mb-3 bg-slate-50 text-hs-blue py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center border border-slate-200 disabled:opacity-50"
              >
                {exporting ? <Loader2 className="animate-spin mr-2" size={20} /> : <Download className="mr-2" size={20} />}
                Meine Daten exportieren
              </button>
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center border border-red-100"
                >
                  <Trash2 className="mr-2" size={20} />
                  Account löschen
                </button>
              ) : (
                <div className="bg-red-50 p-6 rounded-2xl border border-red-200 animate-shake">
                  <div className="flex items-start space-x-3 mb-6">
                    <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
                    <div>
                      <h4 className="text-red-900 font-bold uppercase text-xs">Sind Sie sicher?</h4>
                      <p className="text-red-700 text-xs mt-1">Dieser Vorgang löscht all Ihre Daten, Dateien und Ihren Zugang unwiderruflich.</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-grow bg-white text-slate-600 py-3 rounded-xl font-bold text-xs uppercase hover:bg-slate-100 transition-all border border-slate-200"
                    >
                      Abbrechen
                    </button>
                    <button 
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="flex-grow bg-red-600 text-white py-3 rounded-xl font-bold text-xs uppercase hover:bg-red-700 transition-all shadow-md flex items-center justify-center"
                    >
                      {deleting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                      Ja, Löschen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
