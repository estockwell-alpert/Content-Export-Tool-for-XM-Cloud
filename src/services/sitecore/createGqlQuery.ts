import {
  AuthoringLangFragment,
  AuthoringPathFragment,
  AuthoringSearchQueryTemplate,
  AuthoringTemplatesFragment,
  EdgeItemQueryTemplate,
  EdgeLangFragment,
  EdgeSearchQueryTemplate,
  SchemaQueryTemplate,
} from './searchTemplate.query';

export const GetSearchQuery = (
  authoringEndpoint: boolean,
  gqlEndpoint?: string,
  gqlApiKey?: string,
  startItems?: string,
  templates?: string,
  fields?: string,
  languages?: string,
  cursor?: string
): string => {
  if (!gqlEndpoint || !gqlApiKey) {
    return 'GQL Endpoint and API Key are required. Please see Configuration section';
  }

  if (authoringEndpoint) {
    return GetAuthoringApiQuery(startItems, templates, fields, languages, cursor);
  } else {
    return GetEdgeQuery(startItems, templates, fields, languages, cursor);
  }
};

export const GetEdgeItemQuery = (itemId: string, language: string): string => {
  let query = EdgeItemQueryTemplate.replace('[ID]', itemId).replace('[LANG]', language);
  return query;
};

// NOTE: Authoring Query only currently supports ONE path and template until I figure out how to do AND(OR)
export const GetAuthoringApiQuery = (
  startItems?: string,
  templates?: string,
  fields?: string,
  languages?: string,
  cursor?: string
): string => {
  let pathFragment = '';
  if (startItems) {
    const paths = startItems.split(',');
    for (var i = 0; i < paths.length; i++) {
      const path = paths[i].trim().toLowerCase().replaceAll('{', '').replaceAll('}', '').replaceAll('-', '');
      pathFragment += AuthoringPathFragment.replace('GUID', path);
    }
  }

  let templateFragment = '';
  if (templates) {
    const templateStrings = templates.split(',');
    for (var i = 0; i < templateStrings.length; i++) {
      const template = templateStrings[i]
        .trim()
        .toLowerCase()
        .replaceAll('{', '')
        .replaceAll('}', '')
        .replaceAll('-', '');
      templateFragment += AuthoringTemplatesFragment.replace('GUID', template);
    }
  }

  let langFragment = '';
  if (languages) {
    const langs = languages.split(',');
    for (var i = 0; i < langs.length; i++) {
      const lang = langs[i].trim().toLowerCase();
      langFragment += AuthoringLangFragment.replace('CODE', lang);
    }
  }

  let fieldsFragment = getFieldsFragment(fields);

  const query = AuthoringSearchQueryTemplate.replace('pathsFragment', pathFragment)
    .replace('templatesFragment', templateFragment)
    .replace('fieldsFragment', fieldsFragment)
    .replace('langFragment', langFragment)
    .replace('afterFragment', cursor ? 'after: "' + cursor + '"' : '');

  console.log(query);

  return query;
};

export const GetEdgeQuery = (
  startItems?: string,
  templates?: string,
  fields?: string,
  languages?: string,
  cursor?: string
): string => {
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

  let fieldsFragment = getFieldsFragment(fields);

  let langFragment = '';
  if (languages) {
    const langs = languages.split(',');
    for (var i = 0; i < langs.length; i++) {
      const lang = langs[i].trim().toLowerCase();
      langFragment += EdgeLangFragment.replace('CODE', lang);
    }
  }

  const query = EdgeSearchQueryTemplate.replace('pathsFragment', pathFragment)
    .replace('templatesFragment', templateFragment)
    .replace('fieldsFragment', fieldsFragment)
    .replace('langFragment', langFragment)
    .replace('afterFragment', cursor ? 'after: "' + cursor + '"' : '');

  return query;
};

export const getFieldsFragment = (fields?: string): string => {
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

      let fieldName = field.replaceAll(' ', '').replaceAll('__', '');

      fieldsFragment +=
        fieldName +
        `: field(name: "` +
        field +
        `") {
                value
            }
            `;
    }
  }
  return fieldsFragment;
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

export const GetSchemaQuery = (startItems?: string, templates?: string, fields?: string, cursor?: string): string => {
  let pathFragment = '';
  if (startItems) {
    const paths = startItems.split(',');
    for (var i = 0; i < paths.length; i++) {
      const path = paths[i].trim().toLowerCase().replaceAll('{', '').replaceAll('}', '').replaceAll('-', '');
      pathFragment += AuthoringPathFragment.replace('GUID', path);
    }
  }

  let templateFragment = '';
  if (templates) {
    const templateStrings = templates.split(',');
    for (var i = 0; i < templateStrings.length; i++) {
      const template = templateStrings[i]
        .trim()
        .toLowerCase()
        .replaceAll('{', '')
        .replaceAll('}', '')
        .replaceAll('-', '');
      templateFragment += AuthoringTemplatesFragment.replace('GUID', template);
    }
  }

  const query = SchemaQueryTemplate.replace('pathsFragment', pathFragment)
    .replace('templatesFragment', templateFragment)
    .replace('langFragment', 'en')
    .replace('afterFragment', cursor ? 'after: "' + cursor + '"' : '');

  return query;
};
