import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(body);
    const { gqlEndpoint, jsonQuery, authToken } = body;

    console.log('gqlEndpoint: ' + gqlEndpoint);
    console.log('query: ' + jsonQuery);
    console.log('authToken: ' + authToken);

    const response = await fetch(gqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authToken,
      },
      body: jsonQuery,
    });

    const data = await response.json();
    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error posting query:', error);
    return NextResponse.json({ error: 'Failed to post query' }, { status: 500 });
  }
}
