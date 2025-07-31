import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Get the response text first
    const text = await res.text();
    
    try {
      // Try to parse as JSON to get structured error message
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = JSON.parse(text);
        const errorMessage = errorData.message || errorData.error || res.statusText;
        throw new Error(errorMessage);
      } else {
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }
    } catch (parseError) {
      // If JSON parsing fails, use the raw text
      throw new Error(`${res.status}: ${text || res.statusText}`);
    }
  }
}

export async function apiRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
  } = {}
): Promise<any> {
  const { method = 'GET', body } = options;
  
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // Check if response is JSON by content type
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  } else {
    // If not JSON, just return the text
    return await res.text();
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
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
