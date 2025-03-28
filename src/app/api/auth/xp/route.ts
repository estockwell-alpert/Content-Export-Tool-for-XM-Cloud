import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('API Get XP Token');
    const body = await request.json();
    const { clientId, clientSecret, username, password, identityServerUrl } = body;

    const params = new URLSearchParams({
      grant_type: 'password',
      username: `sitecore\\${username}`,
      password: password,
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'openid sitecore.profile sitecore.profile.api',
    });

    const response = await fetch(`${identityServerUrl}/connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching token:', error);
    return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
  }
}
