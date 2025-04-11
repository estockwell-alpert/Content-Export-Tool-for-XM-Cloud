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
        }
      }
    }
  }
`;
