let authToken: string | null = null;
let tokenExpiry: number | null = null;

export const getBkashAuthToken = async () => {
  // Check if we have a valid token
  if (authToken && tokenExpiry && Date.now() < tokenExpiry) {
    return authToken;
  }

  try {
    // Log the credentials being used (without sensitive data)
    console.log('Attempting bKash authentication with:');
    console.log('Username:', process.env.BKASH_USERNAME ? 'Set' : 'Not set');
    console.log('Password:', process.env.BKASH_PASSWORD ? 'Set' : 'Not set');
    console.log('App Key:', process.env.BKASH_APP_KEY ? 'Set' : 'Not set');
    console.log(
      'App Secret:',
      process.env.BKASH_APP_SECRET ? 'Set' : 'Not set'
    );

    const response = await fetch(
      'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          username: process.env.BKASH_USERNAME || '',
          password: process.env.BKASH_PASSWORD || '',
        },
        body: JSON.stringify({
          app_key: process.env.BKASH_APP_KEY,
          app_secret: process.env.BKASH_APP_SECRET,
        }),
      }
    );

    const data = await response.json();

    if (data.statusCode === '0000') {
      authToken = data.id_token;
      // Set token expiry to 45 minutes (bKash tokens expire after 1 hour)
      tokenExpiry = Date.now() + 45 * 60 * 1000;
      return authToken;
    }

    console.error('bKash auth response:', data);
    throw new Error(
      `Failed to get bKash auth token: ${data.statusMessage || 'Unknown error'}`
    );
  } catch (error) {
    console.error('bKash auth error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

export const refreshBkashToken = async () => {
  authToken = null;
  tokenExpiry = null;
  return getBkashAuthToken();
};
