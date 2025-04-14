import { GetSearchQuery } from '@/services/sitecore/createGqlQuery';
import { GraphQLClient } from 'graphql-request';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    let hasNext = true;
    let results: any[] = [];
    let cursor = '';
    let calls = 0;

    const body = await request.json();
    console.log(body);
    const { gqlEndpoint, gqlApiKey, startItem, templates, fields, languages, authoringEndpoint } = body;

    // Authoring API
    if (authoringEndpoint) {
      const query = GetSearchQuery(
        authoringEndpoint,
        gqlEndpoint,
        gqlApiKey,
        startItem,
        templates,
        fields,
        languages,
        cursor
      );

      const jsonQuery = {
        query: query,
      };

      console.log('gqlEndpoint: ' + gqlEndpoint);
      console.log('authToken: ' + gqlApiKey);
      console.log(JSON.stringify(jsonQuery));

      // currently has no iteration
      const response: any = await fetch(gqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + gqlApiKey,
        },
        body: JSON.stringify(jsonQuery),
      });
      const results = await response.json();

      console.log(results);

      return NextResponse.json(results?.data?.search.results);
    }
    // Edge
    else {
      const graphQLClient = new GraphQLClient(gqlEndpoint);
      graphQLClient.setHeader('sc_apikey', gqlApiKey);

      while (hasNext && calls < 10) {
        try {
          const query = GetSearchQuery(
            authoringEndpoint,
            gqlEndpoint,
            gqlApiKey,
            startItem,
            templates,
            fields,
            languages,
            cursor
          );

          const data: any = await graphQLClient.request(query);

          console.log('DATA:');
          console.log(data);

          results = results.concat(data?.pageOne?.results);
          hasNext = data?.pageOne?.pageInfo?.hasNext;
          cursor = data?.pageOne?.pageInfo?.endCursor;
          hasNext = false;

          calls += 1;
        } catch (ex) {
          console.log(ex);
          results.push('GqlApiError:' + ex);
          hasNext = false; // don't keep retrying if there's something wrong with the call
        }
        calls += 1;
      }

      console.log('Completed GQL calls. Results:');
      console.log(results);

      return NextResponse.json(results);
    }
  } catch (error) {
    console.error('Error posting query:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
