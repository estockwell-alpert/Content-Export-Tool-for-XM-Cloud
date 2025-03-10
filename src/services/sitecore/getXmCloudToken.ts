interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export const getXmCloudToken = async (clientId: string, clientSecret: string): Promise<TokenResponse> => {
  try {
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId, clientSecret }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting XM Cloud token:', error);
    throw error;
  }
};
