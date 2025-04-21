import { ITemplateSchema } from '@/app/api/export/schema/route';
import { GetSchemaQuery } from './createGqlQuery';

const templateTemplateId = '{AB86861A-6030-46C5-B394-E8F99E8B87DB}';

export const GetBaseTemplates = async (
  startItem: string,
  gqlEndpoint: string,
  gqlApiKey: string,
  isBaseTemplate?: boolean,
  templateSchemaIds?: string[]
): Promise<ITemplateSchema[]> => {
  console.log('Getting Templates starting at ' + startItem);

  // get all templates...
  if (!templateSchemaIds) {
    templateSchemaIds = [];
  }

  let templateSchemas: ITemplateSchema[] = [];

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

  for (var i = 0; i < templateResults.length; i++) {
    const template = templateResults[i]?.innerItem;
    if (!template) continue;

    console.log(i + ': ' + template.name + ' ' + template.itemId);

    let templateResult: ITemplateSchema = {
      templateName: template.name,
      id: template.itemId,
      isBaseTemplate: isBaseTemplate ?? false,
      templatePath: template.path,
      folder: template.parent?.name,
      sections: [],
    };

    templateSchemas.push(templateResult);
    templateSchemaIds?.push(templateResult.id);

    // if this is a system template, end recursion
    if (templateResult.templatePath.startsWith('/sitecore/templates/System/')) {
      console.log(template.name + ' is a system template, skipping base templates');
      return templateSchemas;
    }

    // need to get baseTemplate recursively
    let templateIds: string[] = [];
    const baseTemplates: string[] = template.baseTemplate?.value
      ?.toLowerCase()
      .replaceAll('-', '')
      .replaceAll('{', '')
      .replaceAll('}', '')
      .split('|')
      .filter((x: string) => x !== '00000000000000000000000000000000');
    templateIds = templateIds.concat(baseTemplates);

    console.log(templateIds.length + ' base templates for ' + template.name + ': ' + JSON.stringify(baseTemplates));

    for (let b = 0; b < baseTemplates.length; b++) {
      // skip if the base template has already been retrieved
      if (templateSchemaIds.indexOf(baseTemplates[b]) > -1) {
        console.log('Already got base template ' + baseTemplates[b]);
        continue;
      }

      const baseTemplateTemplates = await GetBaseTemplates(
        baseTemplates[b],
        gqlEndpoint,
        gqlApiKey,
        true,
        templateSchemaIds
      );
      templateSchemas = templateSchemas.concat(baseTemplateTemplates);
    }
  }
  console.log('All templates: ' + JSON.stringify(templateSchemas));

  return templateSchemas;
};
