import { IField, ITemplateSchema, ITemplateSection, IWorksheetSchema } from '@/app/api/export/schema/route';
import { enumInstanceType, IInstance } from '@/models/IInstance';
import * as XLSX from 'xlsx';
import { GetSearchQuery } from './createGqlQuery';
import { getXmCloudToken } from './getXmCloudToken';
import { postToAuthApi } from './postToAuthApi';
import {
  CreateQueryTemplate,
  CreateTemplateQuery,
  SectionFragment,
  TemplateFieldFragment,
  UpdateQueryTemplate,
} from './updateTemplate.query';

export const GenerateContentExport = async (
  instance: IInstance,
  startItem?: string,
  templates?: string,
  fields?: string,
  languages?: string,
  includeTemplate?: boolean,
  includeLang?: boolean,
  convertGuids?: boolean
) => {
  // show loading modal
  const loadingModal = document.getElementById('loading-modal');

  const authoringEndpoint = instance.instanceType === enumInstanceType.auth;
  const gqlEndpoint = instance.graphQlEndpoint;
  let gqlApiKey = instance.apiToken;

  ///
  if (!gqlEndpoint || !gqlApiKey) {
    return;
  }

  includeLang = true; // since Auth export exports all languages by default, just always show the column. Check if Edge does all langs by default too

  if (authoringEndpoint) {
    gqlApiKey = await RefreshApiKey(instance);
  }

  if (loadingModal) {
    loadingModal.style.display = 'block';
  }

  const results = await MakePostRequest(
    gqlEndpoint,
    gqlApiKey,
    startItem ?? '',
    templates ?? '',
    fields ?? '',
    languages ?? '',
    authoringEndpoint,
    false
  );

  console.log(results);

  let csvData = [];

  // first row of CSV
  const fieldStrings = fields?.split(',');
  let headerRow = 'Item Path,Name,ID,';
  if (includeTemplate) {
    headerRow += 'Template,';
  }
  if (includeLang) {
    headerRow += 'Language,';
  }
  if (fieldStrings) {
    for (var i = 0; i < fieldStrings.length; i++) {
      if (fieldStrings[i].trim() === '') {
        continue;
      }

      headerRow += fieldStrings[i].trim() + ',';
    }
  }
  csvData.push(headerRow);

  let guidFieldDictionary: { [id: string]: [name: string] } = {};

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

    if (includeTemplate) {
      resultRow += result.template?.name + ',';
    }
    if (includeLang) {
      resultRow += result.language?.name + ',';
    }

    if (fieldStrings) {
      for (var j = 0; j < fieldStrings.length; j++) {
        const field = fieldStrings[j].trim().replaceAll(' ', '').replaceAll('__', '');

        if (fieldStrings[j].trim() === '') {
          continue;
        }

        let fieldValue = result[field]?.value ?? 'n/a';

        // check if field is guid/guids
        if (convertGuids && fieldValue !== '' && validateMultiGuids(fieldValue)) {
          console.log('Value is a guid; get the item name');

          let convertedValue = '';
          let guids = getGuids(fieldValue);
          for (var g = 0; g < guids.length; g++) {
            let guid = guids[g];
            if (g > 0) {
              convertedValue += '; ';
            }
            if (guidFieldDictionary[guid]) {
              convertedValue += guidFieldDictionary[guid];
            } else {
              const linkedItemResults = await MakePostRequest(
                gqlEndpoint,
                gqlApiKey,
                guid,
                '',
                '',
                result.language?.name ?? '',
                authoringEndpoint,
                !authoringEndpoint
              );

              let linkedItemResult = linkedItemResults;
              if (authoringEndpoint) {
                linkedItemResult = linkedItemResults[0]?.innerItem;
              }

              let itemName = linkedItemResult?.name;
              guidFieldDictionary[fieldValue] = itemName;

              convertedValue += itemName;
            }
          }
          fieldValue = convertedValue;
        }

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
};

export const getGuids = (value: string): string[] => {
  if (value.indexOf('|') > -1) {
    var parts = value.split('|');
    return parts;
  } else {
    return [value];
  }
};

export const validateMultiGuids = (value: string) => {
  let guids = getGuids(value);

  for (var i = 0; i < guids.length; i++) {
    if (!validateGuid(guids[i])) {
      return false;
    }
  }

  return true;
};

export const validateGuid = (value: string) => {
  const regex = /^\{?[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}\}?$/i;

  var values = value.split(',');
  for (var i = 0; i < values.length; i++) {
    var val = values[i].trim();

    if (!val || val === '') continue;

    if (!val.match(regex)) {
      console.log(val + ' is not a valid guid');
      return false;
    }
  }

  return true;
};

const MakePostRequest = async (
  gqlEndpoint: string,
  gqlApiKey: string,
  startItem: string,
  templates: string,
  fields: string,
  languages: string,
  authoringEndpoint: boolean,
  itemQuery: boolean
): Promise<any> => {
  const response = await fetch('/api/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gqlEndpoint,
      gqlApiKey,
      startItem,
      templates,
      fields,
      languages,
      authoringEndpoint,
      itemQuery,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const results = await response.json();

  return results;
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
  fields?: string,
  languages?: string
): Promise<any | undefined> => {
  const query = GetSearchQuery(
    instanceType === enumInstanceType.auth,
    gqlEndpoint,
    gqlApiKey,
    startItem,
    templates,
    fields,
    languages
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
  instance: IInstance,
  update: boolean,
  gqlEndpoint?: string,
  csvData?: any[]
): Promise<string[]> => {
  errorHasBeenDisplayed = false;
  // show loading modal
  const loadingModal = document.getElementById('loading-modal');
  if (loadingModal) {
    loadingModal.style.display = 'block';
  }

  const authToken = await RefreshApiKey(instance);

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
  let successfullQueries = 0;

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
      } else {
        successfullQueries++;
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
  let messages: string[] = [];

  if (successfullQueries > 0) {
    messages.push('Successfully created ' + successfullQueries + ' template(s)');
  }

  if (errors.length > 0) {
    messages.push(errors.length + ' error(s) occured:');
    messages = messages.concat(errors);
  }
  return errors;
};

export const GetTemplateSchema = async (instance: IInstance, startItem?: string): Promise<any> => {
  const gqlEndpoint = instance.graphQlEndpoint;
  let gqlApiKey = instance.apiToken;
  const authoringEndpoint = instance.instanceType === enumInstanceType.auth;

  if (!gqlEndpoint || !gqlApiKey) {
    return;
  }

  if (!startItem || startItem === '') {
    alert(
      'Enter a start item. If you really want every template in Sitecore, you can enter the ID of the Templates folder. This will take a long time.'
    );
    return;
  }

  console.log('Try refresh auth token:');
  if (authoringEndpoint) {
    gqlApiKey = await RefreshApiKey(instance);
  }
  console.log('Refreshed auth token: ' + gqlApiKey);

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

  const results: any = await response.json();

  console.log(results);
  const templates = results.templates;

  return templates;
};

export const GenerateSchemaExport = async (instance: IInstance, startItem?: string) => {
  const loadingModal = document.getElementById('loading-modal');

  if (loadingModal) {
    loadingModal.style.display = 'block';
  }

  let templates = await GetTemplateSchema(instance, startItem);

  templates = templates?.sort(compare);

  // CSV:
  //const csvString = ResultsToCsv(templates);
  // Excel:
  ResultsToXslx(templates);

  if (loadingModal) {
    loadingModal.style.display = 'none';
  }

  alert('Done - check your downloads!');
};

function compare(a: any, b: any) {
  if (a.templateName < b.templateName) {
    return -1;
  } else if (a.templateName > b.templateName) {
    return 1;
  } else {
    return 0;
  }
}

export const PostCreateTemplateQuery = async (instance: IInstance, file: File, csvData?: any[]): Promise<string[]> => {
  errorHasBeenDisplayed = false;
  // show loading modal
  const loadingModal = document.getElementById('loading-modal');
  if (loadingModal) {
    loadingModal.style.display = 'block';
  }

  const authToken = await RefreshApiKey(instance);
  const gqlEndpoint = instance.graphQlEndpoint;

  console.log('File type: ' + file.type);

  let queries = [];

  if (file.type === 'text/csv') {
    // don't need to do anything; our csv data is already parsed and passed in
  } else if (file.name.endsWith('.xlsx')) {
    console.log('Excel file');
    const fileData = await file.arrayBuffer();
    const workbook = XLSX.read(fileData);
    console.log(workbook);
    for (var i = 0; i < workbook.SheetNames.length; i++) {
      var sheet = workbook.Sheets[workbook.SheetNames[i]];
      const worksheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      console.log(worksheetData);
      if (!csvData) {
        csvData = worksheetData;
      } else {
        csvData = csvData.concat(worksheetData);
      }
    }
  }

  console.log('Full CSV Data:');
  console.log(csvData);

  if (!csvData) {
    return ['Failed to parse file'];
  }

  let templateSchemas: ITemplateSchema[] = [];
  let currentSchema: ITemplateSchema | null = null;
  let query = '';
  let templateNameIndex = -1;
  let templateParentIndex = -1;
  let sectionNameIndex = -1;
  let fieldNameIndex = -1;
  let machineNameIndex = -1;
  let fieldTypeIndex = -1;
  let sourceIndex = -1;
  let defaultValueIndex = -1;
  let descriptionIndex = -1;
  let requiredIndex = -1;
  // iterate through requests
  for (var i = 0; i < csvData.length; i++) {
    // header row
    if (i === 0) {
      // TEST TO SEE IF MISSING OPTIONAL COLUMN CAUSES ERROR

      let row = csvData[i];
      templateNameIndex = row.indexOf('Template');
      templateParentIndex = row.indexOf('Parent');
      sectionNameIndex = row.indexOf('Section');
      fieldNameIndex = row.indexOf('Field Name');
      machineNameIndex = row.indexOf('Machine Name');
      if (machineNameIndex === -1) {
        machineNameIndex = fieldNameIndex;
      }
      fieldTypeIndex = row.indexOf('Field Type');
      sourceIndex = row.indexOf('Source');
      defaultValueIndex = row.indexOf('Default Value');
      descriptionIndex = row.indexOf('Help Text');
      requiredIndex = row.indexOf('Required');

      if (templateNameIndex === -1 || templateParentIndex === -1 || fieldNameIndex === -1 || fieldTypeIndex === -1) {
        return ['Missing required fields'];
      }

      continue;
    }

    const row = csvData[i];

    // if row has Template Name or is empty, finish previous query and start new query
    if ((row[templateNameIndex] && row[templateNameIndex] !== '') || row.length === 0) {
      // finish up previous schema
      if (currentSchema && currentSchema.templateName !== '' && currentSchema.sections.length > 0) {
        templateSchemas.push(currentSchema);
      }

      // set up new schema
      currentSchema = {
        templateName: '',
        templatePath: '',
        folder: '',
        sections: [],
        renderingParams: false,
      };

      // if row is not blank:
      if (row[templateNameIndex] && row[templateNameIndex] !== '') {
        currentSchema.templateName = row[templateNameIndex];
        currentSchema.templatePath = row[templateParentIndex];
      }
    } else if (row[fieldNameIndex] && row[fieldNameIndex] !== '' && currentSchema) {
      // get section
      var sectionName = sectionNameIndex > -1 ? row[sectionNameIndex] : 'Data';
      const sectionIndex = currentSchema.sections.findIndex((x) => x.name === sectionName);
      let section: ITemplateSection;
      if (sectionIndex === -1) {
        section = {
          name: sectionName,
          fields: [],
        };
      } else {
        section = currentSchema.sections[sectionIndex];
      }

      if (section.fields.some((field) => field.name == row[fieldNameIndex])) {
        console.log('SECTION ALREADY CONTAINS FIELD');
      } else {
        const field: IField = {
          name: row[fieldNameIndex],
          machineName: row[machineNameIndex],
          fieldType: row[fieldTypeIndex],
          source: row[sourceIndex],
          defaultValue: defaultValueIndex > -1 ? row[defaultValueIndex] : '',
          helpText: descriptionIndex > -1 ? row[descriptionIndex] : '',
          required: requiredIndex > -1 ? row[requiredIndex] : false,
          inheritedFrom: '',
          template: '',
          path: '',
          section: sectionName,
        };
        section.fields.push(field);
      }

      if (sectionIndex === -1) {
        currentSchema.sections.push(section);
      } else {
        currentSchema.sections[sectionIndex] = section;
      }
    }
  }

  // add last template
  if (currentSchema && currentSchema.templateName !== '' && currentSchema.sections.length > 0) {
    templateSchemas.push(currentSchema);
  }

  // now that we have all our schema items, create our queries
  for (var i = 0; i < templateSchemas.length; i++) {
    const template = templateSchemas[i];
    let query = CreateTemplateQuery.replace('[TEMPLATENAME]', template.templateName).replace(
      '[PARENTID]',
      template.templatePath
    );

    let sectionsFragments = '';
    for (var s = 0; s < template.sections.length; s++) {
      const section = template.sections[s];
      const sectionFragment = SectionFragment.replace('[SECTIONNAME]', section.name);

      let fieldFragments = '';
      for (var f = 0; f < section.fields.length; f++) {
        const field = section.fields[f];
        fieldFragments += TemplateFieldFragment.replace('[FIELDNAME]', field.machineName ?? field.name)
          .replace('[FIELDTYPE]', field.fieldType)
          .replace('[TITLE]', field.name)
          .replace('[DEFAULT]', field.defaultValue ?? '')
          .replace('[DESCRIPTION]', field.helpText ?? '');
      }

      sectionsFragments += sectionFragment.replace('[FIELDFRAGMENTS]', fieldFragments);
    }

    query = query.replace('[SECTIONFRAGMENTS]', sectionsFragments);

    console.log(query);

    const jsonQuery = {
      query: query,
    };
    queries.push(jsonQuery);
  }

  console.log('All Queries:');
  console.log(queries);

  const errors: string[] = [];
  let successfullQueries = 0;

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
      } else {
        successfullQueries++;
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
  let messages: string[] = [];

  if (successfullQueries > 0) {
    messages.push('Successfully created ' + successfullQueries + ' templates');
  }

  if (errors.length > 0) {
    messages.push(errors.length + ' errors occured');
    messages = messages.concat(errors);
  }

  return messages;
};

export const RefreshApiKey = async (instance: IInstance): Promise<string> => {
  if (instance.instanceType === enumInstanceType.auth) {
    // automatically refresh instance
    const tokenResponse = await getXmCloudToken(instance.clientId ?? '', instance.clientSecret ?? '');
    if (tokenResponse.access_token) {
      console.log('Refreshed access token');
      return tokenResponse.access_token;
    } else {
      console.log(tokenResponse);
    }
  }

  return instance.apiToken ?? '';
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

export const ResultsToCsv = (templates: ITemplateSchema[]): void => {
  let csvData = [];

  // first row of CSV
  let headerRow =
    'Template,Path,Section,Name,Machine Name,Field Type,Source,Required,Default Value,Help Text,Inherited From';
  csvData.push(headerRow);

  for (var i = 0; i < templates.length; i++) {
    let template: ITemplateSchema = templates[i];

    if (template.sections.length === 0) continue;

    csvData.push(template.templateName + ',' + template.templatePath);

    for (var j = 0; j < template.sections.length; j++) {
      var section = template.sections[j];

      const sectionName = section.name;

      csvData.push(',,' + sectionName);

      for (var k = 0; k < section.fields.length; k++) {
        const field = section.fields[k];
        const name = field.name;
        const machineName = field.machineName;
        const fieldType = field.fieldType;
        const source = field.source;
        const required = field.required ? 'TRUE' : '';
        const helpText = field.helpText ?? '';
        const defaultValue = field.defaultValue ?? '';
        const inheritedFrom = field.inheritedFrom;

        let resultRow = '';

        resultRow += ',,,';
        resultRow += name + ',';
        resultRow += CleanFieldValue(machineName) + ',';
        resultRow += fieldType + ',';
        resultRow += source + ',';
        resultRow += required + ',';
        resultRow += CleanFieldValue(defaultValue) + ',';
        resultRow += CleanFieldValue(helpText) + ',';
        resultRow += inheritedFrom;

        console.log(resultRow);
        csvData.push(resultRow);
      }
    }
    csvData.push('');
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
};

export const ResultsToXslx = (templates: ITemplateSchema[], fileName?: string) => {
  // Create Excel workbook and worksheet
  const workbook = XLSX.utils.book_new();
  //const worksheet = XLSX.utils?.json_to_sheet(templates);
  //XLSX.utils.book_append_sheet(workbook, worksheet, 'Templates Schema');

  const worksheets: IWorksheetSchema[] = [];

  for (var i = 0; i < templates.length; i++) {
    const template = templates[i];
    const folder = templates[i].folder;

    if (template.sections.length == 0) continue;

    const worksheetIndex = worksheets.findIndex((x) => x.sheetName === folder);
    let worksheet: IWorksheetSchema;
    if (worksheetIndex === -1) {
      worksheet = {
        sheetName: folder,
        data: [],
      };
    } else {
      worksheet = worksheets[worksheetIndex];
    }

    const templateRow: IField = {
      template: template.templateName + (template.renderingParams ? ' (Rendering Parameters)' : ''),
      path: template.templatePath,
      section: '',
      name: '',
      machineName: '',
      fieldType: '',
      source: '',
      defaultValue: '',
      helpText: '',
      inheritedFrom: '',
    };

    worksheet.data.push(templateRow);

    for (var j = 0; j < template.sections.length; j++) {
      worksheet.data.push({
        template: '',
        path: '',
        section: template.sections[j].name,
        name: '',
        machineName: '',
        fieldType: '',
        source: '',
        defaultValue: '',
        helpText: '',
        inheritedFrom: '',
      });
      const dataLines = template.sections[j].fields;
      worksheet.data = worksheet.data.concat(dataLines);
    }

    // add empty line for spacing
    worksheet.data.push([]);

    console.log(worksheet.data);

    // udpate worksheets list
    if (worksheetIndex === -1) {
      worksheets.push(worksheet);
    } else {
      worksheets[worksheetIndex] = worksheet;
    }
  }

  const header = [
    ['Template', 'Path', 'Section', 'Field Name', 'Machine Name', 'Field Type', 'Default Value', 'Help Text'],
      'Source',
  ];

  if (!fileName || fileName?.indexOf('Import') === -1) {
    header[0] = header[0].concat(['Inherited From', 'Required']);
  } else {
    header[0] = header[0].concat([' ', ' ']);
  }

  if (worksheets.length === 0) {
    alert('No results found');
    return;
  }

  // add every worksheet to file
  for (var i = 0; i < worksheets.length; i++) {
    const worksheet = XLSX.utils?.json_to_sheet(worksheets[i].data);
    XLSX.utils.sheet_add_aoa(worksheet, header);
    XLSX.utils.book_append_sheet(workbook, worksheet, worksheets[i].sheetName);
  }

  // Save the workbook as an Excel file
  XLSX.writeFile(workbook, `${fileName ?? 'Templates Schema'}.xlsx`);
  console.log(`Exported data to xslx`);
};

export function resultsSort(a: any, b: any) {
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
