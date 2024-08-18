import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});
