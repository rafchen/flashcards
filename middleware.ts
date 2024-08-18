import { clerkMiddleware } from '@clerk/nextjs/server';

const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  secretKey: process.env.CLERK_SECRET_KEY || '',
};

export default clerkMiddleware(clerkConfig);
