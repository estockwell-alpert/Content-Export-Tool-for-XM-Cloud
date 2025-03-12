export const postToAuthApi = async (gqlEndpoint: string, authToken: string, jsonQuery: string): Promise<string> => {
  try {
    const response = await fetch(gqlEndpoint, {
      method: 'POST',
      headers: new Headers({ Authorization: 'Bearer ' + authToken, 'content-type': 'application/json' }),
      body: JSON.stringify(jsonQuery),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const results = await response.json();
    return JSON.stringify(results);
  } catch (error) {
    console.error('Error posting to authoring API:', error);
    throw error;
  }
};
