'use client'; // For Next.js only. Remove this line in React Vite projects.

import { ClientSDK } from '@sitecore-marketplace-sdk/client';
import { XMC } from '@sitecore-marketplace-sdk/xmc';
import { useEffect, useRef, useState } from 'react';

const defaultHostURL = 'https://marketplace-app.sitecorecloud.io';
//const defaultHostURL = 'https://xmapps.sitecorecloud.io';
/* Host URL options:
- XM Cloud full page: https://xmapps.sitecorecloud.io
- XM Cloud page builder: https://pages.sitecorecloud.io
- Cloud Portal: https://marketplace-app.sitecorecloud.io
*/

export default function MarketplaceSDKComponent() {
  const [isClientSDKInitialized, setIsClientSDKInitialized] = useState(false);
  const [user, setUser] = useState({});
  const [applicationContext, setApplicationContext] = useState({});
  const [pagesContext, setPagesContext] = useState({});
  const [xmcCollections, setXmcCollections] = useState({});

  const clientRef = useRef<ClientSDK | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const origin = (queryParams.get('origin') as string) || defaultHostURL;

    // Initialize the Marketplace SDK:
    const init = async () => {
      try {
        const client = await ClientSDK.init({
          origin,
          target: window.parent,
          // Extend Client SDK with the `XMC` module:
          modules: [XMC],
        });
        clientRef.current = client;
        setIsClientSDKInitialized(true);
      } catch (error) {
        console.error('Client SDK initialization failed:', error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isClientSDKInitialized) {
      return () => {
        clientRef.current?.destroy();
        clientRef.current = null;
        setIsClientSDKInitialized(false);
      };
    }
  }, [isClientSDKInitialized]);

  // Get the details of the user currently logged in to Sitecore:
  const fetchUser = async () => {
    if (!clientRef.current) {
      console.error('SDK client not initialized. Cannot fetch user details.');
      setUser({}); // Reset or indicate error
      return;
    }
    try {
      const userResponse = await clientRef.current.query('host.user');
      if (userResponse?.data) {
        setUser(userResponse.data);
      } else {
        setUser({});
        console.warn('User data not found in response:', userResponse);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      setUser({}); // Reset user state on error
    }
  };

  // Get the application context
  const fetchApplicationContext = async () => {
    if (!clientRef.current) {
      console.error('SDK client not initialized. Cannot fetch application context.');
      setApplicationContext({}); // Reset or indicate error
      return;
    }
    try {
      const appContextResponse = await clientRef.current.query('application.context');
      if (appContextResponse?.data) {
        setApplicationContext(appContextResponse.data);
      } else {
        setApplicationContext({});
        console.warn('Application context data not found in response:', appContextResponse);
      }
    } catch (error) {
      console.error('Failed to fetch application context:', error);
      setApplicationContext({}); // Reset state on error
    }
  };

  // Specific to Pages integrations:
  const fetchPagesContext = async () => {
    if (!clientRef.current) {
      console.error('SDK client not initialized. Cannot fetch pages context.');
      setPagesContext({}); // Reset or indicate error
      return;
    }
    try {
      const pagesContextResponse = await clientRef.current.query('pages.context');
      if (pagesContextResponse?.data) {
        setPagesContext(pagesContextResponse.data);
      } else {
        setPagesContext({});
        console.warn('Pages context data not found in response:', pagesContextResponse);
      }
    } catch (error) {
      console.error('Failed to fetch pages context:', error);
      setPagesContext({}); // Reset state on error
    }
  };

  // Example of XMC request:
  const fetchXMCCollections = async () => {
    if (!clientRef.current) {
      console.error('SDK client not initialized. Cannot fetch XMC collections.');
      setXmcCollections({}); // Reset or indicate error
      return;
    }
    try {
      const collectionsResponse = await clientRef.current.query('xmc.xmapp.listCollections', {
        params: {
          query: {
            sitecoreContextId: '7z4YtqNaUMQ2a02oE2esS4',
          },
        },
      });
      console.log('XMC Collections response:', collectionsResponse);
      if (collectionsResponse?.data) {
        setXmcCollections(collectionsResponse.data);
      } else {
        setXmcCollections({});
        console.warn('XMC collections data not found in response:', collectionsResponse);
      }
    } catch (error) {
      console.error('Failed to fetch XMC collections:', error);
      setXmcCollections({}); // Reset state on error
    }
  };

  return (
    <>
      <div>
        <button onClick={fetchUser}>Get user details</button>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
      <div>
        <button onClick={fetchApplicationContext}>Fetch application context</button>
        <pre>{JSON.stringify(applicationContext, null, 2)}</pre>
      </div>
      <div>
        <button onClick={fetchPagesContext}>Fetch pages context</button>
        <pre>{JSON.stringify(pagesContext, null, 2)}</pre>
      </div>
      <div>
        <button onClick={fetchXMCCollections}>Fetch XMC collections</button>
        <pre>{JSON.stringify(xmcCollections, null, 2)}</pre>
      </div>
    </>
  );
}
