interface Env {
  STRIPE_SECRET_KEY: string;
  SITE_URL: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const PRICES: Record<string, { priceId: string; mode: 'subscription' | 'payment' }> = {
  'pro-monthly': { priceId: 'price_pro_monthly', mode: 'subscription' },
  'pro-yearly': { priceId: 'price_pro_yearly', mode: 'subscription' },
  'team-monthly': { priceId: 'price_team_monthly', mode: 'subscription' },
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!env.STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const plan = PRICES[body.plan];
  if (!plan) {
    return new Response(JSON.stringify({ error: 'Invalid plan' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const siteUrl = env.SITE_URL || 'https://nexus-finance.pages.dev';

  try {
    const stripeResp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': plan.mode,
        'line_items[0][price]': plan.priceId,
        'line_items[0][quantity]': '1',
        'success_url': `${siteUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${siteUrl}/analysis`,
        ...(body.email ? { 'customer_email': body.email } : {}),
      }),
    });

    const session = await stripeResp.json();

    if (!stripeResp.ok) {
      return new Response(JSON.stringify({ error: (session as any).error?.message || 'Stripe error' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ url: (session as any).url, sessionId: (session as any).id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders });
};
