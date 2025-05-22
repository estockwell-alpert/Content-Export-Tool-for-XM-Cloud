import { IField, ITemplateSchema, IWorksheetSchema } from '@/app/api/export/schema/route';
import { enumInstanceType, IInstance } from '@/models/IInstance';
import * as XLSX from 'xlsx';
import { GetSearchQuery } from './createGqlQuery';
import {
  CleanFieldValue,
  fieldsSort,
  getGuids,
  MakePostRequest,
  RefreshApiKey,
  templateSort,
  validateMultiGuids,
} from './helpers';

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

export const GetItemChildren = async (instance: IInstance, itemId: string): Promise<any> => {
  const gqlEndpoint = instance.graphQlEndpoint;
  let gqlApiKey = instance.apiToken;
  const authoringEndpoint = instance.instanceType === enumInstanceType.auth;

  if (!gqlEndpoint || !gqlApiKey) {
    return;
  }

  if (authoringEndpoint) {
    gqlApiKey = await RefreshApiKey(instance);
  }

  const response = await fetch('/api/browse/content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ gqlEndpoint, gqlApiKey, itemId }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const results: any = await response.json();

  console.log(results);

  return results;
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

  templates = templates?.sort(templateSort);

  // CSV:
  //const csvString = ResultsToCsv(templates);
  // Excel:
  ResultsToXslx(templates);

  if (loadingModal) {
    loadingModal.style.display = 'none';
  }

  alert('Done - check your downloads!');
};

export const ResultsToCsv = (templates: ITemplateSchema[]): void => {
  let csvData = [];

  // first row of CSV
  let headerRow =
    'Template,Path,Base Templates,Section,Name,Machine Name,Field Type,Required,Source,Default Value,Help Text,Inherited From';
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
        resultRow += required + ',';
        resultRow += source + ',';
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

export const ResultsToXslx = (templates: ITemplateSchema[], fileName?: string, headers?: string[]) => {
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
      baseTemplates: template.baseTemplates,
      section: '',
      name: '',
      machineName: '',
      fieldType: '',
      required: undefined,
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
        baseTemplates: '',
        section: template.sections[j].name,
        name: '',
        machineName: '',
        fieldType: '',
        required: undefined,
        source: '',
        defaultValue: '',
        helpText: '',
        inheritedFrom: '',
      });

      const fields = template.sections[j].fields;
      const dataLines = fields?.sort(fieldsSort);
      const dataLinesClean = dataLines.map((x: IField) => {
        delete x.sortOrder;
        return x;
      });
      worksheet.data = worksheet.data.concat(dataLinesClean);
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

  const header = headers
    ? [headers]
    : [
        [
          'Template',
          'Path',
          'Base Templates',
          'Section',
          'Field Name',
          'Machine Name',
          'Field Type',
          'Required',
          'Source',
          'Default Value',
          'Help Text',
          'Inherited From',
        ],
      ];

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

export interface IContentNode {
  itemId: string;
  name: string;
  children: IContentNode[];
  hasChildren: boolean;
  template: {
    name: string;
  };
}
