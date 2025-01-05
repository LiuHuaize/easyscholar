import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function Dashboard() {
  return (
    <div>
      <SignedIn>
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard!</p>
      </SignedIn>
      <SignedOut>
        <p>You need to sign in to access this page.</p>
        <SignInButton />
      </SignedOut>
    </div>
  );
} 