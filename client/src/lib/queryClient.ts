import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Detect if we're running in WordPress environment
const isWordPress = typeof window !== 'undefined' && 
                    typeof (window as any).ucCalcSettings !== 'undefined';

// Get WordPress REST API URL and nonce if available
const wpApiUrl = isWordPress ? (window as any).ucCalcSettings.apiUrl : '';
const wpNonce = isWordPress ? (window as any).ucCalcSettings.nonce : '';

// Function to transform API paths for WordPress
function getApiUrl(path: string): string {
  // If WordPress environment and path starts with /api/
  if (isWordPress && path.startsWith('/api/')) {
    // Transform /api/calculate/uc-gpa to wp-json/uc-calculator/v1/calculate/uc-gpa
    return path.replace('/api/', wpApiUrl);
  }
  
  // Return original path for non-WordPress or non-API paths
  return path;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Transform URL for WordPress if needed
  const apiUrl = getApiUrl(url);
  
  // Prepare headers
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add WordPress authentication if in WordPress environment
  if (isWordPress) {
    headers["X-WP-Nonce"] = wpNonce;
  }

  const res = await fetch(apiUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Transform URL for WordPress if needed
    const apiUrl = getApiUrl(queryKey[0] as string);
    
    // Prepare headers
    const headers: Record<string, string> = {};
    
    // Add WordPress authentication if in WordPress environment
    if (isWordPress) {
      headers["X-WP-Nonce"] = wpNonce;
    }
    
    const res = await fetch(apiUrl, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
