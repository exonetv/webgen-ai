import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { siteId } = body;

    // --- CORRECTION MAGIQUE ---
    // On récupère l'adresse du site qui a fait la demande (localhost ou vercel)
    const origin = req.headers.get('origin') || 'http://localhost:3000';

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
            unit_amount: 1900,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // On utilise la variable 'origin' au lieu de localhost en dur
      success_url: `${origin}/site/${siteId}?success=true`,
      cancel_url: `${origin}/`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Erreur Stripe:', error);
    return NextResponse.json({ error: "Erreur de création de session" }, { status: 500 });
  }
}