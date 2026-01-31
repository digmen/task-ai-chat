export const useApi = () => {
  const config = useRuntimeConfig(); 
  const token = useCookie('auth_token');

  const request = async <T>(endpoint: string, options: any = {}) => {
    const defaults = {
      baseURL: config.public.apiBase || '/api', 
      
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    };
    
    return $fetch<T>(endpoint, { ...defaults, ...options });
  };

  return { request };
};