export const getAccessToken = async (
  identityServerUrl: string,
  username: string,
  password: string,
  clientId: string
) => {
  const params = new URLSearchParams({
    grant_type: 'password',
    username: `sitecore\\${username}`,
    password: password,
    client_id: clientId,
    scope: 'openid sitecore.profile sitecore.profile.api',
  });

  const response = await fetch(`${identityServerUrl}/connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to get access token');
  }

  return response.json();
};
