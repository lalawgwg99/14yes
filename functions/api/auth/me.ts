interface Env {
  JWT_SECRET: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Cookie',
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const cookie = request.headers.get('Cookie') || '';
  const sessionMatch = cookie.match(/nexus-session=([^;]+)/);

  if (!sessionMatch) {
    return new Response(JSON.stringify({ user: null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // TODO: Look up session in D1 database
  // For now, return a placeholder
  return new Response(JSON.stringify({
    user: {
      email: 'user@example.com',
      tier: 'COMMANDER',
      stripeCustomerId: null,
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    },
  });
};
