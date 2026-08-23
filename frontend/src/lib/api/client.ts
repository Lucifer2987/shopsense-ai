import { ApiResponse } from '@/types/api';

const CONFIGURED_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Resolve the base URL:
// - In the browser: relative path like "/api" works natively with fetch
// - During SSR (Node.js): relative paths don't work, so fall back directly to Flask
function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Browser — relative URL routes through Next.js proxy
    return CONFIGURED_URL;
  }
  // SSR — must use absolute URL; Next.js proxy isn't available server-side
  return process.env.BACKEND_URL
    ? `${process.env.BACKEND_URL}/api`
    : 'http://localhost:5000/api';
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = 'ERROR', status = 400) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${getApiBaseUrl().replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    let json: any = null;

    if (contentType.includes('application/json')) {
      json = await response.json();
    } else {
      const text = await response.text();
      try {
        json = JSON.parse(text);
      } catch {
        json = { message: text };
      }
    }

    if (!response.ok) {
      const errorMsg = json?.error?.message || json?.message || 'Request failed';
      const errorCode = json?.error?.code || 'API_ERROR';
      throw new ApiError(errorMsg, errorCode, response.status);
    }

    return json as ApiResponse<T>;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network errors or timeout
    throw new ApiError(
      err?.message || "Can't reach ShopSense right now. Check your connection.",
      'NETWORK_ERROR',
      0
    );
  }
}
