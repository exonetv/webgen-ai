"use client";
import { useEffect, useState } from 'react';
// 👇 C'est ici la correction importante : on remonte de 3 dossiers (../../..)
import { db } from '../../../firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';

export default function ViewSite() {
  const { id } = useParams();
  const [siteHtml, setSiteHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSite = async () => {
      if (!id) return;
      try {
        // TypeScript peut râler sur id, on le force en string
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

  if (!siteHtml) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Site introuvable (404)</div>;

  return (
    <div className="w-full h-screen m-0 p-0 overflow-hidden">
      <iframe 
        srcDoc={siteHtml}
        className="w-full h-full border-0"
        title="Site Utilisateur"
        sandbox="allow-scripts"
      />
    </div>
  );
}