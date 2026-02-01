"use client";
import { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams, useSearchParams } from 'next/navigation';

// --- ICONES ---
const IconCheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-green-500 animate-bounce">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

export default function ViewSite() {
  const { id } = useParams();
  const searchParams = useSearchParams(); // Permet de lire l'URL (?success=true)
  
  const [siteHtml, setSiteHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // 1. Vérifier si on revient d'un paiement réussi
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      // On nettoie l'URL pour ne pas réafficher le message si on rafraîchit la page
      window.history.replaceState(null, '', `/site/${id}`);
    }

    // 2. Charger le site depuis Firebase
    const fetchSite = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "sites", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSiteHtml(docSnap.data().code);
        } else {
          console.log("Aucun site trouvé !");
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [id, searchParams]);

  if (loading) return <div className="h-screen bg-[#0B0F19] text-white flex items-center justify-center font-sans">Chargement de votre site...</div>;

  if (!siteHtml) return <div className="h-screen flex items-center justify-center bg-[#0B0F19] text-white font-sans">Site introuvable (404)</div>;

  return (
    <div className="w-full h-screen m-0 p-0 overflow-hidden relative font-sans">
      
      {/* MODALE DE SUCCÈS (S'affiche uniquement après paiement) */}
      {showSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center transform animate-in zoom-in-95 duration-300 relative overflow-hidden">
            {/* Effet de fond festif */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
            
            <div className="flex justify-center mb-6">
              <IconCheckCircle />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Paiement Réussi !</h2>
            <p className="text-gray-500 mb-8 text-lg">
              Félicitations, votre site est maintenant officiellement en ligne et hébergé.
            </p>

            <button 
              onClick={() => setShowSuccess(false)}
              className="w-full py-3 px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02]"
            >
              Voir mon site
            </button>
          </div>
        </div>
      )}

      {/* Le Site Utilisateur */}
      <iframe 
        srcDoc={siteHtml}
        className="w-full h-full border-0"
        title="Site Utilisateur"
        sandbox="allow-scripts"
      />
    </div>
  );
}