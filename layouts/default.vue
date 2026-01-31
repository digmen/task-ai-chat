<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { LogOut, Plus, MessageSquare, PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next';

const { request } = useApi();
const token = useCookie('auth_token');
const router = useRouter();

const chats = ref<any[]>([]);
const isSidebarOpen = ref(true);
const isMobile = ref(false); 

const chatRefreshTrigger = useState<number>('chatRefresh', () => 0);

const fetchChats = async () => {
  if (!token.value) return;
  try {
    const data: any = await request('/chat');
    chats.value = data;
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  if (token.value) fetchChats();
  
  isMobile.value = window.innerWidth < 768;
  if (isMobile.value) {
    isSidebarOpen.value = false;
  }

  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768;
    if (!isMobile.value) isSidebarOpen.value = true;
  });
});

watch(chatRefreshTrigger, fetchChats);

const logout = () => {
  token.value = null;
  router.push('/login');
};

const createNewChat = () => {
  router.push('/');
  if (isMobile.value) isSidebarOpen.value = false;
};

const openChat = (id: number) => {
  if (isMobile.value) isSidebarOpen.value = false;
};
</script>

<template>
  <div class="flex h-[100dvh] w-full overflow-hidden bg-mantis-dark text-mantis-light font-sans relative">
    
    <div 
      v-if="isSidebarOpen && isMobile"
      @click="isSidebarOpen = false"
      class="absolute inset-0 bg-black/60 z-30 backdrop-blur-sm transition-opacity"
    ></div>

    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-40 w-72 bg-mantis-sidebar flex flex-col border-r border-white/10 transition-transform duration-300 ease-in-out shadow-2xl',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        isMobile ? 'shadow-2xl' : '' // Тень только на мобилке или всегда
      ]"
    >
      <div class="p-4 flex items-center justify-between shrink-0">
        <h2 class="font-bold text-xl text-white tracking-tight px-2">Mantis AI</h2>
        <button @click="isSidebarOpen = false" class="md:hidden p-2 hover:bg-white/10 rounded-lg text-gray-400">
          <PanelLeftClose :size="20" />
        </button>
      </div>

      <div class="px-4 pb-4 shrink-0">
        <button 
          @click="createNewChat"
          class="w-full flex items-center justify-center gap-2 bg-mantis-primary hover:bg-blue-600 active:scale-95 text-white p-3.5 rounded-xl transition-all shadow-lg"
        >
          <Plus :size="20" /> 
          <span class="font-medium">Новый чат</span>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-hide min-h-0">
        <NuxtLink 
          v-for="chat in chats" 
          :key="chat.id"
          :to="`/?chatId=${chat.id}`"
          @click="openChat(chat.id)"
          class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer text-sm text-gray-400 hover:text-white border border-transparent"
          active-class="bg-white/10 text-white border-white/10 shadow-sm"
        >
          <MessageSquare :size="18" class="shrink-0 opacity-70" />
          <span class="truncate font-medium">{{ chat.title }}</span>
        </NuxtLink>
      </div>

      <div class="p-4 border-t border-white/10 bg-mantis-sidebar shrink-0">
        <button 
          @click="logout"
          class="flex items-center gap-3 text-gray-400 hover:text-red-400 transition-colors w-full p-3 hover:bg-red-500/10 rounded-xl"
        >
          <LogOut :size="18" />
          <span class="font-medium">Выйти</span>
        </button>
      </div>
    </aside>

    <main 
      :class="[
        'flex-1 relative flex flex-col h-full w-full transition-all duration-300 ease-in-out overflow-hidden',
        (isSidebarOpen && !isMobile) ? 'md:ml-72' : 'ml-0'
      ]"
    >
      <div class="absolute top-4 left-4 z-20">
        <button 
          v-if="!isSidebarOpen"
          @click="isSidebarOpen = true"
          class="p-2.5 bg-mantis-input border border-white/10 text-white rounded-xl shadow-lg hover:bg-white/10 transition-all active:scale-95"
        >
          <PanelLeftOpen :size="20" />
        </button>
      </div>

      <slot />
    </main>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>