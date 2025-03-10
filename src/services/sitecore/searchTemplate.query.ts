export const SearchQueryTemplate = `
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
