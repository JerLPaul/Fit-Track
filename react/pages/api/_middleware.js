import { NextResponse } from 'next/server';

export function middleware(req) {
  const res = NextResponse.next();
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );

  // Only allow GET, POST methods
  if (req.method === 'OPTIONS') {
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST');
    return new Response(null, { status: 200, headers: res.headers });
  }

  return res;
}