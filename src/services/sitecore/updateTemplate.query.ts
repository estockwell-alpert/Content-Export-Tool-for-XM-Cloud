import { gql } from 'graphql-request';

export const UpdateQueryTemplate = `
mutation UpdateItem {
    updateItem(
        input: {
            path: "pathFragment"
            languageFragment
            fields: [
                fieldsFragment
            ]
            }
        )
        {
            item {
                name
            }
            }
        }`;

export const CreateQueryTemplate = `
mutation {
  createItem(
    input: {
      name: "ItemName"
      templateId: "ItemTemplate"
      parent: "pathFragment"
      languageFragment
      fields: [
        fieldsFragment
      ]
    }
  ) {
    item {
      itemId
      name
      path
      fields(ownFields: true, excludeStandardFields: true) {
        nodes {
          name
          value
        }
      }
    }
  }
}`;

export const CreateTemplateQuery = gql`
  mutation {
    createItemTemplate(
      input: {
        name: "[TEMPLATENAME]"
        parent: "[PARENTID]"
        baseTemplates: "[BASETEMPLATES]"
        sections: [[SECTIONFRAGMENTS]]
      }
    ) {
      itemTemplate {
        name
        ownFields {
          nodes {
            name
            type
            templateFieldId
          }
        }
      }
    }
  }
`;

export const SectionFragment = gql`{
        name: "[SECTIONNAME]"
        fields: [
          [FIELDFRAGMENTS]]
      }
  `;

export const TemplateFieldFragment = gql`{ name: "[FIELDNAME]", type: "[FIELDTYPE]", title: "[TITLE]", defaultValue:"[DEFAULT]", description:"[DESCRIPTION]", source:"[SOURCE]", sortOrder:[SORTORDER] }
`;
