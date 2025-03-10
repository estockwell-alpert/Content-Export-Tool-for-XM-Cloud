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
