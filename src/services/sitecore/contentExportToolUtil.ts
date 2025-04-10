import { enumInstanceType } from '@/models/IInstance';
import { GetSearchQuery } from './createGqlQuery';
import { postToAuthApi } from './postToAuthApi';
import { CreateQueryTemplate, UpdateQueryTemplate } from './updateTemplate.query';

export const GenerateContentExport = async (
  authoringEndpoint: boolean,
  gqlEndpoint?: string,
  gqlApiKey?: string,
  startItem?: string,
  templates?: string,
  fields?: string
) => {
  // show loading modal
  const loadingModal = document.getElementById('loading-modal');

  ///
  if (!gqlEndpoint || !gqlApiKey) {
    return;
  }

  if (loadingModal) {
    loadingModal.style.display = 'block';
  }

  const response = await fetch('/api/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ gqlEndpoint, gqlApiKey, startItem, templates, fields, authoringEndpoint }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const results = await response.json();

  let csvData = [];

  // first row of CSV
  const fieldStrings = fields?.split(',');
  let headerRow = 'Item Path,Name,ID,';
  if (fieldStrings) {
    for (var i = 0; i < fieldStrings.length; i++) {
      if (fieldStrings[i].trim() === '') {
        continue;
      }

      headerRow += fieldStrings[i].trim() + ',';
    }
  }
  csvData.push(headerRow);

  for (var i = 0; i < results.length; i++) {
    let result = results[i];

    if (authoringEndpoint) {
      result = result.innerItem;
    }

    if (!result) continue;

    console.log(i);
    console.log(result);
    if (typeof result === 'string' && result.indexOf('GqlApiError:Error') > -1) {
      alert('Something went wrong. Check the console for errors');
      if (loadingModal) {
        loadingModal.style.display = 'none';
      }
      return;
    }

    let resultRow = '';

    if (authoringEndpoint) {
      // parse differently for authoring API
      resultRow = result.path + ',' + result.name + ',' + result.itemId + ',';
    } else {
      resultRow = result.url.path + ',' + result.name + ',' + result.id + ',';
    }

    if (fieldStrings) {
      for (var j = 0; j < fieldStrings.length; j++) {
        const field = fieldStrings[j].trim();

        if (fieldStrings[j].trim() === '') {
          continue;
        }

        const fieldValue = result[field]?.value ?? 'n/a';

        let cleanFieldValue = fieldValue.replace(/[\n\r\t]/gm, '').replace(/"/g, '""');
        // double quote to escape commas
        if (cleanFieldValue.indexOf(',') > -1) {
          cleanFieldValue = '"' + cleanFieldValue + '"';
        }
        resultRow += (cleanFieldValue ?? 'n/a') + ',';
      }
    }

    console.log(resultRow);
    csvData.push(resultRow);
  }

  let csvString = '';
  for (let i = 0; i < csvData.length; i++) {
    csvString += csvData[i] + '\n';
  }

  const element = document.createElement('a');
  const file = new Blob([csvString], { type: 'text/csv' });
  element.href = URL.createObjectURL(file);
  element.download = 'ContentExport.csv';
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();

  if (loadingModal) {
    loadingModal.style.display = 'none';
  }

  alert('Done - check your downloads!');
};

export const GetSearchQueryResults = async (gqlEndpoint: string, gqlApiKey: string, query: string): Promise<any> => {
  console.log(query);
  fetch(gqlEndpoint, {
    method: 'POST',
    headers: new Headers({ sc_apikey: gqlApiKey, 'content-type': 'application/json' }),
    body: query,
  })
    .then((response) => response.json())
    .then((data) => {
      // parse data
      console.log('Results: ');
      const results = data.data.pageOne;
      console.log(results);
      return results;
    })
    .catch((error) => {
      console.log(error);
    });
};

export const GetContentExportResults = async (
  instanceType: enumInstanceType,
  gqlEndpoint?: string,
  gqlApiKey?: string,
  startItem?: string,
  templates?: string,
  fields?: string
): Promise<any | undefined> => {
  const query = GetSearchQuery(
    instanceType === enumInstanceType.auth,
    gqlEndpoint,
    gqlApiKey,
    startItem,
    templates,
    fields
  );

  console.log(query);

  if (!gqlEndpoint || !gqlApiKey) {
    return;
  }

  let headers = undefined;
  if (instanceType === enumInstanceType.auth) {
    headers = new Headers({ Authorization: 'Bearer ' + gqlApiKey, 'content-type': 'application/json' });
  } else {
    headers = new Headers({ sc_apikey: gqlApiKey, 'content-type': 'application/json' });
  }

  const result = await fetch(gqlEndpoint, {
    method: 'POST',
    headers: headers,
    body: query,
  });

  if (result.ok) {
    const data = await result.json();
    console.log('data', data);
    const results = data.data.pageOne.results;
    let csvData = [];

    // first row of CSV
    const fieldStrings = fields?.split(',');
    let headerRow = 'Item Path,Name,ID,';
    if (fieldStrings) {
      for (var i = 0; i < fieldStrings.length; i++) {
        headerRow += fieldStrings[i].trim() + ',';
      }
    }
    csvData.push(headerRow);

    for (var i = 0; i < results.length; i++) {
      const result = results[i];
      let resultRow = result.url.path + ',' + result.name + ',' + result.id + ',';

      if (fieldStrings) {
        for (var j = 0; j < fieldStrings.length; j++) {
          const field = fieldStrings[j].trim();
          const fieldValue = result[field]?.value;

          // Handle undefined or null field values
          let cleanFieldValue = '';
          if (fieldValue) {
            cleanFieldValue = fieldValue.replace(/[\n\r\t]/gm, '');
            // double quote to escape commas
            if (cleanFieldValue.indexOf(',') > -1) {
              cleanFieldValue = '"' + cleanFieldValue + '"';
            }
          }

          resultRow += (cleanFieldValue || 'n/a') + ',';
        }
      }

      csvData.push(resultRow);
    }

    return csvData;
  }
};

let errorHasBeenDisplayed = false;

export const PostMutationQuery = async (
  update: boolean,
  gqlEndpoint?: string,
  authToken?: string,
  csvData?: any[]
): Promise<string[]> => {
  errorHasBeenDisplayed = false;
  // show loading modal
  const loadingModal = document.getElementById('loading-modal');
  if (loadingModal) {
    loadingModal.style.display = 'block';
  }

  if (!gqlEndpoint || !authToken) {
    alert('Select an Instance with an Auth token');
    return [];
  }

  if (!csvData) {
    alert('No file data found');
    return [];
  }

  let queries = [];

  // iterate through requests
  for (var i = 0; i < csvData.length; i++) {
    let query = '';

    if (update) {
      query = UpdateQueryTemplate;
    } else {
      query = CreateQueryTemplate;
    }

    const row = csvData[i];
    // basic data
    query = query.replace('pathFragment', row['Item Path']);
    query = query.replace('ItemName', row['Name']);
    query = query.replace('ItemTemplate', row['Template']);

    if (!update && (!row['Item Path'] || !row['Name'] || !row['Template'])) {
      alert('Missing required columns. Please make sure your CSV includes columns for Item Path, Template, and Name');
      if (loadingModal) {
        loadingModal.style.display = 'none';
      }
      return [];
    }

    if (row['Language']) {
      const languageFragment = `language: "` + row['Language'] + `"`;
      query = query.replace('languageFragment', languageFragment);
    } else {
      query = query.replace('languageFragment', '');
    }

    let fieldFragments = '';
    for (var property in row) {
      if (
        property === 'Item Path' ||
        property === 'Template' ||
        property === 'ID' ||
        property === 'Name' ||
        property === 'Language' ||
        property === ''
      ) {
        continue;
      }

      const value = row[property];
      const fieldFragment =
        `
        { name: "` +
        property +
        `", value: "` +
        value.replace('"', '&quot;') +
        `" }`;

      fieldFragments += fieldFragment;
    }

    query = query.replace('fieldsFragment', fieldFragments);

    const jsonQuery = {
      query: query,
    };

    console.log(jsonQuery);
    queries.push(jsonQuery);
  }

  const errors: string[] = [];

  try {
    for (var i = 0; i < queries.length; i++) {
      const results = await postToAuthApi(gqlEndpoint, authToken, JSON.stringify(queries[i]));
      console.log('Results: ');
      console.log(results);

      if (results.errors) {
        for (var j = 0; j < results.errors.length; j++) {
          var error = results.errors[j];
          errors.push(error.message.replace(/[\r\n]+/gm, ' '));
        }
      }
    }
  } catch (error) {
    console.log(error);

    if (loadingModal) {
      loadingModal.style.display = 'none';
    }

    return [JSON.stringify(error)];
  }

  if (loadingModal) {
    loadingModal.style.display = 'none';
  }

  console.log('ERRORS: ');
  console.log(errors);
  return errors;
};

export const GenerateSchemaExport = async (
  authoringEndpoint: boolean,
  gqlEndpoint?: string,
  gqlApiKey?: string,
  startItem?: string
) => {
  // show loading modal
  const loadingModal = document.getElementById('loading-modal');

  ///
  if (!gqlEndpoint || !gqlApiKey) {
    return;
  }

  if (loadingModal) {
    loadingModal.style.display = 'block';
  }

  const response = await fetch('/api/export/schema', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ gqlEndpoint, gqlApiKey, startItem, authoringEndpoint }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const results: any[] = await response.json();
  results.sort(resultsSort);

  console.log(results);

  let csvData = [];

  // first row of CSV
  let headerRow = 'Path,Template,Section,Name,Machine Name,Field Type,Required,Default Value,Help Text';
  csvData.push(headerRow);

  for (var i = 0; i < results.length; i++) {
    let result = results[i]?.innerItem;

    if (!result) continue;

    if (typeof result === 'string' && result.indexOf('GqlApiError:Error') > -1) {
      alert('Something went wrong. Check the console for errors');
      if (loadingModal) {
        loadingModal.style.display = 'none';
      }
      return;
    }

    const path = result.path;
    const template = result.parent?.parent?.name;
    const section = result.parent?.name;
    const name = result.name;
    const displayName = result.title?.value;
    const fieldType = result.type?.value;
    const required = '';
    const helpText = result.helpText?.value;
    const defaultValue = result.defaultValue?.value;

    let resultRow = '';

    resultRow += path + ',';
    resultRow += CleanFieldValue(template) + ',';
    resultRow += CleanFieldValue(section) + ',';
    resultRow += CleanFieldValue(name) + ',';
    resultRow += CleanFieldValue(displayName) + ',';
    resultRow += CleanFieldValue(fieldType) + ',';
    resultRow += CleanFieldValue(required) + ',';
    resultRow += CleanFieldValue(defaultValue) + ',';
    resultRow += CleanFieldValue(helpText) + ',';

    console.log(resultRow);
    csvData.push(resultRow);
  }

  let csvString = '';
  for (let i = 0; i < csvData.length; i++) {
    csvString += csvData[i] + '\n';
  }

  const element = document.createElement('a');
  const file = new Blob([csvString], { type: 'text/csv' });
  element.href = URL.createObjectURL(file);
  element.download = 'SchemaExport.csv';
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();

  if (loadingModal) {
    loadingModal.style.display = 'none';
  }

  alert('Done - check your downloads!');
};

export const CleanFieldValue = (value: string): string => {
  try {
    if (!value || value == null) return '';
    let cleanFieldValue = value.replace(/[\n\r\t]/gm, '').replace(/"/g, '""');
    // double quote to escape commas
    if (cleanFieldValue.indexOf(',') > -1) {
      cleanFieldValue = '"' + cleanFieldValue + '"';
    }
    return cleanFieldValue;
  } catch (ex) {
    return '';
  }
};

function resultsSort(a: any, b: any) {
  var templateA = a.parent?.parent?.name;
  var templateB = b.parent?.parent?.name;
  var sectionA = a.parent?.name;
  var sectionB = b.parent?.name;
  if (templateA < templateB) {
    return -1;
  }
  if (templateA > templateB) {
    return 1;
  }
  if (sectionA < sectionB) {
    return -1;
  }
  if (sectionA > sectionB) {
    return 1;
  }
  return 0;
}
