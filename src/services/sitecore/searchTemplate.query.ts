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
    search(query: { searchStatement: { criteria: [templatesFragment, pathsFragment] } }) {
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
