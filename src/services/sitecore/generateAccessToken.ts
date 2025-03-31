export const getAccessToken = async (
  identityServerUrl: string,
  username: string,
  password: string,
  clientId: string,
  clientSecret: string
) => {
  const response = await fetch('/api/auth/xp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clientId, clientSecret, username, password, identityServerUrl }),
  });

  if (!response.ok) {
    throw new Error('Failed to get access token');
  }

  return response.json();
};
