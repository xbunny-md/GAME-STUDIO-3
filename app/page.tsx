'use client';
export const dynamic = 'force-dynamic';

import Home from '../src/views/Home';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'All';
  return <Home currentCategory={category} />;
}
