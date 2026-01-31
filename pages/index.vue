<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { Send, Mic, User, Bot, Maximize2, Minimize2 } from 'lucide-vue-next';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();
const { request } = useApi();
const route = useRoute();
const router = useRouter();

const messages = ref<any[]>([]);
const input = ref('');
const loading = ref(false);
const isRecording = ref(false);
const chatContainer = ref<HTMLElement | null>(null);
const isExpanded = ref(false);

const chatRefreshTrigger = useState<number>('chatRefresh');

const loadChat = async () => {
  const chatId = route.query.chatId;
  if (!chatId) {
    messages.value = [];
    return;
  }
  
  try {
    const data: any = await request(`/chat/${chatId}`);
    messages.value = data;
    scrollToBottom(false);
  } catch (e) {
    console.error('Ошибка загрузки чата:', e);
  }
};

watch(() => route.query.chatId, loadChat, { immediate: true });

const scrollToBottom = async (smooth = true) => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTo({
      top: chatContainer.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }
};

const sendMessage = async () => {
  if (!input.value.trim() || loading.value) return;

  if (isExpanded.value) isExpanded.value = false;

  const userText = input.value;
  input.value = '';
  loading.value = true;

  messages.value.push({ role: 'user', content: userText });
  scrollToBottom(true);

  try {
    const chatId = route.query.chatId;
    
    // 2. Отправляем на сервер
    const res: any = await request('/chat', {
      method: 'POST',
      body: { message: userText, chatId: chatId }
    });

    if (!chatId && res.chatId) {
      await router.push({ query: { chatId: res.chatId } });
      chatRefreshTrigger.value++; 
    }

    // 4. Добавляем ответ AI
    messages.value.push(res.aiMessage);
    scrollToBottom(true);

  } catch (e) {
    console.error(e);
    messages.value.push({ role: 'assistant', content: 'Ошибка сервера или соединения :(' });
    scrollToBottom(true);
  } finally {
    loading.value = false;
  }
};

const toggleMic = () => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return alert('Браузер не поддерживает Voice API');

  const recognition = new SpeechRecognition();
  recognition.lang = 'ru-RU';
  recognition.interimResults = false;
  
  if (isRecording.value) {
    recognition.stop();
    isRecording.value = false;
    return;
  }

  isRecording.value = true;
  recognition.start();

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    input.value = (input.value ? input.value + ' ' : '') + transcript;
    isRecording.value = false;
  };

  recognition.onerror = () => { isRecording.value = false; };
  recognition.onend = () => { isRecording.value = false; };
};
</script>

<template>
  <div class="flex flex-col h-full bg-mantis-dark relative overflow-hidden">
    
    <div ref="chatContainer" class="flex-1 overflow-y-auto scroll-smooth relative scrollbar-hide min-h-0 pt-16 md:pt-4">
      
      <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-center p-4 opacity-50">
        <Bot class="w-16 h-16 mb-4 text-white/20" />
        <h2 class="text-2xl font-bold mb-2">Mantis AI</h2>
        <p>Чем могу помочь?</p>
      </div>

      <div v-else class="p-3 md:p-8 space-y-6 pb-4">
        <div 
          v-for="(msg, idx) in messages" 
          :key="idx" 
          :class="['flex gap-3 md:gap-4 max-w-4xl mx-auto', msg.role === 'user' ? 'justify-end' : 'justify-start']"
        >
          <div v-if="msg.role === 'assistant'" class="w-8 h-8 rounded-full bg-mantis-primary flex items-center justify-center shrink-0 mt-1">
            <Bot :size="16" class="text-white" />
          </div>

          <div 
            :class="[
              'max-w-[85%] md:max-w-[75%] rounded-2xl p-3 md:p-5 shadow-sm leading-relaxed text-sm md:text-base',
              msg.role === 'user' 
                ? 'bg-mantis-input text-white rounded-br-sm' 
                : 'bg-transparent border border-white/10 text-gray-100 rounded-bl-sm'
            ]"
          >
            <div v-if="msg.role === 'assistant'" class="prose prose-invert prose-sm max-w-none break-words" v-html="md.render(msg.content)"></div>
            <div v-else class="whitespace-pre-wrap break-words">{{ msg.content }}</div>
          </div>

          <div v-if="msg.role === 'user'" class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center shrink-0 mt-1">
            <User :size="16" class="text-white" />
          </div>
        </div>

        <div v-if="loading" class="flex gap-4 max-w-4xl mx-auto">
           <div class="w-8 h-8 rounded-full bg-mantis-primary flex items-center justify-center shrink-0">
            <Bot :size="16" class="text-white" />
          </div>
          <div class="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-1 h-12 items-center">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    </div>

    <div 
      :class="[
        'shrink-0 bg-mantis-dark px-2 md:px-4 pb-3 md:pb-6 transition-all duration-300',
        isExpanded ? 'h-[50vh] pt-4' : 'h-auto pt-2'
      ]"
    >
      <div class="max-w-3xl mx-auto flex flex-col h-full">
        <div class="flex-1 bg-mantis-input rounded-2xl border border-white/10 flex flex-col relative focus-within:border-white/30 transition-colors">
          
          <button 
            @click="isExpanded = !isExpanded"
            class="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"
          >
            <Minimize2 v-if="isExpanded" :size="16" />
            <Maximize2 v-else :size="16" />
          </button>

          <textarea 
            v-model="input" 
            @keydown.enter.exact.prevent="sendMessage"
            placeholder="Спроси о чем угодно..." 
            :class="[
              'w-full bg-transparent text-white placeholder-gray-500 pl-4 pr-10 py-3 resize-none focus:outline-none scrollbar-hide text-base',
              isExpanded ? 'h-full' : 'max-h-32 min-h-[52px]'
            ]"
            :rows="isExpanded ? 10 : 1"
            style="field-sizing: content;"
          ></textarea>

          <div class="flex justify-between items-center px-2 pb-2 mt-auto">
            <div class="flex gap-2 ml-auto">
               <button 
                @click="toggleMic"
                :class="['p-2 rounded-full transition-colors', isRecording ? 'text-red-400 animate-pulse' : 'text-gray-400 hover:bg-white/10']"
              >
                <Mic :size="20" />
              </button>

              <button 
                @click="sendMessage"
                :disabled="!input.trim() || loading"
                :class="[
                  'p-2 rounded-xl transition-all',
                  input.trim() ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/10 text-gray-500'
                ]"
              >
                <Send :size="20" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>