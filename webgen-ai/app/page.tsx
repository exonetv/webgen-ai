"use client";
import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

// --- ICONES ---
const IconSparkles = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>);
const IconLoader = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 animate-spin"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>);
const IconArrowRight = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>);

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [siteCode, setSiteCode] = useState<string | null>(null);
  
  // --- NOUVEAU : État pour le titre personnalisé ---
  const [customTitle, setCustomTitle] = useState('');
  
  const router = useRouter();

  // Fonction de génération qui accepte des mises à jour optionnelles
  const genererSite = async (updates: any = null) => {
    if (!prompt) return;
    setLoading(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            prompt, 
            updates // On envoie les modifs ici (ex: { color: 'Rouge' })
        }),
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

  const publierSite = async () => {
    if (!siteCode) return;
    setPublishing(true);
    try {
      const docRef = await addDoc(collection(db, "sites"), {
        prompt, code: siteCode, createdAt: new Date(), views: 0
      });
      router.push(`/site/${docRef.id}`);
    } catch (e: any) {
      alert("Erreur publication: " + e.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] font-sans text-gray-100 flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none opacity-50"></div>

      <header className="border-b border-gray-800 bg-[#0B0F19]/80 backdrop-blur-xl sticky top-0 z-20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-lg shadow-lg shadow-purple-900/50">
              <IconSparkles />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">WebGen<span className="text-purple-400">.AI</span></span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center justify-center relative z-10">
        {siteCode ? (
          <div className="w-full max-w-7xl h-[85vh] flex flex-col animate-in fade-in zoom-in duration-500">
            
            {/* --- BARRE D'OUTILS DE MODIFICATION --- */}
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
                    onClick={publierSite}
                    disabled={publishing}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-purple-900/50 flex items-center gap-2 transition"
                >
                    {publishing ? <IconLoader /> : 'Publier le site'}
                </button>
            </div>

            {/* PREVIEW DU SITE */}
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