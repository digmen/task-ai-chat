export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('auth_token');
  const publicPages = ['/login'];
  const isPublicPage = publicPages.includes(to.path);

  if (!token.value && !isPublicPage) {
    return navigateTo('/login');
  }

  if (token.value && isPublicPage) {
    return navigateTo('/');
  }
});