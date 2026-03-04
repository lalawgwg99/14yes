interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return new Response('Missing signature', { status: 400 });
  }

  // In production, verify the webhook signature using Stripe's library
  // For Cloudflare Workers, we'd use a crypto-based verification
  // For now, we parse and handle the event

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response('Invalid payload', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const customerEmail = session.customer_email || session.customer_details?.email;
      const subscriptionId = session.subscription;

      // TODO: Update user tier in D1 database
      console.log(`[Stripe] Checkout completed: ${customerEmail}, subscription: ${subscriptionId}`);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const status = subscription.status;
      console.log(`[Stripe] Subscription updated: ${subscription.id}, status: ${status}`);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      console.log(`[Stripe] Subscription cancelled: ${subscription.id}`);
      // TODO: Downgrade user tier in D1 database
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      console.log(`[Stripe] Payment failed: ${invoice.customer_email}`);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
