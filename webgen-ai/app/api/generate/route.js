import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt, updates } = body; 
    
    // Analyse simple du type de site demandé si pas explicite
    const p = prompt.toLowerCase();
    let type = "business";
    if (p.includes("boutique") || p.includes("vente") || p.includes("store")) type = "store";
    else if (p.includes("portfolio") || p.includes("photo") || p.includes("art")) type = "portfolio";
    else if (p.includes("restaurant") || p.includes("manger") || p.includes("food")) type = "restaurant";
    else if (p.includes("blog") || p.includes("article")) type = "blog";

    console.log(`Génération type: ${type} | Prompt: ${prompt}`);

    try {
      // ---------------------------------------------------------------
      // 1. TENTATIVE IA (Si crédits disponibles)
      // ---------------------------------------------------------------
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Tu es un Expert Web Designer. Tu dois générer le HTML complet d'un site web.
            
            RÈGLES CRITIQUES :
            1. Utilise Tailwind CSS via CDN.
            2. Le design doit être radicalement différent selon le type (${type}).
            3. Pour une Boutique : Inclus une grille de produits avec prix et boutons "Ajouter".
            4. Pour un Portfolio : Inclus une galerie masonry et des grands visuels.
            5. Pour un Restaurant : Inclus un Menu détaillé et un module de réservation.
            6. Images : Utilise https://placehold.co/600x400/222/FFF?text=MotClé (Adapte le MotClé).
            7. Utilise des icônes SVG inline (pas de fontawesome).
            8. Renvoie UNIQUEMENT le code HTML brut, sans markdown.`
          },
          { role: "user", content: `Sujet: ${prompt}. ${updates ? `Modifications: ${JSON.stringify(updates)}` : ''}` },
        ],
        model: "gpt-3.5-turbo",
      });

      return NextResponse.json({ code: completion.choices[0].message.content });

    } catch (apiError) {
      // ---------------------------------------------------------------
      // 2. MODE SECOURS AVANCÉ (Templates distincts)
      // ---------------------------------------------------------------
      console.warn("⚠️ IA indisponible. Utilisation des templates statiques avancés.");
      
      let theme = { color: "indigo", bg: "slate", font: "Inter" };
      
      // Personnalisation des couleurs selon le prompt
      if (updates?.color) {
         const map = { rouge: "red", bleu: "blue", vert: "emerald", violet: "violet", orange: "orange", rose: "pink", noir: "zinc" };
         theme.color = map[updates.color.toLowerCase()] || "indigo";
      } else {
         if (type === "restaurant") theme = { color: "orange", bg: "stone", font: "Playfair Display" };
         if (type === "store") theme = { color: "blue", bg: "gray", font: "Poppins" };
         if (type === "portfolio") theme = { color: "fuchsia", bg: "neutral", font: "Montserrat" };
      }

      let htmlContent = "";

      // --- TEMPLATE BOUTIQUE ---
      if (type === "store") {
        htmlContent = `
          <nav class="flex justify-between items-center p-6 border-b border-white/10 bg-${theme.bg}-900/50 backdrop-blur fixed w-full z-50">
            <div class="text-2xl font-bold text-white">Store<span class="text-${theme.color}-500">.</span></div>
            <div class="flex gap-6 text-sm text-gray-300">
               <a href="#" class="hover:text-white">Nouveautés</a>
               <a href="#" class="hover:text-white">Hommes</a>
               <a href="#" class="hover:text-white">Femmes</a>
            </div>
            <div class="flex gap-4">
               <button class="text-white hover:text-${theme.color}-400">🔍</button>
               <button class="text-white hover:text-${theme.color}-400">🛒 (0)</button>
            </div>
          </nav>
          
          <header class="pt-32 pb-20 px-6 text-center bg-gradient-to-b from-${theme.bg}-900 to-${theme.bg}-950">
             <span class="text-${theme.color}-400 text-sm font-bold tracking-widest uppercase mb-4 block">Collection 2024</span>
             <h1 class="text-6xl font-black text-white mb-6 leading-tight">Le style sans<br>compromis.</h1>
             <button class="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-${theme.color}-400 transition">Découvrir la collection</button>
          </header>

          <section class="py-20 px-6 max-w-7xl mx-auto">
             <div class="flex justify-between items-end mb-10">
                <h2 class="text-3xl font-bold text-white">Populaire</h2>
                <a href="#" class="text-${theme.color}-400 hover:text-white transition">Voir tout -></a>
             </div>
             <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                ${[1, 2, 3, 4].map(i => `
                  <div class="group">
                     <div class="relative overflow-hidden rounded-xl aspect-[3/4] mb-4">
                        <img src="https://placehold.co/600x800/222/FFF?text=Produit+${i}" class="object-cover w-full h-full group-hover:scale-110 transition duration-700">
                        <button class="absolute bottom-4 right-4 bg-white text-black w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg">+</button>
                     </div>
                     <h3 class="text-white font-medium">Article Premium ${i}</h3>
                     <p class="text-gray-500 text-sm">12${i}.00 €</p>
                  </div>
                `).join('')}
             </div>
          </section>
        `;
      } 
      // --- TEMPLATE RESTAURANT ---
      else if (type === "restaurant") {
        htmlContent = `
          <nav class="absolute w-full z-50 p-8 flex justify-center">
             <div class="bg-white/10 backdrop-blur-md px-8 py-3 rounded-full flex gap-8 text-white border border-white/20">
                <a href="#" class="hover:text-${theme.color}-300">Menu</a>
                <span class="font-bold text-${theme.color}-400 text-lg">LE GOURMET</span>
                <a href="#" class="hover:text-${theme.color}-300">Réserver</a>
             </div>
          </nav>

          <header class="h-screen flex flex-col justify-center items-center relative overflow-hidden">
             <img src="https://placehold.co/1920x1080/1a1a1a/333?text=Ambiance+Resto" class="absolute inset-0 w-full h-full object-cover opacity-40">
             <div class="relative z-10 text-center px-4">
                <h1 class="text-7xl md:text-9xl font-serif text-white mb-6">Savourez.</h1>
                <p class="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Une cuisine d'exception dans un cadre inoubliable. Ingrédients locaux, passion globale.</p>
                <button class="border border-${theme.color}-500 text-${theme.color}-500 hover:bg-${theme.color}-500 hover:text-white px-8 py-3 uppercase tracking-widest text-sm transition">Réserver une table</button>
             </div>
          </header>

          <section class="py-24 bg-${theme.bg}-900 px-6">
             <div class="max-w-4xl mx-auto bg-${theme.bg}-800 p-12 rounded-sm border border-white/5 relative">
                <h2 class="text-4xl font-serif text-center text-white mb-16 text-${theme.color}-400">Le Menu</h2>
                <div class="space-y-8">
                   ${['Entrée du Chef', 'Plat Signature', 'Délice Sucré'].map((plat, i) => `
                      <div class="flex justify-between items-baseline border-b border-white/10 pb-4">
                         <div>
                            <h3 class="text-xl font-bold text-white mb-1">${plat}</h3>
                            <p class="text-sm text-gray-500">Description délicieuse des ingrédients frais.</p>
                         </div>
                         <span class="text-xl font-serif text-${theme.color}-400">${20 + i * 5}€</span>
                      </div>
                   `).join('')}
                </div>
             </div>
          </section>
        `;
      }
      // --- TEMPLATE PORTFOLIO / CREATIF ---
      else if (type === "portfolio") {
        htmlContent = `
          <div class="flex h-screen overflow-hidden bg-${theme.bg}-950 text-white">
             <aside class="w-24 border-r border-white/5 flex flex-col items-center py-8 gap-8">
                <div class="font-bold text-2xl">P<span class="text-${theme.color}-500">.</span></div>
                <div class="flex-1 flex flex-col justify-center gap-8 text-xs font-bold uppercase rotate-180" style="writing-mode: vertical-rl;">
                   <a href="#" class="text-${theme.color}-500">Accueil</a>
                   <a href="#" class="text-gray-500 hover:text-white">Projets</a>
                   <a href="#" class="text-gray-500 hover:text-white">Contact</a>
                </div>
             </aside>
             <main class="flex-1 overflow-y-auto">
                <header class="p-20">
                   <h1 class="text-8xl font-black mb-8 leading-none uppercase">Créatif <br> <span class="text-transparent bg-clip-text bg-gradient-to-r from-${theme.color}-500 to-purple-600">Director</span></h1>
                   <p class="text-2xl text-gray-400 max-w-2xl">Je transforme des idées complexes en expériences digitales simples et magnifiques.</p>
                </header>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-1 px-20 pb-20">
                   ${[1, 2, 3, 4].map(i => `
                      <div class="relative group aspect-square overflow-hidden bg-gray-900">
                         <img src="https://placehold.co/800x800/111/444?text=Projet+${i}" class="object-cover w-full h-full opacity-60 group-hover:opacity-100 group-hover:scale-105 transition duration-700">
                         <div class="absolute bottom-0 left-0 p-8 translate-y-full group-hover:translate-y-0 transition duration-500">
                            <h3 class="text-3xl font-bold">Projet ${i}</h3>
                            <p class="text-${theme.color}-400">Branding / UI</p>
                         </div>
                      </div>
                   `).join('')}
                </div>
             </main>
          </div>
        `;
      }
      // --- TEMPLATE BUSINESS (DEFAUT) ---
      else {
        htmlContent = `
          <nav class="fixed w-full z-50 bg-${theme.bg}-950/80 backdrop-blur-md border-b border-white/5">
              <div class="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                  <div class="text-2xl font-black flex gap-2 items-center text-white">
                      <div class="w-8 h-8 bg-${theme.color}-600 rounded flex items-center justify-center">B</div>
                      ${updates?.title || "Business"}
                  </div>
                  <button class="bg-${theme.color}-600 hover:bg-${theme.color}-500 text-white px-6 py-2 rounded font-bold transition">Contact Pro</button>
              </div>
          </nav>
          
          <header class="pt-32 pb-20 px-6 bg-${theme.bg}-950 text-white">
              <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                  <div>
                      <h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">Boostez votre <span class="text-${theme.color}-500">Croissance</span>.</h1>
                      <p class="text-xl text-gray-400 mb-8">Des solutions innovantes pour les entreprises qui veulent aller plus loin.</p>
                      <div class="flex gap-4">
                          <button class="bg-white text-${theme.bg}-950 px-8 py-3 rounded font-bold hover:bg-gray-200 transition">Commencer</button>
                          <button class="border border-white/20 px-8 py-3 rounded font-bold hover:bg-white/5 transition">En savoir plus</button>
                      </div>
                  </div>
                  <div class="bg-gradient-to-tr from-${theme.color}-600/20 to-purple-600/20 rounded-2xl p-8 border border-white/10">
                      <div class="grid grid-cols-2 gap-4">
                          <div class="bg-${theme.bg}-900 p-4 rounded-xl border border-white/5 animate-pulse"><div class="h-2 bg-gray-700 rounded w-1/2 mb-2"></div><div class="h-8 bg-${theme.color}-600 rounded w-3/4"></div></div>
                          <div class="bg-${theme.bg}-900 p-4 rounded-xl border border-white/5 mt-8"><div class="h-2 bg-gray-700 rounded w-1/2 mb-2"></div><div class="h-8 bg-purple-600 rounded w-3/4"></div></div>
                      </div>
                  </div>
              </div>
          </header>
        `;
      }

      // Enrobage HTML global
      const fullHtml = `
        <!DOCTYPE html>
        <html lang="fr" class="scroll-smooth">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <title>${prompt}</title>
            <link href="https://fonts.googleapis.com/css2?family=${theme.font.replace(' ', '+')}:wght@300;400;700;900&display=swap" rel="stylesheet">
            <style>body { font-family: '${theme.font}', sans-serif; }</style>
        </head>
        <body class="bg-${theme.bg}-950 text-white selection:bg-${theme.color}-500 selection:text-white">
            ${htmlContent}
            <footer class="py-12 text-center text-gray-600 border-t border-white/5 bg-${theme.bg}-950">
                <p>&copy; 2024 ${updates?.title || "Site Généré"}. Tous droits réservés.</p>
            </footer>
        </body>
        </html>
      `;

      return NextResponse.json({ code: fullHtml });
    }

  } catch (error) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}