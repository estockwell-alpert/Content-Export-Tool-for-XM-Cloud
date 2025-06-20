import { gql } from 'graphql-request';

export const EdgeSearchQueryTemplate = gql`
{
    pageOne: search(
        where: {
        AND: [
                {
                    OR: [
                        templatesFragment
                    ]
                }
                {
                    OR:[
                        pathsFragment
                    ]
                }
                {
                    OR:[
                        langFragment
                    ]
                }
            ]
        }
        first: 1000
        afterFragment
        ) {
        total
        pageInfo {
            endCursor
            hasNext
            }
        results {
            name
            id
            template {
              name
              id
            }
            language {
              name
            }
            url {
                path
            }
            fieldsFragment
        }
    }
}`;

export const EdgeItemQueryTemplate = gql`
  {
    item(path: "[ID]", language: "[LANG]") {
      name
    }
  }
`;

export const AuthoringSearchQueryTemplate = gql`
  {
    search(
      query: {
        searchStatement: {
          operator: MUST
          subStatements: {
            criteria: [pathsFragment]
            operator: MUST
            subStatements: {
              criteria: [templatesFragment]
              operator: MUST
              subStatements: { criteria: [langFragment], operator: MUST }
            }
          }
        }
        paging: { pageSize: 1000 }
      }
    ) {
      results {
        innerItem {
          itemId
          path
          name
          template {
            name
            templateId
          }
          language {
            name
          }
          fieldsFragment
        }
      }
    }
  }
`;

export const AuthoringTemplatesFragment = gql`{ criteriaType: SEARCH, field: "_template", value: "GUID" }`;
export const AuthoringPathFragment = gql`{ criteriaType: SEARCH, field: "_path", value: "GUID" }`;
export const AuthoringLangFragment = gql`{ criteriaType: SEARCH, field: "_language", value: "CODE" }`;
export const EdgeLangFragment = gql`{ name: "_language",  value: "CODE" },`;

export const SchemaQueryTemplate = gql`
  {
    search(
      query: {
        searchStatement: {
          criteria: [{ criteriaType: SEARCH, field: "_language", value: "langFragment", operator: MUST }]
          operator: MUST
          subStatements: {
            criteria: [pathsFragment]
            operator: MUST
            subStatements: { criteria: [templatesFragment], operator: MUST }
          }
        }
        paging: { pageSize: 10000 }
      }
    ) {
      results {
        innerItem {
          itemId
          path
          name
          parent {
            name
            itemId
            template {
              name
            }
            parent {
              name
              itemId
              template {
                name
              }
            }
          }
          workflow: field(name: "Workflow") {
            value
          }
          baseTemplate: field(name: "__Base template") {
            value
          }
          type: field(name: "Type") {
            value
          }
          title: field(name: "Title") {
            value
          }
          source: field(name: "Source") {
            value
          }
          helpText: field(name: "__Short description") {
            value
          }
          defaultValue: field(name: "Default value") {
            value
          }
          sortOrder: field(name: "__Sortorder") {
            value
          }
        }
      }
    }
  }
`;

export const FieldUpdateQuery = gql`
  mutation UpdateItem {
    updateItem(
      input: {
        path: "[TEMPLATEFIELDID]"
        fields: [{ name: "Workflow", value: "{59D4EE10-627C-4FD3-A964-61A88B092CBC}" }]
      }
    ) {
      item {
        name
        workflow: field(name: "Workflow") {
          value
        }
      }
    }
  }
`;

export const ItemChildrenQuery = gql`
  {
    item(where: { database: "master", itemId: "[ITEMID]" }) {
      itemId
      name
      path
      children {
        nodes {
          name
          itemId
          hasChildren
          template {
            name
          }
        }
      }
    }
  }
`;

export const EdgeItemChildrenQuery = gql`
  {
    item(path: "[ITEMID]", language: "en") {
      children {
        results {
          name
          id
          hasChildren
        }
      }
    }
  }
`;
