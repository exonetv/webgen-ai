import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt, updates, conversation } = body; 
    
    // Analyse des besoins basée sur la conversation ou le prompt pour déterminer le type
    // On concatène tout le texte disponible pour chercher des mots clés
    const p = (prompt + " " + JSON.stringify(conversation || [])).toLowerCase();
    
    let type = "business";
    if (p.includes("boutique") || p.includes("vente") || p.includes("store") || p.includes("e-commerce")) type = "store";
    else if (p.includes("portfolio") || p.includes("photo") || p.includes("art") || p.includes("design")) type = "portfolio";
    else if (p.includes("restaurant") || p.includes("manger") || p.includes("food") || p.includes("cuisine")) type = "restaurant";
    else if (p.includes("blog") || p.includes("journal") || p.includes("actu")) type = "blog";

    console.log(`🧠 Cerveau activé | Type: ${type} | Update: ${updates ? 'Oui' : 'Non'}`);

    try {
      // ---------------------------------------------------------------
      // 1. TENTATIVE IA (Si crédits disponibles sur OpenAI)
      // ---------------------------------------------------------------
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Tu es un Expert Web Designer et Développeur Frontend Senior.
            Ton but : Générer ou Modifier un site web HTML complet (Single Page) avec Tailwind CSS.
            
            CONTEXTE :
            - Type de site détecté : ${type.toUpperCase()}
            - Conversation utilisateur : ${JSON.stringify(conversation)}
            - Modifications demandées : ${JSON.stringify(updates)}

            RÈGLES DE GÉNÉRATION STRICTES :
            1. TECH STACK : Utilise exclusivement HTML5 et Tailwind CSS (via CDN). Pas de CSS custom dans <style> sauf si nécessaire pour des animations.
            2. DESIGN : Le design doit être MODERNE, ÉPURÉ, PREMIUM (Style Apple/Stripe/Linear). Utilise des "Bento grids", de gros titres, beaucoup d'espace blanc (whitespace), des ombres douces et des coins arrondis.
            3. IMAGES : Utilise exclusivement des placeholders dynamiques : "https://placehold.co/WIDTHxHEIGHT/222/FFF?text=MotClé" (Ex: 600x400, 1920x1080). Adapte la taille et le texte de l'image au contexte.
            4. STRUCTURE : 
               - Navbar (Sticky, floue)
               - Hero Section (Titre impactant + CTA + Image ou Fond abstrait)
               - Section Spécifique (Grille Produits pour Store, Menu pour Resto, Projets pour Portfolio, Services pour Business)
               - Preuve Sociale / Témoignages
               - Footer complet.
            5. MODIFICATIONS : Si le paramètre "updates" est présent, garde la structure globale mais applique UNIQUEMENT les changements demandés (ex: "Change la couleur en rouge", "Ajoute une section FAQ").
            6. SORTIE : Renvoie SEULEMENT le code HTML brut commençant par <!DOCTYPE html>. Ne mets pas de markdown (\`\`\`) autour. Pas d'explications.`
          },
          { role: "user", content: `Génère le code du site maintenant en prenant en compte tout le contexte.` },
        ],
        model: "gpt-3.5-turbo", // Passe à "gpt-4-turbo" si tu as le budget pour un résultat bien meilleur
      });

      return NextResponse.json({ code: completion.choices[0].message.content });

    } catch (apiError) {
      // ---------------------------------------------------------------
      // 2. MODE SECOURS AVANCÉ (Si OpenAI échoue / Pas de crédits)
      // ---------------------------------------------------------------
      console.warn("⚠️ IA indisponible ou erreur quota. Activation du générateur procédural de secours.");
      
      // Configuration dynamique du thème de secours
      let theme = { color: "indigo", bg: "slate", font: "Inter", emoji: "⚡️" };
      
      // Détection couleur demandée
      const colorMap = { rouge: "red", bleu: "blue", vert: "emerald", violet: "violet", orange: "orange", rose: "pink", noir: "zinc" };
      if (updates?.color && colorMap[updates.color.toLowerCase()]) {
         theme.color = colorMap[updates.color.toLowerCase()];
      } else {
         // Couleurs par défaut selon le type
         if (type === "restaurant") theme = { color: "orange", bg: "stone", font: "Playfair Display", emoji: "🍽️" };
         if (type === "store") theme = { color: "blue", bg: "gray", font: "Poppins", emoji: "🛍️" };
         if (type === "portfolio") theme = { color: "fuchsia", bg: "neutral", font: "Montserrat", emoji: "🎨" };
      }

      // Titre intelligent
      const mainTitle = updates?.title || (type === "store" ? "Nouvelle Collection 2024" : type === "restaurant" ? "Saveurs d'Exception" : type === "portfolio" ? "Créativité Sans Limite" : "Boostez votre Business");
      
      // Génération de la section spécifique selon le type
      let specificSection = "";
      
      if (type === "store") {
        specificSection = `
          <section class="py-20 px-6 bg-${theme.bg}-900">
             <div class="max-w-7xl mx-auto">
                <h2 class="text-3xl font-bold text-white mb-10">Nos Produits Phares</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                   ${[1, 2, 3].map(i => `
                      <div class="bg-${theme.bg}-800 rounded-xl overflow-hidden group hover:-translate-y-2 transition duration-300 border border-white/5">
                         <div class="relative aspect-[4/3] overflow-hidden">
                            <img src="https://placehold.co/600x400/333/FFF?text=Produit+${i}" class="object-cover w-full h-full group-hover:scale-110 transition duration-500">
                            <span class="absolute top-4 left-4 bg-${theme.color}-600 text-white text-xs font-bold px-3 py-1 rounded-full">Nouveau</span>
                         </div>
                         <div class="p-6">
                            <div class="flex justify-between items-start mb-2">
                               <h3 class="text-xl font-bold text-white">Article Premium ${i}</h3>
                               <span class="text-${theme.color}-400 font-bold">${49 + i * 20}€</span>
                            </div>
                            <p class="text-gray-400 text-sm mb-4">Une qualité exceptionnelle pour un style unique.</p>
                            <button class="w-full py-3 bg-white/10 hover:bg-${theme.color}-600 text-white rounded-lg transition font-medium">Ajouter au panier</button>
                         </div>
                      </div>
                   `).join('')}
                </div>
             </div>
          </section>
        `;
      } else if (type === "portfolio") {
        specificSection = `
          <section class="py-20 px-6">
             <div class="max-w-7xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                ${[1, 2, 3, 4, 5, 6].map(i => `
                   <div class="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-pointer">
                      <img src="https://placehold.co/600x${400 + (i%2)*200}/222/FFF?text=Projet+${i}" class="w-full object-cover group-hover:opacity-75 transition duration-500">
                      <div class="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition duration-300">
                         <h3 class="text-xl font-bold text-white">Projet Créatif ${i}</h3>
                         <p class="text-${theme.color}-400">Design / Art Direction</p>
                      </div>
                   </div>
                `).join('')}
             </div>
          </section>
        `;
      } else if (type === "restaurant") {
         specificSection = `
          <section class="py-20 px-6 bg-${theme.bg}-900 relative overflow-hidden">
             <div class="absolute top-0 right-0 w-64 h-64 bg-${theme.color}-500/10 rounded-full blur-3xl"></div>
             <div class="max-w-4xl mx-auto bg-${theme.bg}-800/50 p-10 md:p-16 rounded-2xl border border-white/5 backdrop-blur-sm relative z-10">
                <h2 class="text-4xl font-serif text-center text-white mb-12 italic">La Carte</h2>
                <div class="space-y-10">
                   ${['Entrées', 'Plats', 'Desserts'].map((cat) => `
                      <div>
                        <h3 class="text-xl font-bold text-${theme.color}-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">${cat}</h3>
                        <div class="space-y-6">
                            <div class="flex justify-between items-baseline group">
                                <div>
                                    <h4 class="text-xl text-white font-medium group-hover:text-${theme.color}-300 transition">Création de Saison</h4>
                                    <p class="text-gray-500 text-sm">Ingrédients locaux, saveurs authentiques.</p>
                                </div>
                                <div class="text-xl text-white font-serif">24€</div>
                            </div>
                            <div class="flex justify-between items-baseline group">
                                <div>
                                    <h4 class="text-xl text-white font-medium group-hover:text-${theme.color}-300 transition">Spécialité du Chef</h4>
                                    <p class="text-gray-500 text-sm">Une expérience culinaire unique.</p>
                                </div>
                                <div class="text-xl text-white font-serif">32€</div>
                            </div>
                        </div>
                      </div>
                   `).join('')}
                </div>
             </div>
          </section>
         `;
      } else {
        // Business Default
        specificSection = `
          <section class="py-24 px-6 bg-${theme.bg}-900/50">
             <div class="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                ${['Stratégie', 'Marketing', 'Analyse'].map((item, i) => `
                   <div class="p-8 border border-white/5 bg-${theme.bg}-800/30 rounded-2xl hover:bg-${theme.bg}-800 transition duration-300 group">
                      <div class="w-14 h-14 bg-${theme.color}-500/10 text-${theme.color}-400 rounded-xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition">${['📈','🎯','📊'][i]}</div>
                      <h3 class="text-xl font-bold text-white mb-3">${item}</h3>
                      <p class="text-gray-400 leading-relaxed">Nous vous aidons à atteindre vos objectifs avec une approche ${item.toLowerCase()} éprouvée et des résultats mesurables.</p>
                   </div>
                `).join('')}
             </div>
          </section>
        `;
      }

      // Ajout de sections dynamiques (Si demandé via les boutons du dashboard)
      let extraSections = "";
      if (updates?.style && updates.style.includes("Ajoute section")) {
          // Simulation simple d'ajout de section pour le mode secours
          if (updates.style.includes("témoignages")) {
              extraSections += `
              <section class="py-20 px-6 bg-${theme.bg}-950 border-t border-white/5">
                <div class="max-w-7xl mx-auto text-center">
                    <h2 class="text-3xl font-bold text-white mb-12">Ce qu'ils disent de nous</h2>
                    <div class="grid md:grid-cols-3 gap-8">
                        ${[1,2,3].map(i => `
                        <div class="bg-${theme.bg}-900 p-8 rounded-2xl border border-white/5 text-left">
                            <div class="flex text-${theme.color}-400 mb-4 text-sm">★★★★★</div>
                            <p class="text-gray-300 mb-6">"Un service absolument incroyable. L'équipe a été à l'écoute et le résultat dépasse nos attentes."</p>
                            <div class="flex items-center gap-4">
                                <img src="https://placehold.co/100x100/333/FFF?text=User" class="w-10 h-10 rounded-full">
                                <div>
                                    <div class="text-white font-bold text-sm">Client Satisfait ${i}</div>
                                    <div class="text-gray-500 text-xs">CEO, Entreprise</div>
                                </div>
                            </div>
                        </div>`).join('')}
                    </div>
                </div>
              </section>`;
          }
          if (updates.style.includes("FAQ")) {
              extraSections += `
              <section class="py-20 px-6">
                <div class="max-w-3xl mx-auto">
                    <h2 class="text-3xl font-bold text-white mb-10 text-center">Questions Fréquentes</h2>
                    <div class="space-y-4">
                        ${[1,2,3].map(i => `
                        <div class="bg-${theme.bg}-800/50 border border-white/5 rounded-xl p-6 hover:border-${theme.color}-500/30 transition cursor-pointer">
                            <h3 class="text-lg font-bold text-white flex justify-between">Question fréquente numéro ${i} ? <span>+</span></h3>
                            <p class="text-gray-400 mt-2 text-sm">Voici la réponse détaillée à cette question importante que se posent souvent nos clients.</p>
                        </div>`).join('')}
                    </div>
                </div>
              </section>`;
          }
      }

      // Structure Globale HTML
      const fullHtml = `
        <!DOCTYPE html>
        <html lang="fr" class="scroll-smooth">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=${theme.font.replace(' ', '+')}:wght@300;400;600;700;800&display=swap" rel="stylesheet">
            <style>
               body { font-family: '${theme.font}', sans-serif; }
               .gradient-text { background-clip: text; -webkit-background-clip: text; color: transparent; background-image: linear-gradient(to right, #fff, var(--tw-color-${theme.color}-400)); }
            </style>
        </head>
        <body class="bg-${theme.bg}-950 text-white selection:bg-${theme.color}-500 selection:text-white overflow-x-hidden">
            
            <!-- Nav -->
            <nav class="fixed w-full z-50 px-6 py-4 flex justify-between items-center bg-${theme.bg}-950/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
                <div class="text-2xl font-black tracking-tighter flex items-center gap-2">
                    <span class="w-8 h-8 rounded-lg bg-${theme.color}-600 flex items-center justify-center text-sm shadow-lg shadow-${theme.color}-500/20">${theme.emoji}</span>
                    <span>Brand.</span>
                </div>
                <div class="hidden md:flex gap-8 text-sm font-medium text-gray-400">
                    <a href="#" class="hover:text-white transition">Accueil</a>
                    <a href="#" class="hover:text-white transition">Services</a>
                    <a href="#" class="hover:text-white transition">À propos</a>
                </div>
                <button class="bg-white text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition">Contact</button>
            </nav>

            <!-- Hero -->
            <header class="relative pt-32 pb-20 px-6 min-h-[85vh] flex items-center justify-center overflow-hidden">
                <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-${theme.color}-900/40 via-${theme.bg}-950 to-${theme.bg}-950 pointer-events-none"></div>
                <div class="relative z-10 text-center max-w-5xl mx-auto">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-${theme.color}-500/30 bg-${theme.color}-500/10 text-${theme.color}-300 text-xs font-bold uppercase tracking-wider mb-8 animate-pulse">
                        Nouvelle Experience
                    </div>
                    <h1 class="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tight">
                        ${mainTitle}
                    </h1>
                    <p class="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Un site web généré sur mesure pour répondre à vos besoins. 
                        Design moderne, performance maximale.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <button class="px-8 py-4 bg-${theme.color}-600 hover:bg-${theme.color}-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-${theme.color}-900/50 transition transform hover:scale-105 hover:-translate-y-1">
                            Commencer
                        </button>
                        <button class="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold text-lg transition">
                            En savoir plus
                        </button>
                    </div>
                </div>
            </header>

            ${specificSection}
            
            ${extraSections}

            <!-- Footer -->
            <footer class="py-12 border-t border-white/5 bg-${theme.bg}-950 text-center">
                <div class="flex justify-center gap-6 mb-8 text-gray-500">
                    <span>Instagram</span><span>Twitter</span><span>LinkedIn</span>
                </div>
                <p class="text-gray-600 text-sm">© 2024 Généré par WebGen AI.</p>
            </footer>

        </body>
        </html>
      `;

      return NextResponse.json({ code: fullHtml });
    }

  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}