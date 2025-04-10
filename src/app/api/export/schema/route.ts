import { GetSchemaQuery } from '@/services/sitecore/createGqlQuery';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    let hasNext = true;
    let cursor = '';
    let calls = 0;

    const templateTemplateId = '{AB86861A-6030-46C5-B394-E8F99E8B87DB}';
    const fieldTemplateId = '{455A3E98-A627-4B40-8035-E683A0331AC7}';
    const fieldSectionTemplateId = '{E269FBB5-3750-427A-9149-7AA950B49301}';

    const body = await request.json();
    console.log(body);
    const { gqlEndpoint, gqlApiKey, startItem, templates, fields, authoringEndpoint } = body;

    // get all templates...
    const allFieldsQuery = GetSchemaQuery(startItem, fieldTemplateId);
    let jsonQuery = {
      query: allFieldsQuery,
    };

    console.log(allFieldsQuery);

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
  } catch (error) {
    console.error('Error posting query:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

export interface ITemplateSchema {
  templateName: string;
  section: string;
  name: string;
  machineName: string;
  fieldType: string;
  required: boolean;
  defaultValue: string;
}
