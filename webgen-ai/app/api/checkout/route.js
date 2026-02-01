import Stripe from 'stripe';
import { NextResponse } from 'next/server';

// On initialise Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { siteId } = body; // On récupère l'ID du site à payer

    // On crée la session de paiement
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Hébergement & Publication Site Web',
              description: 'Licence unique pour votre site généré par IA',
            },
            unit_amount: 1900, // 19.00€ (en centimes)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // URLs de redirection après paiement
      // Remplace localhost:3000 par ton lien Vercel quand tu passeras en production !
      success_url: `http://localhost:3000/site/${siteId}?success=true`,
      cancel_url: `http://localhost:3000/`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Erreur Stripe:', error);
    return NextResponse.json({ error: "Erreur de création de session" }, { status: 500 });
  }
}