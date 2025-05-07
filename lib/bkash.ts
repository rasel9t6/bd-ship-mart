import { connectToDB } from './dbConnect';
import Order from '@/models/Order';

const BKASH_BASE_URL = process.env.BKASH_BASE_URL;

interface BkashConfig {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
}

interface BkashToken {
  token: string;
  expiresIn: number;
  tokenType: string;
  refreshToken: string;
  expiresAt: Date;
}

let bkashToken: BkashToken | null = null;

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Helper function to get bKash auth token
async function getBkashToken(): Promise<string> {
  if (bkashToken && new Date() < bkashToken.expiresAt) {
    return bkashToken.token;
  }

  const config: BkashConfig = {
    appKey: process.env.BKASH_APP_KEY!,
    appSecret: process.env.BKASH_APP_SECRET!,
    username: process.env.BKASH_USERNAME!,
    password: process.env.BKASH_PASSWORD!,
  };

  // Debug log to check environment variables
  console.log('bKash config check:', {
    hasAppKey: !!config.appKey,
    hasAppSecret: !!config.appSecret,
    hasUsername: !!config.username,
    hasPassword: !!config.password,
    // Add additional logging to check actual values (first few chars)
    appKeyPrefix: config.appKey
      ? config.appKey.substring(0, 5) + '...'
      : 'missing',
    usernamePrefix: config.username
      ? config.username.substring(0, 5) + '...'
      : 'missing',
    passwordLength: config.password
      ? `${config.password.length} chars`
      : 'missing',
  });

  // Validate required credentials
  const missingCredentials = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingCredentials.length > 0) {
    console.error('Missing bKash credentials:', missingCredentials);
    throw new Error(
      `Missing required bKash credentials: ${missingCredentials.join(', ')}`
    );
  }

  try {
    console.log(
      'Requesting bKash token with URL:',
      `${BKASH_BASE_URL}/token/grant`
    );

    // Ensure tokenized payment auth structure is correct
    const tokenRequestBody = {
      app_key: config.appKey,
      app_secret: config.appSecret,
      username: config.username,
      password: config.password,
    };

    // Log the structure (not the actual values)
    console.log('Token request structure:', Object.keys(tokenRequestBody));

    const response = await fetch(`${BKASH_BASE_URL}/token/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        username: config.username,
        password: config.password,
        'X-APP-Key': config.appKey,
      },
      body: JSON.stringify(tokenRequestBody),
    });

    // Log the raw response for debugging
    const rawResponse = await response.text();
    console.log('Raw bKash API response:', rawResponse);

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (e) {
      console.error('Failed to parse bKash response as JSON:', e);
      throw new Error('Invalid response format from bKash API');
    }

    console.log('bKash token response:', {
      status: response.status,
      ok: response.ok,
      hasToken: !!data.id_token,
    });

    if (!response.ok) {
      console.error('bKash token error:', data);
      throw new Error(data.message || 'Failed to get bKash token');
    }

    if (!data.id_token) {
      throw new Error('Invalid token response from bKash');
    }

    bkashToken = {
      token: data.id_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };

    return bkashToken.token;
  } catch (error) {
    console.error('Error getting bKash token:', error);
    throw error;
  }
}

// Create Payment
export async function createBkashPayment(paymentData: {
  amount: number;
  orderId: string;
  bkashNumber: string;
}) {
  try {
    const token = await getBkashToken();
    console.log('Creating bKash payment with token:', token);

    const response = await fetch(`${BKASH_BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
        'X-APP-Key': process.env.BKASH_APP_KEY!,
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference: paymentData.orderId,
        callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/bkash/callback`,
        amount: paymentData.amount,
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: paymentData.orderId,
        customerMsisdn: paymentData.bkashNumber,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('bKash payment creation error:', errorData);
      throw new Error(errorData.message || 'Failed to create bKash payment');
    }

    const data = await response.json();
    console.log('bKash payment response:', data);

    if (!data.paymentID || !data.bkashURL) {
      throw new Error('Invalid payment response from bKash');
    }

    return data;
  } catch (error) {
    console.error('Error creating bKash payment:', error);
    throw error;
  }
}

// Execute Payment
export async function executeBkashPayment(paymentId: string) {
  const token = await getBkashToken();

  const response = await fetch(`${BKASH_BASE_URL}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      'X-APP-Key': process.env.BKASH_APP_KEY!,
    },
    body: JSON.stringify({
      paymentID: paymentId,
    }),
  });

  return response.json();
}

// Query Payment Status
export async function queryBkashPayment(paymentId: string) {
  const token = await getBkashToken();

  const response = await fetch(`${BKASH_BASE_URL}/payment/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      'X-APP-Key': process.env.BKASH_APP_KEY!,
    },
    body: JSON.stringify({
      paymentID: paymentId,
    }),
  });

  return response.json();
}

// Refund Payment
export async function refundBkashPayment(refundData: {
  paymentId: string;
  amount: number;
  reason: string;
  orderId: string;
}) {
  const token = await getBkashToken();

  const response = await fetch(`${BKASH_BASE_URL}/payment/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      'X-APP-Key': process.env.BKASH_APP_KEY!,
    },
    body: JSON.stringify({
      paymentID: refundData.paymentId,
      amount: refundData.amount,
      reason: refundData.reason,
      trxID: refundData.orderId,
    }),
  });

  return response.json();
}

// Query Refund Status
export async function queryBkashRefund(refundId: string) {
  const token = await getBkashToken();

  const response = await fetch(`${BKASH_BASE_URL}/payment/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      'X-APP-Key': process.env.BKASH_APP_KEY!,
    },
    body: JSON.stringify({
      refundTrxID: refundId,
    }),
  });

  return response.json();
}

// Search Transaction
export async function searchBkashTransaction(trxId: string) {
  const token = await getBkashToken();

  const response = await fetch(`${BKASH_BASE_URL}/general/searchTransaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      'X-APP-Key': process.env.BKASH_APP_KEY!,
    },
    body: JSON.stringify({
      trxID: trxId,
    }),
  });

  return response.json();
}

// Helper function to update order payment status
export async function updateOrderPaymentStatus(
  orderId: string,
  paymentData: {
    paymentID: string;
    statusCode: string;
    statusMessage: string;
    bkashURL?: string;
    amount: {
      bdt: number;
      usd: number;
      cny: number;
    };
  },
  status: PaymentStatus
) {
  await connectToDB();
  const order = await Order.findOne({ orderId });
  if (!order) {
    throw new Error('Order not found');
  }

  order.paymentDetails.transactions.push({
    amount: paymentData.amount,
    transactionId: paymentData.paymentID,
    paymentDate: new Date(),
    notes: `Payment ${status} via bKash`,
    bkash: {
      paymentID: paymentData.paymentID,
      merchantInvoiceNumber: orderId,
      status: 'INITIATED',
      statusCode: paymentData.statusCode,
      statusMessage: paymentData.statusMessage,
      paymentExecuteTime: new Date(),
      currency: 'BDT',
      intent: 'sale',
      tokenizedCheckout: true,
    },
  });

  if (status === 'paid') {
    order.paymentDetails.status = 'paid';
  }

  await order.save();
}
