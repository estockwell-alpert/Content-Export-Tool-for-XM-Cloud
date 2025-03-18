import { gql } from 'graphql-request';

export const SearchQueryTemplate = gql`
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
