type ApiQueryValue = string | number | boolean | null | undefined;
type ApiQuery = Record<string, ApiQueryValue>;

export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl || "/api/v1";

  return {
    get: <T>(path: string, query?: ApiQuery) =>
      $fetch<T>(path, {
        baseURL,
        credentials: "include",
        query,
      }),
    post: <T>(path: string, body?: unknown) =>
      $fetch<T>(path, {
        baseURL,
        credentials: "include",
        method: "POST",
        body,
      }),
    put: <T>(path: string, body?: unknown) =>
      $fetch<T>(path, {
        baseURL,
        credentials: "include",
        method: "PUT",
        body,
      }),
    del: <T>(path: string) =>
      $fetch<T>(path, {
        baseURL,
        credentials: "include",
        method: "DELETE",
      }),
  };
};
