export interface ISettings {
  id: string;
  name: string;
  startItem?: string;
  templates?: string;
  fields?: string;
  languages?: string;
  schemaStartItem?: string;
  includeTemplate?: boolean;
  includeLang?: boolean;
  createdDate?: boolean;
  createdBy?: boolean;
  updatedDate?: boolean;
  updatedBy?: boolean;
}
