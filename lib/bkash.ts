import axios from 'axios';

let authToken: string | null = null;
let tokenExpiry: number | null = null;

export const getBkashAuthToken = async () => {
  // Check if we have a valid token
  if (authToken && tokenExpiry && Date.now() < tokenExpiry) {
    return authToken;
  }

  try {
    const response = await axios.post(
      'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant',
      {
        app_key: process.env.BKASH_APP_KEY,
        app_secret: process.env.BKASH_APP_SECRET,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          username: process.env.BKASH_USERNAME,
          password: process.env.BKASH_PASSWORD,
        },
      }
    );

    if (response.data.statusCode === '0000') {
      authToken = response.data.id_token;
      // Set token expiry to 45 minutes (bKash tokens expire after 1 hour)
      tokenExpiry = Date.now() + 45 * 60 * 1000;
      return authToken;
    }

    throw new Error('Failed to get bKash auth token');
  } catch (error) {
    console.error('bKash auth error:', error);
    throw error;
  }
};

export const refreshBkashToken = async () => {
  authToken = null;
  tokenExpiry = null;
  return getBkashAuthToken();
};
