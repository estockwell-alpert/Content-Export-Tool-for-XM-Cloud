import { SearchQueryTemplate } from '@/services/sitecore/searchTemplate.query';

export const GetSearchQuery = (
  gqlEndpoint?: string,
  gqlApiKey?: string,
  startItems?: string,
  templates?: string,
  fields?: string
): string => {
  if (!gqlEndpoint || !gqlApiKey) {
    return 'GQL Endpoint and API Key are required. Please see Configuration section';
  }

  let pathFragment = '';
  if (startItems) {
    const paths = startItems.split(',');
    for (var i = 0; i < paths.length; i++) {
      const path = paths[i].trim();
      pathFragment +=
        `{
            name: "_path"
            value: "` +
        path +
        `"
            operator: CONTAINS
        }`;
    }
  }

  let templateFragment = '';
  if (templates) {
    const templateStrings = templates.split(',');
    for (var i = 0; i < templateStrings.length; i++) {
      const template = templateStrings[i].trim();
      templateFragment +=
        `{
            name: "_templates"
            value: "` +
        template +
        `"
            operator: CONTAINS
          }`;
    }
  }

  let fieldsFragment = '';
  if (fields) {
    var fieldStrings = fields.split(',');
    for (var i = 0; i < fieldStrings.length; i++) {
      const field = fieldStrings[i].trim();
      if (
        field.toLocaleLowerCase() === 'id' ||
        field.toLocaleLowerCase() === 'name' ||
        field.toLocaleLowerCase() === 'url' ||
        field.toLocaleLowerCase() === 'item name' ||
        field === ''
      ) {
        continue;
      }

      fieldsFragment +=
        field +
        `: field(name: "` +
        field +
        `") {
                value
            }
            `;
    }
  }

  const query = SearchQueryTemplate.replace('pathsFragment', pathFragment)
    .replace('templatesFragment', templateFragment)
    .replace('fieldsFragment', fieldsFragment);

  console.log(query);

  const jsonQuery = {
    query: query,
  };

  return JSON.stringify(jsonQuery);
};

export const GetAvailableFields = (templateNames: string): string[] => {
  let results = [];

  var templates = templateNames.split(',');
  for (var i = 0; i < templates.length; i++) {
    var query = GetTemplateSchemaQuery(templates[i].trim());

    // MAKE FETCH TO GET RESULTS, ADD TO LIST
    // for now, just push the query to the results, so we can see it
    results.push(query);
  }

  return results;
};

export const GetTemplateSchemaQuery = (template: string): string => {
  return (
    `query {
        __type(name:"` +
    template +
    `") {
            fields {
                name
                description
            }  
        }
    }`
  );
};
