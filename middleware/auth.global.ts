export default defineNuxtRouteMiddleware((to, from) => {
  // 1. Получаем токен из куки (он там живет, если мы залогинились)
  const token = useCookie('auth_token');

  // 2. Список публичных страниц (куда можно без пароля)
  // Если добавишь страницу регистрации, впиши её сюда: ['/login', '/register']
  const publicPages = ['/login'];
  
  // Проверяем, куда юзер пытается попасть
  const isPublicPage = publicPages.includes(to.path);

  // СЦЕНАРИЙ 1: Юзер НЕ залогинен (нет токена) и пытается попасть в Чат (не публичная)
  if (!token.value && !isPublicPage) {
    // Стоп! Разворачиваем на логин
    return navigateTo('/login');
  }

  // СЦЕНАРИЙ 2: Юзер УЖЕ залогинен (есть токен) и пытается открыть Логин
  if (token.value && isPublicPage) {
    // Зачем ему логиниться? Кидаем сразу в чат
    return navigateTo('/');
  }

  // Если всё ок — пропускаем
});