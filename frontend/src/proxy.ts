import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const backend = process.env.BACKEND_URL || 'http://localhost:5000';
  const target = new URL(
    request.nextUrl.pathname + request.nextUrl.search,
    backend,
  );
  return NextResponse.rewrite(target);
}

export const config = {
  matcher: '/api/:path*',
};
