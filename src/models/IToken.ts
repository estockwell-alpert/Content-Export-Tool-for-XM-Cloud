export interface IToken {
  id: string;
  name: string;
  type: enumTokenTypes;
  token: string;
}

export enum enumTokenTypes {
  OpenAI = 'openai',
}
