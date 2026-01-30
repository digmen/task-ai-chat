// export const useApi = () => {
//   const token = useCookie('auth_token');
//   const config = useRuntimeConfig();
  
//   const BASE_URL = 'http://45.131.186.75:5000/api';

//   const request = async (endpoint: string, options: any = {}) => {
//     const headers = {
//       'Content-Type': 'application/json',
//       ...options.headers,
//     };

//     if (token.value) {
//       headers['Authorization'] = `Bearer ${token.value}`;
//     }

//     try {
//       const response = await $fetch(`${BASE_URL}${endpoint}`, {
//         ...options,
//         headers,
//       });
//       return response;
//     } catch (error: any) {
//       if (error.response?.status === 401) {
//         token.value = null;
//         navigateTo('/login');
//       }
//       throw error;
//     }
//   };

//   return { request };
// };


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