"use client";
import { useEffect, useState } from 'react';
import { db } from '../../../firebase'; // Attention au chemin relatif (on remonte de 3 dossiers)
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';

export default function ViewSite() {
  const { id } = useParams(); // On récupère l'ID depuis l'URL (ex: /site/abc12345)
  const [siteHtml, setSiteHtml] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSite = async () => {
      if (!id) return;
      try {
        // On va chercher le document dans Firestore avec cet ID
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
  }, [id]);

  if (loading) return <div className="h-screen bg-black text-white flex items-center justify-center">Chargement du site...</div>;

  if (!siteHtml) return <div className="h-screen flex items-center justify-center">Site introuvable (404)</div>;

  // On affiche le site en PLEIN ÉCRAN
  return (
    <div className="w-full h-screen m-0 p-0 overflow-hidden">
      <iframe 
        srcDoc={siteHtml}
        className="w-full h-full border-0"
        title="Site Utilisateur"
      />
    </div>
  );
}