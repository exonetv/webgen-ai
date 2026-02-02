"use client";
import { useState, useEffect, useRef } from 'react';
import { db, auth, googleProvider } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

// --- ICONES ---
const IconSparkles = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09-3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>);
const IconLoader = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 animate-spin"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>);
const IconCheck = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-green-400"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>);
const IconRocket = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>);
const IconStar = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>);
const IconEdit = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>);
const IconSend = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>);
const IconGoogle = () => (<svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>);

export default function Home() {
  const [step, setStep] = useState(0); 
  // 0: Landing, 1: Chat Wizard, 2: Loading, 3: Editor
  
  // États Utilisateur & Auth
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Données App
  const [formData, setFormData] = useState({ name: '', type: '', style: '', color: 'Bleu', domainSlug: '' });
  const [chatHistory, setChatHistory] = useState<{role: 'ai'|'user', text: string}[]>([
    { role: 'ai', text: "Bonjour ! Je suis votre Assistant Web IA. Que souhaitez-vous créer aujourd'hui ? (Ex: Une boutique de fleurs, un portfolio...)" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatQuestionStep, setChatQuestionStep] = useState(0); 

  // Technique
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');
  const [siteCode, setSiteCode] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'style' | 'pages'>('add');
  const [timeLeft, setTimeLeft] = useState({ h: 14, m: 20, s: 15 });
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Surveillance de l'état de connexion
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  useEffect(() => {
    const timer = setInterval(() => {
        setTimeLeft(prev => {
            if (prev.s > 0) return { ...prev, s: prev.s - 1 };
            if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
            if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
            return prev;
        });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- GESTION AUTH ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
        if (authMode === 'signup') {
            await createUserWithEmailAndPassword(auth, email, password);
        } else {
            await signInWithEmailAndPassword(auth, email, password);
        }
        setShowAuthModal(false); 
        setStep(1); 
    } catch (err: any) {
        let msg = "Une erreur est survenue.";
        if (err.code === 'auth/email-already-in-use') msg = "Cet email est déjà utilisé.";
        if (err.code === 'auth/invalid-email') msg = "Email invalide.";
        if (err.code === 'auth/weak-password') msg = "Le mot de passe doit faire 6 caractères min.";
        if (err.code === 'auth/wrong-password') msg = "Mot de passe incorrect.";
        if (err.code === 'auth/user-not-found') msg = "Aucun compte avec cet email.";
        setAuthError(msg);
    } finally {
        setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError('');
    try {
        await signInWithPopup(auth, googleProvider);
        setShowAuthModal(false);
        setStep(1);
    } catch (err: any) {
        console.error(err);
        setAuthError("Erreur lors de la connexion Google.");
    }
  };

  const handleStartCreation = () => {
      if (user) {
          setStep(1);
      } else {
          setAuthMode('signup');
          setShowAuthModal(true);
      }
  };

  const handleLogout = async () => {
      await signOut(auth);
      setStep(0);
  };

  // --- LOGIQUE CHAT WIZARD ---
  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");

    setTimeout(() => {
        let aiMsg = "";
        let nextStep = chatQuestionStep + 1;

        if (chatQuestionStep === 0) {
            setFormData(prev => ({ ...prev, type: userMsg }));
            aiMsg = `C'est noté ! Quel nom voulez-vous donner à votre ${userMsg} ?`;
        } else if (chatQuestionStep === 1) {
            setFormData(prev => ({ ...prev, name: userMsg }));
            aiMsg = `Excellent choix "${userMsg}". Quel style préférez-vous ? (Moderne, Minimaliste, Coloré, Luxe...)`;
        } else if (chatQuestionStep === 2) {
            setFormData(prev => ({ ...prev, style: userMsg }));
            aiMsg = `Parfait. Je vais générer un site ${formData.type} nommé "${formData.name}" avec un style ${userMsg}. C'est parti ?`;
        } else {
            genererSite(null, 'Création initiale');
            return;
        }

        setChatQuestionStep(nextStep);
        setChatHistory(prev => [...prev, { role: 'ai', text: aiMsg }]);
    }, 800);
  };

  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const genererSite = async (updates: any = null, actionName: string = 'Création') => {
    if (updates && typeof updates === 'object' && updates.nativeEvent) updates = null;

    setLoading(true);
    setLoadingAction(actionName);
    
    if (step < 3) setStep(2); 

    const fullPrompt = `Site type: ${formData.type}. Nom: ${formData.name}. Style: ${formData.style}.`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            prompt: fullPrompt, 
            conversation: chatHistory, 
            updates: updates || { color: formData.color }
        }),
      });

      if (!response.ok) throw new Error(`Erreur serveur`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setSiteCode(data.code);
      setStep(3); // Go Editor
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
      setStep(1); 
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  const lancerPaiement = async (plan: string, price: number) => {
    if (!user) return alert("Veuillez vous connecter pour sauvegarder votre site.");
    
    setProcessingPayment(true);
    setTimeout(async () => {
        try {
            const docRef = await addDoc(collection(db, "sites"), {
                ...formData, 
                code: siteCode, 
                createdAt: new Date(), 
                plan, 
                price, 
                domain: `${formData.domainSlug}.webgen-ai.com`,
                userId: user.uid 
            });
            
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ siteId: docRef.id }),
            });
            
            const data = await response.json();
            if (data.url) window.location.href = data.url;
            else router.push(`/site/${docRef.id}?success=true`);
            
        } catch (e: any) {
            alert("Erreur paiement: " + e.message);
            setProcessingPayment(false);
        }
    }, 1500);
  };

  // --- VUES ---

  const renderAuthModal = () => (
      <div className="fixed inset-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-[#131722] border border-gray-700 rounded-2xl p-8 shadow-2xl relative">
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
              
              <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">{authMode === 'signup' ? 'Créer un compte' : 'Bon retour !'}</h2>
                  <p className="text-gray-400 text-sm">{authMode === 'signup' ? 'Commencez à créer votre site gratuitement.' : 'Connectez-vous pour continuer.'}</p>
              </div>

              <div className="space-y-4">
                  <button onClick={handleGoogleAuth} className="w-full bg-white text-black font-bold py-3 rounded-xl transition flex justify-center items-center gap-3 hover:bg-gray-200">
                      <IconGoogle /> Continuer avec Google
                  </button>

                  <div className="flex items-center gap-4 text-gray-500 text-xs my-4">
                      <div className="h-px bg-gray-700 flex-1"></div>
                      OU
                      <div className="h-px bg-gray-700 flex-1"></div>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                      <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0B0F19] border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition" placeholder="votre@email.com" />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Mot de passe</label>
                          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0B0F19] border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition" placeholder="••••••••" />
                      </div>
                      {authError && <div className="text-red-400 text-xs bg-red-400/10 p-2 rounded">{authError}</div>}
                      <button type="submit" disabled={authLoading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition flex justify-center items-center gap-2">
                          {authLoading ? <IconLoader /> : (authMode === 'signup' ? "S'inscrire avec Email" : "Se connecter")}
                      </button>
                  </form>
              </div>

              <div className="mt-6 text-center text-sm text-gray-400">
                  {authMode === 'signup' ? (
                      <>Déjà un compte ? <button onClick={() => setAuthMode('login')} className="text-purple-400 hover:text-purple-300 font-medium">Se connecter</button></>
                  ) : (
                      <>Pas de compte ? <button onClick={() => setAuthMode('signup')} className="text-purple-400 hover:text-purple-300 font-medium">Créer un compte</button></>
                  )}
              </div>
          </div>
      </div>
  );

  const renderLanding = () => (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-700 pt-20 px-6 text-center">
        <div className="w-full bg-purple-600/20 border-b border-purple-500/30 py-2 text-center text-sm font-medium text-purple-200 absolute top-0 left-0">
             🔥 Offre spéciale : Obtenez 3 mois gratuits avec le plan Business annuel !
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight mt-12">
            Votre site web créé par <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">l'IA</span>.
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl">Répondez à quelques questions simples et laissez notre intelligence artificielle concevoir, rédiger et coder votre site en 30 secondes.</p>
        <button onClick={handleStartCreation} className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition shadow-2xl">Commencer la création</button>
        
        {/* Mockup Preview */}
        <div className="mt-16 relative w-full max-w-5xl mx-auto hidden md:block">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-30"></div>
            <div className="relative bg-[#131722] rounded-xl border border-gray-700 p-2 shadow-2xl">
                <div className="flex gap-2 mb-2 px-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-[#0B0F19] rounded-lg h-96 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                        <IconSparkles />
                        <p className="mt-2 text-sm">Interface de l'éditeur</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderChatWizard = () => (
    <div className="w-full max-w-2xl mx-auto h-[80vh] flex flex-col pt-10">
        <div className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-hide pb-4">
            {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2 fade-in duration-500`}>
                    <div className={`max-w-[80%] p-5 rounded-2xl text-lg ${msg.role === 'ai' ? 'bg-[#1A1F2E] text-white rounded-tl-none border border-gray-700' : 'bg-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-900/20'}`}>
                        {msg.role === 'ai' && <div className="flex items-center gap-2 mb-2 text-purple-400 text-xs font-bold uppercase tracking-wider"><IconSparkles /> Assistant IA</div>}
                        {msg.text}
                    </div>
                </div>
            ))}
            <div ref={chatEndRef} />
        </div>
        <div className="p-4 bg-[#0B0F19] border-t border-gray-800">
            <div className="flex items-center bg-[#131722] border border-gray-700 rounded-full p-2 px-4 shadow-xl focus-within:border-purple-500 transition-colors">
                <input 
                    autoFocus
                    type="text" 
                    className="flex-1 bg-transparent text-white outline-none placeholder-gray-500 py-2"
                    placeholder="Écrivez votre réponse..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                />
                <button onClick={handleChatSubmit} disabled={!chatInput.trim()} className="p-3 bg-purple-600 rounded-full text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition">
                    <IconSend />
                </button>
            </div>
        </div>
    </div>
  );

  const renderLoading = () => (
    <div className="text-center animate-in fade-in duration-700 py-20">
        <div className="inline-block p-6 rounded-full bg-[#131722] border border-gray-700 mb-8 relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse"></div>
            <IconLoader />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">{loadingAction || "L'IA réfléchit"}...</h2>
        <p className="text-gray-400 text-lg">Génération de la structure HTML • Application du style {formData.style}</p>
    </div>
  );

  const renderEditor = () => (
    <div className="w-full h-screen flex flex-col md:flex-row bg-[#0B0F19] overflow-hidden">
        {/* SIDEBAR WIX STYLE */}
        <aside className="w-20 md:w-80 bg-[#131722] border-r border-gray-700 flex flex-col z-20 flex-none shadow-2xl">
            <div className="p-6 border-b border-gray-700 hidden md:block">
                <h3 className="text-white font-bold flex items-center gap-2"><IconSparkles /> Éditeur Pro</h3>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
                {/* Icons Menu */}
                <div className="w-20 bg-[#0F1218] flex flex-col items-center py-6 gap-6 border-r border-gray-800">
                    <button onClick={() => setActiveTab('add')} className={`p-3 rounded-xl transition ${activeTab === 'add' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}><IconRocket /></button>
                    <button onClick={() => setActiveTab('style')} className={`p-3 rounded-xl transition ${activeTab === 'style' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}><IconEdit /></button>
                </div>

                {/* Sub Menu */}
                <div className="flex-1 bg-[#131722] p-5 overflow-y-auto hidden md:block space-y-6">
                    {activeTab === 'add' && (
                        <>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Ajouter Section</h4>
                            {[
                                { l: 'Témoignages', a: 'Ajoute section témoignages' },
                                { l: 'Galerie', a: 'Ajoute galerie photos' },
                                { l: 'FAQ', a: 'Ajoute section FAQ' },
                                { l: 'Tarifs', a: 'Ajoute grille tarifs' },
                                { l: 'Contact', a: 'Ajoute formulaire contact' }
                            ].map(item => (
                                <button key={item.l} onClick={() => genererSite({ style: item.a }, `Ajout ${item.l}`)} className="w-full text-left p-3 rounded-lg bg-[#1A1F2E] border border-gray-700 hover:border-purple-500 text-gray-300 text-sm mb-2 transition">
                                    + {item.l}
                                </button>
                            ))}
                        </>
                    )}
                    {activeTab === 'style' && (
                        <>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Style & Couleurs</h4>
                            <div className="grid grid-cols-4 gap-2 mb-6">
                                {['Bleu', 'Rouge', 'Vert', 'Violet', 'Orange', 'Rose', 'Noir'].map(c => (
                                    <button key={c} onClick={() => genererSite({ color: c }, `Thème ${c}`)} className="h-8 rounded border border-gray-600 hover:scale-110 transition" style={{ backgroundColor: c === 'Noir' ? '#333' : c === 'Rouge' ? '#EF4444' : c === 'Bleu' ? '#3B82F6' : c === 'Vert' ? '#10B981' : c === 'Violet' ? '#8B5CF6' : c === 'Orange' ? '#F97316' : '#EC4899' }} />
                                ))}
                            </div>
                            <button onClick={() => genererSite({ title: formData.name + " v2" }, 'Nouveaux Textes')} className="w-full p-3 bg-[#1A1F2E] border border-gray-700 rounded text-sm text-gray-300 hover:text-white mb-2">Récrire Textes (IA)</button>
                            <button onClick={() => genererSite({ style: "Remplace toutes les images" }, 'Nouvelles Images')} className="w-full p-3 bg-[#1A1F2E] border border-gray-700 rounded text-sm text-gray-300 hover:text-white">Changer Images (IA)</button>
                        </>
                    )}
                </div>
            </div>
            
            <div className="p-4 border-t border-gray-700 bg-[#131722] hidden md:block">
                <button onClick={() => setShowPricing(true)} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">Publier <IconRocket /></button>
            </div>
        </aside>

        {/* PREVIEW */}
        <div className="flex-1 bg-gray-900 relative flex flex-col">
            <div className="bg-[#1A1F2E] border-b border-gray-700 px-6 py-3 flex justify-between items-center">
                <span className="text-gray-400 text-sm">Mode Aperçu</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-black/40 text-white rounded text-xs">Desktop</button>
                    <button className="px-3 py-1 text-gray-400 hover:text-white rounded text-xs">Mobile</button>
                </div>
                <button onClick={() => setShowPricing(true)} className="md:hidden bg-purple-600 text-white px-4 py-1 rounded text-sm font-bold">Publier</button>
            </div>
            
            <div className="flex-1 relative overflow-hidden bg-gray-800/50 p-4 md:p-8 flex items-center justify-center">
                {loading && (
                    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                        <IconLoader />
                        <p className="mt-4 text-white font-medium">{loadingAction}...</p>
                    </div>
                )}
                <div className="w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden ring-1 ring-white/10">
                    <iframe srcDoc={siteCode || ""} className="w-full h-full" title="Preview" sandbox="allow-scripts" />
                </div>
            </div>
        </div>

        {/* PRICING MODAL (Hostinger Style) */}
        {showPricing && (
            <div className="fixed inset-0 z-50 bg-[#0B0F19]/95 backdrop-blur-md flex items-center justify-center p-4">
                <div className="w-full max-w-5xl bg-[#131722] border border-gray-700 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                    <div className="p-8 md:w-1/3 bg-[#0F1218] border-r border-gray-700">
                        <h2 className="text-2xl font-bold text-white mb-2">Finaliser</h2>
                        <p className="text-gray-400 text-sm mb-6">Choisissez votre plan pour mettre {formData.name} en ligne.</p>
                        <div className="space-y-4 text-sm text-gray-300">
                            <div className="flex gap-3 items-center"><IconCheck /> Domaine personnalisé</div>
                            <div className="flex gap-3 items-center"><IconCheck /> Hébergement SSL</div>
                            <div className="flex gap-3 items-center"><IconCheck /> Bande passante illimitée</div>
                        </div>
                    </div>
                    <div className="p-8 md:w-2/3">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border border-purple-500 bg-purple-500/5 rounded-xl p-6 relative">
                                <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-3 py-1 rounded-bl-xl font-bold">POPULAIRE</div>
                                <h3 className="font-bold text-white text-lg">Business</h3>
                                <div className="my-4"><span className="text-4xl font-bold text-white">4.99€</span>/mois</div>
                                <button onClick={() => lancerPaiement('Business', 499)} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition">Choisir</button>
                            </div>
                            <div className="border border-gray-700 rounded-xl p-6">
                                <h3 className="font-bold text-white text-lg">Starter</h3>
                                <div className="my-4"><span className="text-4xl font-bold text-white">2.99€</span>/mois</div>
                                <button onClick={() => lancerPaiement('Starter', 299)} className="w-full py-3 border border-gray-600 hover:bg-gray-800 text-white rounded-lg font-bold transition">Choisir</button>
                            </div>
                        </div>
                        <div className="mt-6 border-t border-gray-700 pt-6">
                            <label className="block text-sm text-gray-400 mb-2">Votre adresse web</label>
                            <div className="flex bg-[#0B0F19] border border-gray-600 rounded-lg px-3 py-2">
                                <input type="text" placeholder="mon-site" value={formData.domainSlug} onChange={(e) => updateForm('domainSlug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="bg-transparent text-white outline-none flex-1 font-mono text-sm" />
                                <span className="text-gray-500 font-mono text-sm">.webgen-ai.com</span>
                            </div>
                        </div>
                        <button onClick={() => setShowPricing(false)} className="mt-8 text-center w-full text-gray-500 hover:text-white text-sm">Retourner à l'éditeur</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#0B0F19] font-sans text-gray-100 flex flex-col ${step === 3 ? 'h-screen overflow-hidden' : ''}`}>
        {step < 3 && (
            <header className="px-6 py-6 flex justify-between items-center fixed top-0 w-full z-50 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-gray-800">
                <div className="text-xl font-bold tracking-tight text-white cursor-pointer" onClick={() => setStep(0)}>WebGen<span className="text-purple-400">.AI</span></div>
                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400 hidden sm:inline">{user.email}</span>
                        <button onClick={handleLogout} className="text-sm font-medium hover:text-red-400 transition">Déconnexion</button>
                    </div>
                ) : (
                    step === 0 && <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="text-sm font-medium hover:text-purple-400 transition">Connexion</button>
                )}
            </header>
        )}
        
        {showAuthModal && renderAuthModal()}

        <main className="flex-1 flex flex-col items-center justify-center w-full mt-20">
            {step === 0 && renderLanding()}
            {step === 1 && renderChatWizard()}
            {step === 2 && renderLoading()}
            {step === 3 && renderEditor()}
        </main>
    </div>
  );
}