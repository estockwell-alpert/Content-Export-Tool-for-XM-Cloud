export interface IInstance {
  id: string;
  name: string;
  graphQlEndpoint: string;
  apiToken?: string;
  clientId?: string;
  clientSecret?: string;
  instanceType: enumInstanceType;
  expiration?: string;
}

export enum enumInstanceType {
  xmc = 'XMC Authoring',
  xpauth = 'XP Authoring',
  auth = 'Authoring',
  gql = 'GQL',
}
