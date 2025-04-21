import { GetBaseTemplateIds } from '@/services/sitecore/apiUtil';
import { GetSchemaQuery } from '@/services/sitecore/createGqlQuery';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    let hasNext = true;
    let cursor = '';
    let calls = 0;

    let results: ITemplateSchema[] = [];

    console.log('SCHEMA API');

    const templateTemplateId = '{AB86861A-6030-46C5-B394-E8F99E8B87DB}';
    const fieldTemplateId = '{455A3E98-A627-4B40-8035-E683A0331AC7}';
    const fieldSectionTemplateId = '{E269FBB5-3750-427A-9149-7AA950B49301}';

    const body = await request.json();
    console.log(body);
    const { gqlEndpoint, gqlApiKey, startItem, templates, fields, authoringEndpoint } = body;

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

    console.log(JSON.stringify(templatesQuery));

    const jsonResults = await allTemplatesResponse.json();
    console.log(JSON.stringify(jsonResults));

    const templateResults = jsonResults?.data?.search?.results;

    console.log('Total templates: ' + templateResults?.length);

    for (var i = 0; i < templateResults.length; i++) {
      const template = templateResults[i]?.innerItem;
      if (!template) continue;

      console.log(i + ': ' + template.name + ' ' + template.itemId);

      let templateResult: ITemplateSchema = {
        templateName: template.name,
        templatePath: template.path,
        folder: template.parent?.name,
        sections: [],
      };

      let sections: ITemplateSection[] = [];

      let templateIds = [];
      templateIds.push(template.itemId);

      let baseTemplates = template.baseTemplate?.value
        ?.toLowerCase()
        .replaceAll('-', '')
        .replaceAll('{', '')
        .replaceAll('}', '')
        .split('|');

      for (var b = 0; b < baseTemplates.length; b++) {
        let baseTemplateIds = await GetBaseTemplateIds(baseTemplates[b], gqlEndpoint, gqlApiKey, 0);
        templateIds = templateIds.concat(baseTemplateIds);
      }

      console.log('All template IDs: ' + JSON.stringify(templateIds));

      for (var t = 0; t < templateIds.length; t++) {
        const templateId = templateIds[t];
        if (templateId === '') {
          console.log('Do not run empty query');
          continue;
        }
        console.log('Getting fields for ' + templateId);
        const allFieldsQuery = GetSchemaQuery(templateId, fieldTemplateId);
        let fieldsQuery = {
          query: allFieldsQuery,
        };

        const fieldsResponse: any = await fetch(gqlEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + gqlApiKey,
          },
          body: JSON.stringify(fieldsQuery),
        });

        const fieldResults = await fieldsResponse.json();

        const fieldsJson = fieldResults?.data?.search?.results;
        console.log(JSON.stringify(fieldsJson));

        for (var f = 0; f < fieldsJson.length; f++) {
          const field = fieldsJson[f].innerItem;

          console.log('');
          console.log('Field ' + f + ': ' + field.name);

          var sectionName = field?.parent?.name;
          const sectionIndex = sections.findIndex((x) => x.name === sectionName);
          let section: ITemplateSection;
          if (sectionIndex === -1) {
            section = {
              name: sectionName,
              fields: [],
            };
          } else {
            section = sections[sectionIndex];
          }

          let workflow = field.workflow?.value;
          let required = false;
          // field.workflow?.value?.contains('{59D4EE10-627C-4FD3-A964-61A88B092CBC}')
          if (workflow && workflow.toString().indexOf('{59D4EE10-627C-4FD3-A964-61A88B092CBC}') > -1) {
            required = true;
          }

          console.log('Current template: ' + templateId);

          // update section
          let fieldObj: IField = {
            template: '',
            path: '',
            section: sectionName,
            name: field.title?.value,
            machineName: field.name,
            fieldType: field.type?.value,
            required: required ? true : undefined,
            defaultValue: field.defaultValue?.value,
            helpText: field.helpText?.value,
            inheritedFrom: field.parent?.parent?.itemId !== template.itemId ? field.parent?.parent?.name : '',
          };

          if (section.fields.some((field) => field.name == fieldObj.name)) {
            console.log('SECTION ALREADY CONTAINS FIELD');
          } else {
            section.fields.push(fieldObj);
          }

          if (sectionIndex === -1) {
            sections.push(section);
          } else {
            sections[sectionIndex] = section;
          }
        }
      }

      templateResult.sections = sections;
      results.push(templateResult);
    }

    console.log(JSON.stringify(results));

    return NextResponse.json({ templates: results });
  } catch (error) {
    console.error('Error posting query:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

export interface IWorksheetSchema {
  sheetName: string;
  data: any[];
}

export interface ITemplateSchema {
  templateName: string;
  templatePath: string;
  folder: string;
  sections: ITemplateSection[];
}

export interface ITemplateSection {
  name: string;
  fields: IField[];
}

export interface IField {
  template: string;
  path: string;
  section: string;
  name: string;
  machineName: string;
  fieldType: string;
  required?: boolean;
  defaultValue: string;
  helpText: string;
  inheritedFrom?: string;
}
