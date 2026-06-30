'use client';
export const dynamic = 'force-dynamic';

import Home from '../src/views/Home';

export default function Page() {
  // Using default category for now, ideally context
  return <Home currentCategory="All" />;
}
