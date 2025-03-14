export const postToAuthApi = async (gqlEndpoint: string, authToken: string, jsonQuery: string): Promise<any> => {
  try {
    console.log(gqlEndpoint);
    console.log(authToken);
    console.log(jsonQuery);

    console.log('FETCH:');

    const response = await fetch('/api/authoring/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gqlEndpoint, jsonQuery, authToken }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(response);

    const results = await response.json();
    return results;
  } catch (error) {
    console.error('Error posting to authoring API:', error);
    throw error;
  }
};
