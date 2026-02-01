"use client";
import { useState } from 'react';
import { db } from '../firebase'; // Le chemin est correct ici (../ remonte à src/)
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

// --- ICONES ---
const IconSparkles = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09-3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>);
const IconLoader = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 animate-spin"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>);
const IconArrowRight = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>);
const IconCheck = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-green-400"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>);
const IconLock = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" /></svg>);

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [siteCode, setSiteCode] = useState<string | null>(null);
  
  // États pour la personnalisation
  const [customTitle, setCustomTitle] = useState('');

  // États pour le Paiement
  const [showPricing, setShowPricing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const router = useRouter();

  // Fonction pour générer ou mettre à jour le site
  const genererSite = async (updates: any = null) => {
    if (!prompt) return;
    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, updates }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSiteCode(data.code);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishClick = () => {
    if (isPaid) {
      // Si déjà payé, on publie directement
      finaliserPublication();
    } else {
      // Sinon, on affiche le tableau des prix
      setShowPricing(true);
    }
  };

  const simulerPaiementStripe = () => {
    setProcessingPayment(true);
    // On simule un délai réseau de 2 secondes comme si on parlait à la banque
    setTimeout(() => {
      setProcessingPayment(false);
      setIsPaid(true); // C'est payé !
      setShowPricing(false); // On ferme la modale
      finaliserPublication(); // On lance la publication automatiquement
    }, 2000);
  };

  const finaliserPublication = async () => {
    if (!siteCode) return;
    setPublishing(true);
    try {
      const docRef = await addDoc(collection(db, "sites"), {
        prompt, 
        code: siteCode, 
        createdAt: new Date(), 
        views: 0
      });
      router.push(`/site/${docRef.id}`);
    } catch (e: any) {
      alert("Erreur publication: " + e.message);
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] font-sans text-gray-100 flex flex-col relative overflow-hidden">
      
      {/* MODALE DE PAIEMENT (Overlay) */}
      {showPricing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131722] border border-gray-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Colonne Gauche: Résumé */}
            <div className="p-8 md:w-1/2 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-r border-gray-700 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4">Votre site est prêt ! 🚀</h2>
              <p className="text-gray-300 mb-8">
                Vous avez généré un site magnifique pour <span className="text-white font-bold">"{prompt}"</span>. 
                Passez à la vitesse supérieure pour le mettre en ligne.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-1 rounded-full"><IconCheck /></div>
                  <span>Hébergement Cloud inclus</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-1 rounded-full"><IconCheck /></div>
                  <span>Nom de domaine personnalisé</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-1 rounded-full"><IconCheck /></div>
                  <span>Suppression du logo WebGen</span>
                </div>
              </div>
            </div>

            {/* Colonne Droite: Prix */}
            <div className="p-8 md:w-1/2 flex flex-col justify-center bg-[#0B0F19]">
              <div className="text-center mb-8">
                <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Offre de lancement</span>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-white">19€</span>
                  <span className="text-gray-500">/site</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Paiement unique. Pas d'abonnement caché.</p>
              </div>

              <button 
                onClick={simulerPaiementStripe}
                disabled={processingPayment}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {processingPayment ? (
                  <>Processing <IconLoader /></>
                ) : (
                  <>Payer & Publier <IconLock /></>
                )}
              </button>
              
              <button 
                onClick={() => setShowPricing(false)}
                className="mt-4 text-gray-500 hover:text-white text-sm"
              >
                Annuler et continuer à éditer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- RESTE DU SITE --- */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none opacity-50"></div>

      <header className="border-b border-gray-800 bg-[#0B0F19]/80 backdrop-blur-xl sticky top-0 z-20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-white">WebGen<span className="text-purple-400">.AI</span></span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center justify-center relative z-10">
        {siteCode ? (
          <div className="w-full max-w-7xl h-[85vh] flex flex-col animate-in fade-in zoom-in duration-500">
            
            {/* Barre d'outils de modification */}
            <div className="bg-[#131722] border border-gray-700 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-2">
                    <button onClick={() => setSiteCode(null)} className="text-gray-400 hover:text-white px-3 py-1.5 text-sm rounded-lg hover:bg-white/5 transition">
                        ← Retour
                    </button>
                    <div className="h-6 w-px bg-gray-700 mx-2"></div>
                    
                    {/* Boutons Couleurs */}
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 mr-2 uppercase font-bold tracking-wider">Thème</span>
                        {['Rouge', 'Bleu', 'Vert', 'Violet', 'Orange'].map(c => (
                            <button 
                                key={c}
                                onClick={() => genererSite({ color: c })}
                                className="w-6 h-6 rounded-full border border-gray-600 hover:scale-110 transition shadow-sm"
                                style={{ backgroundColor: c === 'Rouge' ? '#EF4444' : c === 'Bleu' ? '#3B82F6' : c === 'Vert' ? '#10B981' : c === 'Violet' ? '#8B5CF6' : '#F97316' }}
                                title={`Appliquer le thème ${c}`}
                            />
                        ))}
                    </div>

                    <div className="h-6 w-px bg-gray-700 mx-2"></div>

                    {/* Input Titre */}
                    <div className="flex items-center gap-2">
                         <input 
                            type="text" 
                            placeholder="Nouveau titre..." 
                            className="bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:border-purple-500 outline-none w-40"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                         />
                         <button 
                            onClick={() => genererSite({ title: customTitle })}
                            className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md text-sm border border-gray-600 transition"
                         >
                            Appliquer
                         </button>
                    </div>
                </div>

                <button 
                    onClick={handlePublishClick}
                    disabled={publishing}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-purple-900/50 flex items-center gap-2 transition"
                >
                    {publishing ? <IconLoader /> : isPaid ? 'Publier (Payé)' : 'Publier le site'}
                    {!isPaid && <IconLock />}
                </button>
            </div>

            {/* Preview Site */}
            <div className="flex-1 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-700 flex flex-col relative">
                {loading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-[#131722] p-6 rounded-xl border border-gray-700 shadow-2xl flex flex-col items-center">
                            <IconLoader />
                            <p className="mt-4 text-white font-medium">Modification en cours...</p>
                        </div>
                    </div>
                )}
                <iframe srcDoc={siteCode} className="flex-1 w-full h-full bg-white" title="Site Généré" sandbox="allow-scripts" />
            </div>
          </div>
        ) : (
          <div className="text-center max-w-3xl px-4 animate-in slide-in-from-bottom-8 duration-700 mt-[-5vh]">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              Créez l'impossible. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">En quelques secondes.</span>
            </h1>
            <div className="w-full max-w-2xl mx-auto relative group mt-10">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-[#131722] rounded-xl border border-gray-700 shadow-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500">
                    <input 
                        type="text" 
                        placeholder="Décrivez votre projet..." 
                        className="flex-1 px-4 py-3 bg-transparent outline-none text-white placeholder-gray-500 text-lg"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && genererSite()}
                    />
                    <button 
                        onClick={() => genererSite()}
                        disabled={loading || !prompt}
                        className={`px-6 py-3 rounded-lg font-bold text-white transition-all flex items-center gap-2 shadow-lg ${loading ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}
                    >
                        {loading ? <IconLoader /> : <>Générer <IconArrowRight /></>}
                    </button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}