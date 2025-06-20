import { IField } from '@/app/api/export/schema/route';
import { enumInstanceType, IInstance } from '@/models/IInstance';
import { getXmCloudToken } from './getXmCloudToken';

export const getGuids = (value: string): string[] => {
  if (value.indexOf('|') > -1) {
    var parts = value.split('|');
    return parts;
  } else {
    return [value];
  }
};

export const validateMultiGuids = (value: string) => {
  let guids = getGuids(value);

  for (var i = 0; i < guids.length; i++) {
    if (!validateGuid(guids[i])) {
      return false;
    }
  }

  return true;
};

export const validateGuid = (value: string) => {
  const regex = /^\{?[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}\}?$/i;

  var values = value.split(',');
  for (var i = 0; i < values.length; i++) {
    var val = values[i].trim();

    if (!val || val === '') continue;

    if (!val.match(regex)) {
      console.log(val + ' is not a valid guid');
      return false;
    }
  }

  return true;
};

export const CleanFieldValue = (value: string): string => {
  try {
    if (!value || value == null) return '';
    let cleanFieldValue = value.replace(/[\n\r\t]/gm, '').replace(/"/g, '""');
    // double quote to escape commas
    if (cleanFieldValue.indexOf(',') > -1) {
      cleanFieldValue = '"' + cleanFieldValue + '"';
    }
    return cleanFieldValue;
  } catch (ex) {
    return '';
  }
};

export const RefreshApiKey = async (instance: IInstance): Promise<string> => {
  if (instance.instanceType === enumInstanceType.auth) {
    // automatically refresh instance
    const tokenResponse = await getXmCloudToken(instance.clientId ?? '', instance.clientSecret ?? '');
    if (tokenResponse.access_token) {
      console.log('Refreshed access token');
      return tokenResponse.access_token;
    } else {
      console.log(tokenResponse);
    }
  }

  return instance.apiToken ?? '';
};

export const MakePostRequest = async (
  gqlEndpoint: string,
  gqlApiKey: string,
  startItem: string,
  templates: string,
  fields: string,
  languages: string,
  authoringEndpoint: boolean,
  itemQuery: boolean
): Promise<any> => {
  const response = await fetch('/api/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gqlEndpoint,
      gqlApiKey,
      startItem,
      templates,
      fields,
      languages,
      authoringEndpoint,
      itemQuery,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const results = await response.json();

  return results;
};

export function templateSort(a: any, b: any) {
  if (a.templateName < b.templateName) {
    return -1;
  } else if (a.templateName > b.templateName) {
    return 1;
  } else {
    if (a.renderingParams && !b.renderingParams) {
      return 1;
    }
    if (b.renderingParams && !a.renderingParams) {
      return -1;
    }
    return 0;
  }
}

export function fieldsSort(a: IField, b: IField) {
  let sortOrderA = a.sortOrder ?? 0;
  let sortOrderB = b.sortOrder ?? 0;
  if (sortOrderA < sortOrderB) {
    return -1;
  }
  if (sortOrderA > sortOrderB) {
    return 1;
  }
  return 0;
}

export const convertStringToGuid = (id: string) => {
  return '{' + id.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5') + '}';
};

export const stripGuid = (id: string) => {
  return id.toLowerCase().replaceAll('-', '').replaceAll('{', '').replaceAll('}', '').trim();
};
