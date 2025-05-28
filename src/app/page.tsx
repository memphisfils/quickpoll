import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/create');
  // Fallback content is not strictly necessary due to redirect,
  // but good practice if redirect logic could fail or be conditional.
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <p>Redirecting to poll creation...</p>
    </div>
  );
}
