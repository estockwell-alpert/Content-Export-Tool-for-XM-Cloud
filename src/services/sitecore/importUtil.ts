import { IField, ITemplateSchema, ITemplateSection } from '@/app/api/export/schema/route';
import { IInstance } from '@/models/IInstance';
import * as XLSX from 'xlsx';
import { RefreshApiKey } from './helpers';
import { postToAuthApi } from './postToAuthApi';
import {
  CreateQueryTemplate,
  CreateTemplateQuery,
  SectionFragment,
  TemplateFieldFragment,
  UpdateQueryTemplate,
} from './updateTemplate.query';

let errorHasBeenDisplayed = false;

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

  let requiredFields: IField[] = [];
  let requiredFieldIds: string[] = [];

  let templateSchemas: ITemplateSchema[] = [];
  let currentSchema: ITemplateSchema | null = null;
  let sectionName = '';
  let query = '';
  let templateNameIndex = -1;
  let templateParentIndex = -1;
  let baseTemplatesIndex = -1;
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
      // TODO: TEST TO SEE IF MISSING OPTIONAL COLUMN CAUSES ERROR

      let row = csvData[i];
      templateNameIndex = row.indexOf('Template');
      templateParentIndex = row.indexOf('Parent');
      baseTemplatesIndex = row.indexOf('Base Templates');
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
        if (loadingModal) {
          loadingModal.style.display = 'none';
        }
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
        baseTemplates: '',
        folder: '',
        sections: [],
        renderingParams: false,
      };

      // if row is not blank:
      if (row[templateNameIndex] && row[templateNameIndex] !== '') {
        currentSchema.templateName = row[templateNameIndex];
        currentSchema.templatePath = row[templateParentIndex];
        currentSchema.baseTemplates = row[baseTemplatesIndex];
      }
    }
    // check for section
    if (currentSchema && row[sectionNameIndex] && row[sectionNameIndex] !== '') {
      sectionName = row[sectionNameIndex];
    }
    // process field
    if (row[fieldNameIndex] && row[fieldNameIndex] !== '' && currentSchema) {
      if (sectionName === '') {
        // default section if no section is specified
        console.log('SECTION NAME MISSING, DEFAULTING TO "DATA"');
        sectionName = 'Data';
      }
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
          required: requiredIndex > -1 ? row[requiredIndex] : false,
          defaultValue: defaultValueIndex > -1 ? row[defaultValueIndex] : '',
          helpText: descriptionIndex > -1 ? row[descriptionIndex] : '',
          inheritedFrom: '',
          template: currentSchema.templateName,
          path: '',
          baseTemplates: '',
          section: sectionName,
        };
        section.fields.push(field);

        if (
          field.required &&
          ((typeof field.required === 'string' &&
            (field.required.toLowerCase() === 'true' || field.required?.toLowerCase() === 'yes')) ||
            typeof field.required === 'boolean' ||
            field.required.toString().toLowerCase() === '1')
        ) {
          requiredFields.push(field);
        }
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
    let query = CreateTemplateQuery.replace('[TEMPLATENAME]', template.templateName)
      .replace('[PARENTID]', template.templatePath)
      .replace('[BASETEMPLATES]', template.baseTemplates);

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
          .replace('[DESCRIPTION]', field.helpText ?? '')
          .replace('[SOURCE]', field.source ?? '')
          .replace('[SORTORDER]', ((f + 1) * 100).toString());
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

        // check for required fields
        let resultsTemplate = results.data.createItemTemplate.itemTemplate.name;
        let resultsFields = results.data.createItemTemplate.itemTemplate.ownFields.nodes;

        for (let n = 0; n < resultsFields.length; n++) {
          let resultField = resultsFields[n];
          let requiredField = requiredFields.filter(
            (field) => field.machineName === resultField.name && field.template === resultsTemplate
          );

          if (requiredField.length > 0) {
            requiredFieldIds.push(resultField.templateFieldId);
          }
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

  // required fields
  let fieldQueries = [];
  for (let r = 0; r < requiredFieldIds.length; r++) {
    let query = UpdateQueryTemplate;
    let requiredFieldId = requiredFieldIds[r];

    // basic data
    query = query.replace('pathFragment', requiredFieldId);
    query = query.replace('ItemName', '');
    query = query.replace('ItemTemplate', '');
    query = query.replace('languageFragment', '');

    let fieldFragments = `{ name: "Workflow", value: "{59D4EE10-627C-4FD3-A964-61A88B092CBC}" }`;

    query = query.replace('fieldsFragment', fieldFragments);

    const jsonQuery = {
      query: query,
    };

    console.log(jsonQuery);
    fieldQueries.push(jsonQuery);
  }

  let successfullFieldUpdates = 0;

  try {
    for (var i = 0; i < fieldQueries.length; i++) {
      const results = await postToAuthApi(gqlEndpoint, authToken, JSON.stringify(fieldQueries[i]));
      console.log('Results: ');
      console.log(results);

      if (results.errors) {
        for (var j = 0; j < results.errors.length; j++) {
          var error = results.errors[j];
          errors.push(error.message.replace(/[\r\n]+/gm, ' '));
        }
      } else {
        successfullFieldUpdates++;
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
