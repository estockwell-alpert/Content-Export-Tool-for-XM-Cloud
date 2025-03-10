import { GraphQLClient } from 'graphql-request';

export const createGraphQLClient = (endpoint: string, apiKey: string) => {
  return new GraphQLClient(endpoint, {
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
  });
};

export default createGraphQLClient;
