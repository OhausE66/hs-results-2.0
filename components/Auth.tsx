
import React, { useState } from 'react';
import { 
  auth, 
  db,
  doc,
  setDoc,
  getDoc,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from '../services/firebase';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, ShieldCheck, CheckCircle2, KeyRound } from 'lucide-react';

interface AuthProps {
  onAuthSuccess?: () => void;
  inline?: boolean;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess, inline = false }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationEmailSent, setVerificationEmailSent] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    repeatPassword: ''
  });

  const syncUserToFirestore = async (user: any, nameOverride?: string) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: nameOverride || user.displayName || formData.name || 'User',
          email: user.email,
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Firestore sync error:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await syncUserToFirestore(result.user);
      if (onAuthSuccess) onAuthSuccess();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || "Fehler bei der Google-Anmeldung.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError("Bitte geben Sie Ihre E-Mail Adresse ein.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setResetEmailSent(formData.email);
    } catch (err: any) {
      setError(err.message || "Fehler beim Senden des Links.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        await syncUserToFirestore(user);

        if (!user.emailVerified) {
          await sendEmailVerification(user);
          await signOut(auth);
          setVerificationEmailSent(formData.email);
          setLoading(false);
          return;
        }
      } else {
        if (formData.password !== formData.repeatPassword) {
          throw new Error("Passwörter stimmen nicht überein.");
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        if (formData.name) {
          await updateProfile(user, { displayName: formData.name });
        }
        
        await syncUserToFirestore(user, formData.name);
        
        await sendEmailVerification(user);
        await signOut(auth);
        setVerificationEmailSent(formData.email);
        setLoading(false);
        return;
      }
      
      if (onAuthSuccess) onAuthSuccess();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("User existiert bereits. Einloggen?");
      } else if (err.code === 'auth/invalid-credential') {
        setError("E-Mail oder Passwort nicht korrekt.");
      } else {
        setError(err.message || "Ein Fehler ist aufgetreten.");
      }
    } finally {
      setLoading(false);
    }
  };

  const containerClasses = inline 
    ? "w-full max-w-md mx-auto bg-white rounded-[2rem] shadow-xl p-8 border border-slate-100 animate-fade-in"
    : "max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 animate-fade-in";

  const wrapperClasses = inline
    ? "py-8"
    : "min-h-[80vh] flex items-center justify-center bg-slate-50 px-4 pt-20";

  if (verificationEmailSent) {
    return (
      <div className={wrapperClasses}>
        <div className={containerClasses}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center bg-emerald-50 p-4 rounded-full mb-6 text-emerald-500">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-black text-hs-blue uppercase tracking-tight mb-4">
              E-Mail bestätigen
            </h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Wir haben eine Bestätigungs-E-Mail an <span className="font-bold text-hs-blue">{verificationEmailSent}</span> gesendet.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8 text-sm text-slate-500">
              Bitte klicken Sie auf den Link in der E-Mail, um Ihren Account zu aktivieren. Danach können Sie sich einloggen.
            </div>
            <button
              onClick={() => {
                setVerificationEmailSent(null);
                setIsLogin(true);
                setIsResetPassword(false);
              }}
              className="w-full bg-hs-blue text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all flex items-center justify-center shadow-lg group"
            >
              Zum Login
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (resetEmailSent) {
    return (
      <div className={wrapperClasses}>
        <div className={containerClasses}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center bg-hs-orange/10 p-4 rounded-full mb-6 text-hs-orange">
              <Mail size={48} />
            </div>
            <h2 className="text-2xl font-black text-hs-blue uppercase tracking-tight mb-4">
              Link gesendet
            </h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Wir haben einen Link zum Zurücksetzen des Passworts an <span className="font-bold text-hs-blue">{resetEmailSent}</span> gesendet.
            </p>
            <button
              onClick={() => {
                setResetEmailSent(null);
                setIsLogin(true);
                setIsResetPassword(false);
              }}
              className="w-full bg-hs-blue text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all flex items-center justify-center shadow-lg group"
            >
              Einloggen
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isResetPassword) {
    return (
      <div className={wrapperClasses}>
        <div className={containerClasses}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-hs-orange/5 p-3 rounded-2xl mb-4 text-hs-orange">
              <KeyRound size={32} />
            </div>
            <h2 className="text-2xl font-black text-hs-blue uppercase tracking-tight">
              Passwort vergessen?
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Geben Sie Ihre E-Mail ein, um einen Reset-Link zu erhalten.
            </p>
          </div>

          <form onSubmit={handleResetRequest} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="email"
                name="email"
                placeholder="E-Mail Adresse"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-hs-accent focus:border-transparent outline-none transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl animate-shake">
                <AlertCircle size={16} className="flex-shrink-0" />
                <p className="leading-tight">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-hs-blue text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all flex items-center justify-center shadow-lg hover:shadow-xl group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Link anfordern
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsResetPassword(false);
                setError(null);
              }}
              className="text-slate-400 hover:text-hs-blue text-sm font-medium transition-colors"
            >
              Zurück zum Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClasses}>
      <div className={containerClasses}>
        <div className="text-center mb-8">
          {!inline && (
            <div className="flex justify-center mb-6">
              <div className="border-2 border-hs-blue p-2 rounded-lg">
                <span className="text-hs-blue font-black text-3xl tracking-tighter">hs</span>
              </div>
              <span className="font-light text-3xl text-slate-500 tracking-tight self-center ml-2">results</span>
            </div>
          )}
          <div className="inline-flex items-center justify-center bg-hs-blue/5 p-3 rounded-2xl mb-4 text-hs-blue">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-hs-blue uppercase tracking-tight">
            {isLogin ? 'Ergebnis freischalten' : 'Account erstellen'}
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            {isLogin 
              ? 'Bitte melden Sie sich an, um Ihre KI-Analyse anzuzeigen.' 
              : 'Registrieren Sie sich kostenlos, um Ihre Ergebnisse zu speichern.'}
          </p>
        </div>

        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border border-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Mit Google anmelden</span>
              </>
            )}
          </button>
        </div>

        <div className="relative flex items-center mb-6">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-slate-300 uppercase tracking-widest">oder E-Mail</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-hs-accent focus:border-transparent outline-none transition-all"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="email"
              name="email"
              placeholder="E-Mail Adresse"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-hs-accent focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="password"
              name="password"
              placeholder="Passwort"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-hs-accent focus:border-transparent outline-none transition-all"
            />
          </div>

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setIsResetPassword(true);
                  setError(null);
                }}
                className="text-xs font-semibold text-hs-accent hover:text-hs-orange transition-colors"
              >
                Passwort vergessen?
              </button>
            </div>
          )}

          {!isLogin && (
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="password"
                name="repeatPassword"
                placeholder="Passwort wiederholen"
                value={formData.repeatPassword}
                onChange={handleChange}
                required={!isLogin}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-hs-accent focus:border-transparent outline-none transition-all"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl animate-shake">
              <AlertCircle size={16} className="flex-shrink-0" />
              <p className="leading-tight">
                {error === "User existiert bereits. Einloggen?" ? (
                  <>
                    Account existiert bereits. <button type="button" onClick={() => setIsLogin(true)} className="font-bold underline">Einloggen?</button>
                  </>
                ) : error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-hs-blue text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all flex items-center justify-center shadow-lg hover:shadow-xl group disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isLogin ? 'Einloggen' : 'Registrieren'}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-slate-400 hover:text-hs-blue text-sm font-medium transition-colors"
          >
            {isLogin ? 'Noch keinen Account? Registrieren' : 'Bereits einen Account? Einloggen'}
          </button>
        </div>
      </div>
    </div>
  );
};
