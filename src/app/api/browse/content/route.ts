import { EdgeItemChildrenQuery, ItemChildrenQuery } from '@/services/sitecore/searchTemplate.query';
import { GraphQLClient } from 'graphql-request';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gqlEndpoint, gqlApiKey, itemId, authoringEndpoint } = body;

    if (authoringEndpoint) {
      const contentQuery = ItemChildrenQuery.replace('[ITEMID]', itemId);
      let query = {
        query: contentQuery,
      };

      const response: any = await fetch(gqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + gqlApiKey,
        },
        body: JSON.stringify(query),
      });

      const jsonResults = await response.json();

      console.log(jsonResults);

      const results = jsonResults?.data?.item?.children?.nodes;

      return NextResponse.json({ children: results });
    } else {
      const contentQuery = EdgeItemChildrenQuery.replace('[ITEMID]', itemId);
      const graphQLClient = new GraphQLClient(gqlEndpoint);
      graphQLClient.setHeader('sc_apikey', gqlApiKey);

      const jsonResults: any = await graphQLClient.request(contentQuery);

      const results = jsonResults?.item?.children?.results?.map((item: any) => ({
        itemId: item.id,
        name: item.name,
        hasChildren: item.hasChildren,
      }));

      return NextResponse.json({ children: results });
    }
  } catch (error) {
    console.error('Error posting query:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
