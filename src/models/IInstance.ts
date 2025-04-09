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
  auth = 'Authoring',
  edge = 'Edge',
}
