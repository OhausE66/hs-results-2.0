import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, limit, addDoc, writeBatch, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable, listAll } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { SavedProject, OrgContextData } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyDcxw5fnLOCE0NR-1sBmjLgNjf5HBJwNus",
  authDomain: "hs-results.firebaseapp.com",
  projectId: "hs-results",
  storageBucket: "hs-results.firebasestorage.app",
  messagingSenderId: "780605608312",
  appId: "1:780605608312:web:75a668f1970ff6f7d9388d",
  measurementId: "G-K0PRXBR8VT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export const isFirebaseConfigured = firebaseConfig.projectId !== "dein-projekt-id" && firebaseConfig.apiKey !== "DEIN_API_KEY";

export { 
  db, 
  storage, 
  auth, 
  collection, 
  getDocs, 
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  addDoc,
  writeBatch,
  where,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  doc,
  setDoc,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll
};

// --- Project Storage Helpers ---

export const saveProjectSession = async (uid: string, project: Omit<SavedProject, 'id'>) => {
  if (!uid) return;
  const projectsRef = collection(db, "users", uid, "projects");
  return await addDoc(projectsRef, {
    ...project,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};

export const saveSharedOrgContext = async (uid: string, context: OrgContextData) => {
  if (!uid) return;
  const contextRef = collection(db, "users", uid, "orgContexts");
  
  if (context.id) {
    const docRef = doc(db, "users", uid, "orgContexts", context.id);
    const existing = await getDoc(docRef);
    const existingData = existing.exists() ? existing.data() : {};
    
    await setDoc(docRef, { 
      ...existingData,
      ...context, 
      updatedAt: new Date().toISOString() 
    }, { merge: true });
    return context.id;
  }
  
  const res = await addDoc(contextRef, {
    ...context,
    updatedAt: new Date().toISOString()
  });
  return res.id;
};

export const updateOrgContextResults = async (uid: string, profileId: string, results: OrgContextData['lastAnalysisResults']) => {
  if (!uid || !profileId || !results) return;
  const docRef = doc(db, "users", uid, "orgContexts", profileId);
  await updateDoc(docRef, {
    lastAnalysisResults: results,
    updatedAt: new Date().toISOString()
  });
};

// Fix for line 121: A function whose declared type is neither 'undefined', 'void', nor 'any' must return a value.
export const getSharedOrgContexts = async (uid: string): Promise<OrgContextData[]> => {
  if (!uid) return [];
  const contextRef = collection(db, "users", uid, "orgContexts");
  const q = query(contextRef, orderBy("updatedAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrgContextData));
};

// --- Homepage Assets Helpers ---

// Added missing helper to list assets from storage
export const listHomepageAssets = async () => {
  const assetsRef = ref(storage, 'homepage_assets');
  const res = await listAll(assetsRef);
  return Promise.all(res.items.map(async (item) => ({
    name: item.name,
    url: await getDownloadURL(item)
  })));
};

// Added missing helper to upload asset to storage
export const uploadHomepageAsset = async (file: File) => {
  const assetRef = ref(storage, `homepage_assets/${file.name}`);
  await uploadBytes(assetRef, file);
  return await getDownloadURL(assetRef);
};

// Added missing helper to delete asset from storage
export const deleteHomepageAsset = async (fileName: string) => {
  const assetRef = ref(storage, `homepage_assets/${fileName}`);
  await deleteObject(assetRef);
};

// --- Consultant Helpers ---

// Added missing helper to fetch consultants
export const getConsultants = async () => {
  const consultantsRef = collection(db, "consultants");
  const snapshot = await getDocs(consultantsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Added missing helper to save/update consultant
export const saveConsultant = async (consultant: any) => {
  if (consultant.id) {
    const docRef = doc(db, "consultants", consultant.id);
    const { id, ...data } = consultant;
    await setDoc(docRef, data, { merge: true });
    return id;
  }
  const consultantsRef = collection(db, "consultants");
  const res = await addDoc(consultantsRef, consultant);
  return res.id;
};

// Added missing helper to delete consultant
export const deleteConsultant = async (name: string, id: string) => {
  if (!id) return;
  await deleteDoc(doc(db, "consultants", id));
};

// Added missing helper to upload consultant image
export const uploadConsultantImage = async (file: File, name: string) => {
  const sanitizedName = name.replace(/\s+/g, '_').toLowerCase();
  const imageRef = ref(storage, `consultants/${sanitizedName}/profile_image`);
  await uploadBytes(imageRef, file);
  return await getDownloadURL(imageRef);
};

// Added missing helper to upload consultant CV
export const uploadConsultantCV = async (file: File, name: string) => {
  const sanitizedName = name.replace(/\s+/g, '_').toLowerCase();
  const cvRef = ref(storage, `consultants/${sanitizedName}/cv_${file.name}`);
  await uploadBytes(cvRef, file);
  return await getDownloadURL(cvRef);
};

// --- Publication PDF Helpers ---

// Added missing helper to upload publication PDF
export const uploadPublicationPDF = async (file: File, articleId: string) => {
  const pdfRef = ref(storage, `publications/${articleId}_${file.name}`);
  await uploadBytes(pdfRef, file);
  const url = await getDownloadURL(pdfRef);
  
  // Save mapping in Firestore
  const mappingRef = collection(db, "publication_mappings");
  await addDoc(mappingRef, {
    articleId,
    pdfUrl: url,
    fileName: file.name,
    createdAt: new Date().toISOString()
  });
  
  return url;
};

// Added missing helper to delete publication PDF
export const deletePublicationPDF = async (articleId: string) => {
  const q = query(collection(db, "publication_mappings"), where("articleId", "==", articleId));
  const snapshot = await getDocs(q);
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    // Delete from storage
    const pdfRef = ref(storage, `publications/${articleId}_${data.fileName}`);
    try {
      await deleteObject(pdfRef);
    } catch (e) {
      console.warn("Could not delete PDF from storage", e);
    }
    // Delete from Firestore
    await deleteDoc(docSnap.ref);
  }
};

// --- User Profile Helpers ---

// Added missing helper for user profile images
export const uploadUserProfileImage = async (uid: string, file: File) => {
  const imageRef = ref(storage, `user_profiles/${uid}/profile_image`);
  await uploadBytes(imageRef, file);
  return await getDownloadURL(imageRef);
};

// Added missing helper for deleting user profile images
export const deleteUserProfileImage = async (uid: string) => {
  const imageRef = ref(storage, `user_profiles/${uid}/profile_image`);
  try {
    await deleteObject(imageRef);
  } catch (e) {
    console.warn("Could not delete profile image (might not exist)", e);
  }
};