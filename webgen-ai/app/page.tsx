"use client";
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

// --- ICONES ---
const IconSparkles = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09-3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>);
const IconLoader = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 animate-spin"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>);
const IconCheck = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-green-400"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>);
const IconRocket = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>);
const IconStar = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>);
const IconEdit = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>);

export default function Home() {
  const [step, setStep] = useState(0); 
  const [formData, setFormData] = useState({
    name: '', type: 'Business', style: 'Moderne', color: 'Bleu', description: '', domainSlug: ''
  });

  const [loading, setLoading] = useState(false);
  const [siteCode, setSiteCode] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ h: 14, m: 20, s: 15 });
  const router = useRouter();

  // Outils d'édition rapide (Dashboard)
  const [editMode, setEditMode] = useState<'none' | 'style' | 'content'>('none');

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

  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const genererSite = async (updates: any = null) => {
    // Sécurité anti-crash : Si 'updates' est un événement JS (clic), on le remet à null
    if (updates && typeof updates === 'object' && updates.nativeEvent) {
      updates = null;
    }

    setLoading(true);
    if (step < 4) setStep(3);
    
    // Si c'est une modification via le dashboard, on passe juste les updates
    // Le backend utilisera les updates pour modifier le template existant ou regénérer
    const fullPrompt = `Créer un site web de type "${formData.type}" nommé "${formData.name}".`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            prompt: fullPrompt, 
            updates: updates || { title: formData.name, color: formData.color, style: formData.style } 
        }),
      });

      if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) throw new Error("Réponse invalide du serveur");

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSiteCode(data.code);
      if (step < 4) setStep(4);
    } catch (error: any) {
      console.error(error);
      alert(`Erreur détaillée: ${error.message}`);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const lancerPaiement = async (planName: string, price: number) => {
    setProcessingPayment(true);
    setTimeout(async () => {
      try {
        const docRef = await addDoc(collection(db, "sites"), {
          ...formData, code: siteCode, createdAt: new Date(), plan: planName, price: price, domain: `${formData.domainSlug}.webgen-ai.com`
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
        alert("Erreur: " + e.message);
        setProcessingPayment(false);
      }
    }, 1500);
  };

  // --- RENDU DES ÉTAPES ---

  const renderLanding = () => (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-700">
        <div className="w-full bg-purple-600/20 border-b border-purple-500/30 py-2 text-center text-sm font-medium text-purple-200">
             🔥 Offre spéciale : Obtenez 3 mois gratuits avec le plan Business annuel !
        </div>
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1F2E] border border-gray-700 text-sm font-semibold text-gray-300">
                    <span className="flex h-2 w-2 rounded-full bg-green-400"></span> Recommandé par les pros
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
                    Créez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">site parfait</span> en 30 secondes.
                </h1>
                <p className="text-xl text-gray-400 leading-relaxed max-w-xl">Boutique, Portfolio, Restaurant... L'IA génère un site unique adapté à votre activité.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setStep(1)} className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-purple-900/50 transition-all transform hover:scale-105">Commencer maintenant</button>
                </div>
            </div>
            <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-[2rem] blur-2xl opacity-40 animate-pulse"></div>
                <div className="relative bg-[#131722] border border-gray-700 rounded-[2rem] p-8 shadow-2xl">
                    <h3 className="text-lg font-bold text-gray-400 mb-2">Offre temps limité</h3>
                    <div className="text-5xl font-black text-white mb-1">2.99€ <span className="text-lg text-gray-500 font-medium">/mois</span></div>
                    <p className="text-gray-500 text-sm mb-8">+ 3 mois gratuits</p>
                    <button onClick={() => setStep(1)} className="w-full py-4 border-2 border-purple-500 text-purple-400 font-bold rounded-xl hover:bg-purple-500 hover:text-white transition">Créer mon site</button>
                </div>
            </div>
        </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 py-10">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-2">Quel type de site ?</h2>
        <p className="text-gray-400">Cela déterminera la structure et les fonctionnalités.</p>
      </div>
      <div className="space-y-6 bg-[#131722] p-8 rounded-2xl border border-gray-700 shadow-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Nom du projet</label>
          <input type="text" value={formData.name} onChange={(e) => updateForm('name', e.target.value)} className="w-full bg-[#0B0F19] border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition" placeholder="Ex: Pizzeria Luigi..." />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-400 mb-2">Type de site (Détermine le design)</label>
           <div className="grid grid-cols-2 gap-3">
             {['Boutique en ligne', 'Restaurant / Food', 'Portfolio Créatif', 'Business / Corporate'].map((t) => (
               <button key={t} onClick={() => updateForm('type', t)} className={`py-4 px-4 rounded-xl text-sm font-bold border transition-all ${formData.type === t ? 'bg-purple-600 border-purple-500 text-white' : 'bg-[#0B0F19] border-gray-600 text-gray-400 hover:border-white'}`}>{t}</button>
             ))}
           </div>
        </div>
        <button onClick={() => setStep(2)} disabled={!formData.name} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition disabled:opacity-50 mt-4">Continuer</button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 py-10">
      <button onClick={() => setStep(1)} className="text-gray-500 hover:text-white mb-6 text-sm">← Retour</button>
      <div className="text-center mb-8"><h2 className="text-4xl font-bold text-white mb-2">Détails & Style</h2></div>
      <div className="space-y-6 bg-[#131722] p-8 rounded-2xl border border-gray-700 shadow-2xl">
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Couleur Dominante</label>
                <div className="flex gap-3 flex-wrap">
                    {['Bleu', 'Rouge', 'Vert', 'Violet', 'Orange', 'Rose', 'Noir'].map(c => (
                        <button key={c} onClick={() => updateForm('color', c)} className={`w-8 h-8 rounded-full border-2 transition ${formData.color === c ? 'border-white scale-110' : 'border-transparent hover:scale-110'}`} style={{ backgroundColor: c === 'Noir' ? '#333' : c === 'Rouge' ? '#EF4444' : c === 'Bleu' ? '#3B82F6' : c === 'Vert' ? '#10B981' : c === 'Violet' ? '#8B5CF6' : c === 'Orange' ? '#F97316' : '#EC4899' }} title={c} />
                    ))}
                </div>
            </div>
        </div>
        <button onClick={() => genererSite()} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2"><IconRocket /> Générer le site avec l'IA</button>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="text-center animate-in fade-in duration-700 py-20">
        <div className="inline-block p-4 rounded-full bg-[#131722] border border-gray-700 mb-6 relative"><div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse"></div><IconLoader /></div>
        <h2 className="text-3xl font-bold text-white mb-2">Construction de votre {formData.type}...</h2>
        <p className="text-gray-400">Application des modules spécifiques • Design {formData.color}</p>
    </div>
  );

  // ÉTAPE 4 : PREVIEW AVEC DASHBOARD D'ÉDITION
  const renderPreview = () => (
    <div className="w-full h-screen flex flex-col md:flex-row overflow-hidden bg-[#0B0F19]">
        
        {/* SIDEBAR DASHBOARD */}
        <aside className="w-full md:w-80 bg-[#131722] border-r border-gray-700 flex flex-col z-20 shadow-2xl">
            <div className="p-6 border-b border-gray-700">
                <h3 className="text-white font-bold text-lg flex items-center gap-2"><IconSparkles /> Éditeur IA</h3>
                <p className="text-xs text-gray-500 mt-1">Modifiez votre site en temps réel</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* Section Design */}
                <div>
                    <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">🎨 Design & Couleurs</h4>
                    <div className="grid grid-cols-4 gap-2">
                        {['Bleu', 'Rouge', 'Vert', 'Violet', 'Orange', 'Rose', 'Noir'].map(c => (
                            <button key={c} onClick={() => genererSite({ color: c })} className="h-8 rounded-md border border-gray-600 hover:scale-105 transition" style={{ backgroundColor: c === 'Noir' ? '#333' : c === 'Rouge' ? '#EF4444' : c === 'Bleu' ? '#3B82F6' : c === 'Vert' ? '#10B981' : c === 'Violet' ? '#8B5CF6' : c === 'Orange' ? '#F97316' : '#EC4899' }} />
                        ))}
                    </div>
                </div>

                {/* Section Contenu */}
                <div>
                    <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">📝 Contenu</h4>
                    <div className="space-y-2">
                        <button onClick={() => genererSite({ title: formData.name + " Pro" })} className="w-full text-left px-4 py-3 rounded-lg bg-[#0B0F19] hover:bg-gray-800 text-sm text-gray-300 border border-gray-700 transition flex items-center gap-2">
                            <IconEdit /> Changer le Titre
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-lg bg-[#0B0F19] hover:bg-gray-800 text-sm text-gray-300 border border-gray-700 transition flex items-center gap-2">
                            📷 Changer les photos (IA)
                        </button>
                    </div>
                </div>

                {/* Section Ajout */}
                <div>
                    <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">➕ Ajouter une section</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <button className="px-3 py-2 bg-[#0B0F19] border border-gray-700 rounded text-xs text-gray-400 hover:text-white hover:border-purple-500 transition">Témoignages</button>
                        <button className="px-3 py-2 bg-[#0B0F19] border border-gray-700 rounded text-xs text-gray-400 hover:text-white hover:border-purple-500 transition">FAQ</button>
                        <button className="px-3 py-2 bg-[#0B0F19] border border-gray-700 rounded text-xs text-gray-400 hover:text-white hover:border-purple-500 transition">Galerie</button>
                        <button className="px-3 py-2 bg-[#0B0F19] border border-gray-700 rounded text-xs text-gray-400 hover:text-white hover:border-purple-500 transition">Contact</button>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-gray-700 bg-[#0B0F19]">
                <button onClick={() => setShowPricing(true)} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transition">
                    Mettre en ligne <IconRocket />
                </button>
                <button onClick={() => setStep(2)} className="w-full mt-2 py-2 text-gray-500 text-sm hover:text-white">Recommencer</button>
            </div>
        </aside>

        {/* PREVIEW AREA */}
        <div className="flex-1 bg-gray-900 relative flex flex-col">
            <div className="bg-[#1A1F2E] border-b border-gray-700 px-4 py-2 flex items-center justify-center gap-4 text-xs text-gray-400">
                <span className="bg-black/30 px-2 py-1 rounded">Desktop</span>
                <span className="hover:text-white cursor-pointer">Mobile</span>
            </div>
            <div className="flex-1 relative overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-[#131722] p-6 rounded-xl border border-gray-700 shadow-2xl flex flex-col items-center">
                            <IconLoader />
                            <p className="mt-4 text-white font-medium">L'IA applique vos modifications...</p>
                        </div>
                    </div>
                )}
                <iframe srcDoc={siteCode || ""} className="w-full h-full bg-white" title="Preview" sandbox="allow-scripts" />
            </div>
        </div>

        {/* MODALE PRICING */}
        {showPricing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F19]/95 backdrop-blur-md overflow-y-auto">
                <div className="w-full max-w-6xl mx-auto my-10 animate-in slide-in-from-bottom-10 duration-500">
                    <div className="text-center mb-10">
                         <h2 className="text-4xl font-bold text-white mb-4">Choisissez votre plan</h2>
                         <div className="inline-flex bg-gray-800 p-1 rounded-full border border-gray-700">
                            <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 rounded-full text-sm font-medium transition ${billingCycle === 'monthly' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>Mensuel</button>
                            <button onClick={() => setBillingCycle('yearly')} className={`px-6 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>Annuel <span className="text-xs bg-white/20 px-1.5 rounded">-20%</span></button>
                         </div>
                    </div>
                    {/* DOMAINE */}
                    <div className="max-w-xl mx-auto mb-12 bg-[#131722] p-4 rounded-xl border border-gray-700 flex items-center gap-3">
                        <span className="text-gray-400 text-sm font-medium whitespace-nowrap">Votre adresse :</span>
                        <div className="flex-1 flex bg-[#0B0F19] border border-gray-600 rounded-lg px-3 py-2">
                            <input type="text" placeholder="mon-site" value={formData.domainSlug} onChange={(e) => updateForm('domainSlug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="bg-transparent text-white outline-none flex-1 font-mono text-sm" />
                            <span className="text-gray-500 font-mono text-sm">.webgen-ai.com</span>
                        </div>
                    </div>
                    {/* GRILLE PRIX */}
                    <div className="grid md:grid-cols-3 gap-6 items-start">
                        <div className="bg-[#131722] rounded-2xl p-8 border border-gray-700 hover:border-gray-500 transition">
                            <h3 className="text-xl font-bold text-white">Starter</h3>
                            <div className="my-6"><span className="text-4xl font-bold text-white">{billingCycle === 'yearly' ? '2.99€' : '4.99€'}</span><span className="text-gray-500">/mois</span></div>
                            <button onClick={() => lancerPaiement('Starter', 3588)} className="w-full py-3 border border-gray-600 rounded-xl text-white font-bold hover:bg-gray-800 transition mb-6">Sélectionner</button>
                        </div>
                        <div className="bg-[#131722] rounded-2xl p-8 border-2 border-purple-500 relative shadow-2xl shadow-purple-900/20 transform md:-translate-y-4">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">Populaire</div>
                            <h3 className="text-xl font-bold text-white">Business</h3>
                            <div className="my-6"><span className="text-4xl font-bold text-white">{billingCycle === 'yearly' ? '3.99€' : '6.99€'}</span><span className="text-gray-500">/mois</span></div>
                            <button onClick={() => lancerPaiement('Business', 4788)} className="w-full py-3 bg-purple-600 rounded-xl text-white font-bold hover:bg-purple-500 transition mb-6">{processingPayment ? <IconLoader /> : 'Sélectionner'}</button>
                            <ul className="space-y-3 text-sm text-gray-300">
                                <li className="flex gap-2"><IconCheck /> <strong>Nom de Domaine Offert</strong></li>
                                <li className="flex gap-2"><IconCheck /> IA Illimitée</li>
                            </ul>
                        </div>
                        <div className="bg-[#131722] rounded-2xl p-8 border border-gray-700 hover:border-gray-500 transition">
                            <h3 className="text-xl font-bold text-white">Cloud</h3>
                            <div className="my-6"><span className="text-4xl font-bold text-white">{billingCycle === 'yearly' ? '8.99€' : '14.99€'}</span><span className="text-gray-500">/mois</span></div>
                            <button onClick={() => lancerPaiement('Cloud', 10788)} className="w-full py-3 border border-gray-600 rounded-xl text-white font-bold hover:bg-gray-800 transition mb-6">Sélectionner</button>
                        </div>
                    </div>
                    <button onClick={() => setShowPricing(false)} className="mx-auto block mt-12 text-gray-500 hover:text-white underline">Retour</button>
                </div>
            </div>
        )}
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#0B0F19] font-sans text-gray-100 flex flex-col relative ${step === 4 ? 'overflow-hidden h-screen' : 'overflow-x-hidden'}`}>
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none opacity-50"></div>

      <header className="border-b border-gray-800 bg-[#0B0F19]/80 backdrop-blur-xl sticky top-0 z-20 px-6 py-4 flex-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-white cursor-pointer" onClick={() => setStep(0)}>WebGen<span className="text-purple-400">.AI</span></span>
          </div>
          {step > 0 && step < 4 && (
             <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <span className={step >= 1 ? "text-purple-400" : ""}>1. Info</span> &rarr;
                <span className={step >= 2 ? "text-purple-400" : ""}>2. Design</span> &rarr;
                <span className={step >= 3 ? "text-purple-400" : ""}>3. Génération</span>
             </div>
          )}
          
          {step === 0 && (
             <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-400">
                <a href="#" className="hover:text-white transition">Hébergement</a>
                <a href="#" className="hover:text-white transition">Créateur de site</a>
                <a href="#" className="hover:text-white transition">Pro</a>
                <button onClick={() => setStep(1)} className="text-white hover:text-purple-400 transition">Connexion</button>
             </div>
          )}
        </div>
      </header>

      <main className={`flex-1 flex flex-col items-center relative z-10 w-full ${step === 4 ? 'justify-center h-full p-6' : 'justify-start'}`}>
        {step === 0 && renderLanding()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderLoading()}
        {step === 4 && renderPreview()}
      </main>
    </div>
  );
}