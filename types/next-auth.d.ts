import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      phone?: string;
      profilePicture?: string;
      userId: string;
      status: string;
      customerType: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: string;
    phone?: string;
    profilePicture?: string;
    userId: string;
    status: string;
    customerType: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    profilePicture?: string;
    userId: string;
    status: string;
    customerType: string;
  }
}
