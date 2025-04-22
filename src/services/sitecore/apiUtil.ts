import { GetSchemaQuery } from './createGqlQuery';

const templateTemplateId = '{AB86861A-6030-46C5-B394-E8F99E8B87DB}';

export const GetBaseTemplateIds = async (
  startItem: string,
  gqlEndpoint: string,
  gqlApiKey: string,
  depth: number,
  existingTemplateIds?: string[]
): Promise<string[]> => {
  let results: string[] = [];

  if (depth > 5) {
    return results;
  }

  if (!startItem || startItem === '') {
    return [];
  }

  console.log('Getting base templates for ' + startItem);

  console.log('Depth: ' + depth.toString());

  // get all templates...
  const allTemplatesQuery = GetSchemaQuery(startItem, templateTemplateId);
  let templatesQuery = {
    query: allTemplatesQuery,
  };

  const allTemplatesResponse: any = await fetch(gqlEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + gqlApiKey,
    },
    body: JSON.stringify(templatesQuery),
  });

  const jsonResults = await allTemplatesResponse.json();

  const templateResults = jsonResults?.data?.search?.results;

  console.log(templateResults.length + ' results for ' + startItem);

  for (var i = 0; i < templateResults.length; i++) {
    const template = templateResults[i]?.innerItem;
    if (!template) continue;

    // abort if we're in the system templates
    if (template.path.startsWith('/sitecore/templates/System/') || template.name === 'Standard template') {
      console.log('Skipping ' + template.Name + ' ' + template.path);
      continue;
    }

    console.log('CURRENT TEMPLATE: ' + template.name + ' - ' + template.path);

    results.push(template.itemId);

    let baseTemplates = template.baseTemplate?.value
      ?.toLowerCase()
      .replaceAll('-', '')
      .replaceAll('{', '')
      .replaceAll('}', '')
      .split('|')
      .filter((x: string) => x && x !== '');

    if (baseTemplates.length > 0) {
      console.log(
        baseTemplates.length + ' base templates found on ' + template.name + ': ' + template.baseTemplate.value
      );
      results = results.concat(baseTemplates);

      for (var b = 0; b < baseTemplates.length; b++) {
        if (existingTemplateIds && existingTemplateIds.indexOf(baseTemplates[b])) {
          continue;
        }

        console.log('Get base templates for ' + baseTemplates[b] + '...');

        const baseresults = await GetBaseTemplateIds(baseTemplates[b], gqlEndpoint, gqlApiKey, depth++, results);
        results = results.concat(baseresults);
      }
    } else {
      console.log('No base templates on ' + template.name);
    }
  }

  console.log('Finished for ' + startItem);
  return results;
};
