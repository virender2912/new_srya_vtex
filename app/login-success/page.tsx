'use client';

import { useSearchParams } from 'next/navigation';

export default function LoginSuccessPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');

  return (
    <div className="p-10">
      <h1 className="text-2xl">Welcome, {name}</h1>
      <p>Facebook login was successful.</p>
    </div>
  );
}
