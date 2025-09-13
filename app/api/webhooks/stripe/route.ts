// app/api/webhooks/stripe/route.ts
import type { NextRequest } from 'next/server';

let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  // Only initialize Stripe if the env key exists
  const Stripe = require('stripe');
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
}

export async function POST(req: NextRequest) {
  if (!stripe) {
    return new Response('Stripe not configured', { status: 500 });
  }

  // your webhook logic here
}

