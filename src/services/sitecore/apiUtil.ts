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

    console.log('Current template is ' + template.name + ' - ' + template.itemId);
    // abort if we're in the system templates
    if (
      template.path.startsWith('/sitecore/templates/System/') ||
      template.name === 'Standard template' ||
      template.name === 'Standard Rendering Parameters' ||
      template.name === 'IDynamicPlaceholder'
    ) {
      console.log('Skipping ' + template.name + ' ' + template.path);
      continue;
    }

    results.push(template.itemId);

    console.log('Added ' + template.name + ' to list');

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

      for (var b = 0; b < baseTemplates.length; b++) {
        if (existingTemplateIds && existingTemplateIds.indexOf(baseTemplates[b])) {
          continue;
        }

        console.log('Get base templates for ' + baseTemplates[b] + '...');

        const baseresults = await GetBaseTemplateIds(baseTemplates[b], gqlEndpoint, gqlApiKey, depth++, results);

        console.log('Base Results: ' + JSON.stringify(baseresults));

        results = results.concat(baseresults);
      }
    } else {
      console.log('No base templates on ' + template.name);
    }
  }

  console.log('Finished for ' + startItem);
  console.log('Results: ' + JSON.stringify(results));
  return results;
};
