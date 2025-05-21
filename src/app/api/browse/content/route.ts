import { ItemChildrenQuery } from '@/services/sitecore/searchTemplate.query';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('CONTENT API');

    const body = await request.json();
    const { gqlEndpoint, gqlApiKey, itemId } = body;

    // get all templates...
    const contentQuery = ItemChildrenQuery.replace('[ITEMID]', itemId);
    let query = {
      query: contentQuery,
    };

    console.log('Run content query on ' + itemId);

    console.log(query);

    const allTemplatesResponse: any = await fetch(gqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + gqlApiKey,
      },
      body: JSON.stringify(query),
    });

    const jsonResults = await allTemplatesResponse.json();

    console.log(JSON.stringify(jsonResults));

    const results = jsonResults?.data?.item?.children?.nodes;

    return NextResponse.json({ children: results });
  } catch (error) {
    console.error('Error posting query:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
