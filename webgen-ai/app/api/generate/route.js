import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt, updates } = body; 
    
    console.log("Cerveau activé pour :", prompt);
    if (updates) console.log("Modifications demandées :", updates);

    try {
      // ---------------------------------------------------------------
      // 1. TENTATIVE IA (Si tu as des crédits)
      // ---------------------------------------------------------------
      
      let systemContent = `Tu es un Designer UI/UX primé aux Awwwards. 
      Ton style est : "Futuriste, Clean, Dark Mode, High-End".
      
      Règles techniques :
      - Utilise Tailwind CSS via CDN.
      - Utilise des dégradés (bg-gradient-to-r).
      - Images : https://placehold.co/800x600/1e1e1e/FFF?text=MotClé.
      
      Structure : Navbar, Hero, Bento Grid, Footer.
      Renvoie uniquement le code HTML brut.`;

      if (updates) {
        systemContent += `
        IMPORTANT - APPLIQUE CES MODIFICATIONS SPÉCIFIQUES :
        ${updates.color ? `- CHANGE la couleur principale du site en : ${updates.color}` : ''}
        ${updates.title ? `- REMPLACE le titre principal par : "${updates.title}"` : ''}
        ${updates.style ? `- CHANGE le style global pour être : "${updates.style}"` : ''}
        Garde le reste de la structure intacte, change juste ce qui est demandé.
        `;
      }

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: `Sujet du site : ${prompt}` },
        ],
        model: "gpt-3.5-turbo",
      });

      const generatedCode = completion.choices[0].message.content;
      return NextResponse.json({ code: generatedCode });

    } catch (apiError) {
      // ---------------------------------------------------------------
      // 2. MODE SECOURS AMÉLIORÉ (Générateur dynamique)
      // ---------------------------------------------------------------
      console.warn("⚠️ IA indisponible. Activation du générateur procédural.");
      
      const p = prompt.toLowerCase();
      
      // -- A. Détection du Thème --
      let theme = { color: "indigo", bg: "slate", emoji: "🚀" };
      
      if (p.includes("pizza") || p.includes("resto")) theme = { color: "orange", bg: "stone", emoji: "🍕" };
      else if (p.includes("sport") || p.includes("fit")) theme = { color: "emerald", bg: "neutral", emoji: "💪" };
      else if (p.includes("immo") || p.includes("maison")) theme = { color: "sky", bg: "gray", emoji: "🏡" };
      else if (p.includes("tech") || p.includes("ia")) theme = { color: "violet", bg: "zinc", emoji: "🤖" };

      // -- B. Gestion des Couleurs (Updates OU Prompt) --
      const colorMap = {
          "rouge": "red", "bleu": "blue", "vert": "green", 
          "rose": "pink", "violet": "purple", "orange": "orange", "jaune": "yellow"
      };

      // Priorité 1 : Boutons d'interface
      if (updates?.color) {
        if (colorMap[updates.color.toLowerCase()]) theme.color = colorMap[updates.color.toLowerCase()];
        else theme.color = updates.color;
      } 
      // Priorité 2 : Détection dans le texte (ex: "Site rouge")
      else {
        for (const [fr, en] of Object.entries(colorMap)) {
            if (p.includes(fr)) theme.color = en;
        }
      }

      // -- C. Gestion du Titre --
      let mainTitle = updates?.title || "L'excellence <br/> réinventée.";
      
      // Si pas d'update bouton, on regarde si on a écrit "titre: Mon Titre"
      if (!updates?.title && p.includes("titre:")) {
        const parts = prompt.split(/titre\s*:/i);
        if (parts[1]) mainTitle = parts[1].trim();
      }

      const fakeHtml = `
        <!DOCTYPE html>
        <html lang="fr" class="scroll-smooth">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <title>${prompt}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&display=swap');
              body { font-family: 'Outfit', sans-serif; }
            </style>
        </head>
        <body class="bg-${theme.bg}-950 text-white selection:bg-${theme.color}-500 selection:text-white">
            
            <nav class="fixed w-full z-50 bg-${theme.bg}-950/80 backdrop-blur-md border-b border-white/5">
                <div class="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div class="text-2xl font-black tracking-tighter flex items-center gap-2">
                        <span class="bg-${theme.color}-600 w-10 h-10 rounded-lg flex items-center justify-center text-xl">${theme.emoji}</span>
                        Gen<span class="text-${theme.color}-500">Site</span>.
                    </div>
                    <button class="bg-white text-${theme.bg}-950 px-6 py-2 rounded-full font-bold hover:scale-105 transition">Contact</button>
                </div>
            </nav>

            <header class="relative pt-32 pb-20 px-6 overflow-hidden">
                <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-${theme.color}-600/20 rounded-full blur-[120px] pointer-events-none"></div>
                
                <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div>
                        <div class="inline-block px-4 py-1 rounded-full border border-${theme.color}-500/30 bg-${theme.color}-500/10 text-${theme.color}-400 text-sm font-medium mb-6 animate-pulse">
                            ✨ Design généré : ${theme.color.toUpperCase()}
                        </div>
                        <h1 class="text-6xl md:text-7xl font-black leading-tight mb-6">
                            ${mainTitle}
                        </h1>
                        <p class="text-xl text-gray-400 mb-8 leading-relaxed">
                            Site personnalisé pour "${prompt}". 
                            Généré avec le moteur WebGen AI v2.
                        </p>
                        <div class="flex gap-4">
                            <button class="px-8 py-4 bg-${theme.color}-600 rounded-xl font-bold shadow-lg shadow-${theme.color}-600/25 hover:bg-${theme.color}-500 transition">
                                Commencer
                            </button>
                        </div>
                    </div>
                    
                    <div class="relative group">
                        <div class="absolute -inset-1 bg-gradient-to-r from-${theme.color}-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                        <div class="relative aspect-square bg-${theme.bg}-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                           <img src="https://placehold.co/800x800/${theme.color}00/FFF?text=${theme.emoji}+Aperçu" alt="Hero" class="object-cover w-full h-full opacity-80 hover:scale-105 transition duration-700">
                        </div>
                    </div>
                </div>
            </header>

            <section class="py-24 bg-${theme.bg}-900/50">
                <div class="max-w-7xl mx-auto px-6">
                    <div class="grid md:grid-cols-3 gap-8">
                        <div class="p-8 rounded-3xl bg-${theme.bg}-950 border border-white/5 hover:border-${theme.color}-500/50 transition duration-300 group">
                            <div class="w-14 h-14 bg-${theme.bg}-900 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-${theme.color}-600 transition text-white">🚀</div>
                            <h3 class="text-2xl font-bold mb-3">Vitesse</h3>
                            <p class="text-gray-400">Optimisé pour la performance.</p>
                        </div>
                         <div class="p-8 rounded-3xl bg-${theme.bg}-950 border border-white/5 hover:border-${theme.color}-500/50 transition duration-300 group">
                            <div class="w-14 h-14 bg-${theme.bg}-900 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-${theme.color}-600 transition text-white">🎨</div>
                            <h3 class="text-2xl font-bold mb-3">Couleur : ${theme.color}</h3>
                            <p class="text-gray-400">Palette générée dynamiquement.</p>
                        </div>
                         <div class="p-8 rounded-3xl bg-${theme.bg}-950 border border-white/5 hover:border-${theme.color}-500/50 transition duration-300 group">
                            <div class="w-14 h-14 bg-${theme.bg}-900 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-${theme.color}-600 transition text-white">⚙️</div>
                            <h3 class="text-2xl font-bold mb-3">Modulable</h3>
                            <p class="text-gray-400">Modifiez ce site en un clic.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            <footer class="py-10 text-center text-gray-600 text-sm">© 2024 Généré par IA</footer>
        </body>
        </html>
      `;

      return NextResponse.json({ code: fakeHtml });
    }

  } catch (error) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}