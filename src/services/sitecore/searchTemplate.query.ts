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
            url {
                path
            }
            fieldsFragment
        }
    }
}`;

export const AuthoringSearchQueryTemplate = gql`
  {
    search(query: { searchStatement: { criteria: [templatesFragment, pathsFragment] }, paging: { pageSize: 1000 } }) {
      results {
        innerItem {
          itemId
          path
          name
          template {
            name
            templateId
          }
          fieldsFragment
        }
      }
    }
  }
`;

export const AuthoringTemplatesFragment = gql`{ criteriaType: SEARCH, field: "_template", value: "GUID" }`;
export const AuthoringPathFragment = gql`{ criteriaType: SEARCH, field: "_path", value: "GUID" }`;

export const SchemaQueryTemplate = gql`
  {
    search(
      query: {
        searchStatement: {
          criteria: [templatesFragment, pathsFragment, { criteriaType: SEARCH, field: "_language", value: "en" }]
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
