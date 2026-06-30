'use client';

import { Suspense } from 'react';
import Home from '../src/views/Home';
import { useSearchParams } from 'next/navigation';

function HomeContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'All';
  return <Home currentCategory={category} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-cyan-500">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
