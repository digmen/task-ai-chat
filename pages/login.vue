<script setup lang="ts">
definePageMeta({
  layout: false // Убираем сайдбар на странице входа
});

const { request } = useApi();
const token = useCookie('auth_token');
const router = useRouter();

const isLogin = ref(true); // Переключатель Вход/Регистрация
const form = reactive({ email: '', password: '' });
const error = ref('');
const loading = ref(false);

const submit = async () => {
  loading.value = true;
  error.value = '';
  try {
    const endpoint = isLogin.value ? '/auth/login' : '/auth/register';
    const data: any = await request(endpoint, {
      method: 'POST',
      body: form
    });
    
    token.value = data.token;
    router.push('/');
  } catch (e: any) {
    error.value = e.response?._data?.error || 'Ошибка входа';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-mantis-dark p-4 sm:p-6 transition-all">
    <div class="w-full max-w-md bg-mantis-sidebar p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/5 mx-auto">
      
      <h1 class="text-2xl sm:text-3xl font-bold text-center mb-2 text-white tracking-tight">
        Mantis Studio
      </h1>
      
      <p class="text-center text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
        {{ isLogin ? 'С возвращением!' : 'Создать аккаунт' }}
      </p>

      <form @submit.prevent="submit" class="space-y-4 sm:space-y-5">
        <div>
          <label class="block text-sm text-gray-400 mb-1.5 ml-1">Email</label>
          <input 
            v-model="form.email" 
            type="email" 
            class="w-full bg-mantis-input border border-white/10 rounded-xl p-3 sm:p-3.5 text-base text-white placeholder-gray-500 focus:outline-none focus:border-mantis-primary focus:ring-1 focus:ring-mantis-primary transition-all duration-200"
            placeholder="name@example.com"
            required
          />
        </div>
        
        <div>
          <label class="block text-sm text-gray-400 mb-1.5 ml-1">Пароль</label>
          <input 
            v-model="form.password" 
            type="password" 
            class="w-full bg-mantis-input border border-white/10 rounded-xl p-3 sm:p-3.5 text-base text-white placeholder-gray-500 focus:outline-none focus:border-mantis-primary focus:ring-1 focus:ring-mantis-primary transition-all duration-200"
            placeholder="••••••••"
            required
          />
        </div>

        <div v-if="error" class="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20 animate-pulse">
          {{ error }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-mantis-primary hover:bg-blue-600 active:scale-95 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:scale-100 flex justify-center items-center mt-2"
        >
          <span v-if="loading" class="animate-spin mr-2">⌛</span>
          <span v-else>{{ isLogin ? 'Войти' : 'Зарегистрироваться' }}</span>
        </button>
      </form>

      <div class="mt-6 sm:mt-8 text-center">
        <button 
          @click="isLogin = !isLogin"
          class="text-sm text-gray-400 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5"
        >
          {{ isLogin ? 'Нет аккаунта? Регистрация' : 'Уже есть аккаунт? Вход' }}
        </button>
      </div>
    </div>
  </div>
</template>