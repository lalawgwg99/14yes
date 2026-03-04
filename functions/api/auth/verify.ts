interface Env {
  JWT_SECRET: string;
  SITE_URL: string;
}

async function verifyToken(token: string, secret: string): Promise<{ email: string } | null> {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;

    // Verify signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );

    const data = encoder.encode(`${header}.${payload}`);
    const sigBytes = Uint8Array.from(
      atob(signature.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, data);
    if (!valid) return null;

    const decoded = JSON.parse(atob(payload));
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;

    return { email: decoded.email };
  } catch {
    return null;
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('Missing token', { status: 400 });
  }

  const result = await verifyToken(token, env.JWT_SECRET);
  if (!result) {
    return new Response('Invalid or expired token', { status: 401 });
  }

  // Generate session token
  const sessionToken = crypto.randomUUID();
  const siteUrl = env.SITE_URL || 'https://nexus-finance.pages.dev';

  // TODO: Store session in D1 database
  // For now, set a cookie with the email
  return new Response(null, {
    status: 302,
    headers: {
      'Location': `${siteUrl}/dashboard`,
      'Set-Cookie': `nexus-session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`,
    },
  });
};
