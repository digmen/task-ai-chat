<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
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
    console.error(e);
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
    const res: any = await request('/chat', {
      method: 'POST',
      body: { message: userText, chatId: chatId }
    });

    if (!chatId) {
      await router.push({ query: { chatId: res.chatId } });
      chatRefreshTrigger.value++; 
    }

    messages.value.push(res.aiMessage);
    scrollToBottom(true);
  } catch (e) {
    messages.value.push({ role: 'assistant', content: 'Ошибка сервера :(' });
    scrollToBottom(true);
  } finally {
    loading.value = false;
  }
};

const toggleMic = () => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return alert('Ваш браузер не поддерживает голосовой ввод. Попробуйте Chrome или Safari.');
  }

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
    
    if (input.value && !input.value.endsWith(' ')) {
      input.value += ' ' + transcript;
    } else {
      input.value += transcript;
    }
    
    isRecording.value = false;
  };

  recognition.onerror = (event: any) => {
    console.error('Ошибка Voice API:', event.error);
    isRecording.value = false;
  };
  
  recognition.onend = () => {
    isRecording.value = false;
  };
};
</script>

<template>
  <div class="flex flex-col h-[100dvh] bg-mantis-dark relative overflow-hidden">
    
    <div ref="chatContainer" class="flex-1 overflow-y-auto scroll-smooth relative scrollbar-hide min-h-0">
      
      <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-center p-4 md:p-8 opacity-50">
        <div class="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 md:mb-6">
          <Bot class="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <h2 class="text-xl md:text-2xl font-bold mb-2">Mantis AI Assistant</h2>
        <p class="text-sm md:text-base">Чем я могу помочь?</p>
      </div>

      <div v-else class="p-3 md:p-8 space-y-4 md:space-y-6 pb-4">
        <div 
          v-for="(msg, idx) in messages" 
          :key="idx" 
          :class="['flex gap-3 md:gap-4 max-w-4xl mx-auto animate-fade-in group', msg.role === 'user' ? 'justify-end' : 'justify-start']"
        >
          <div v-if="msg.role === 'assistant'" class="w-8 h-8 rounded-full bg-mantis-primary flex items-center justify-center shrink-0 mt-1">
            <Bot :size="16" class="text-white" />
          </div>

          <div 
            :class="[
              'max-w-[90%] md:max-w-[75%] rounded-2xl p-3 md:p-5 shadow-sm leading-relaxed min-w-0 break-words text-sm md:text-base',
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
          <div class="bg-transparent border border-white/10 p-4 rounded-2xl rounded-bl-sm flex gap-1 items-center h-12">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    </div>

    <div 
      :class="[
        'shrink-0 bg-mantis-dark px-2 md:px-4 pb-3 md:pb-6 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]',
        isExpanded ? 'h-[60vh] pt-4' : 'h-auto pt-2'
      ]"
    >
      <div class="max-w-3xl mx-auto h-full flex flex-col">
        
        <div class="flex-1 bg-mantis-input rounded-2xl md:rounded-[2rem] shadow-2xl transition-colors focus-within:border-white/30 border border-white/10 flex flex-col relative overflow-hidden">
          
          <button 
            @click="isExpanded = !isExpanded"
            class="absolute top-2 md:top-3 right-3 md:right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
            :title="isExpanded ? 'Свернуть' : 'Развернуть'"
          >
            <Minimize2 v-if="isExpanded" :size="18" />
            <Maximize2 v-else :size="18" />
          </button>

          <textarea 
            v-model="input" 
            @keydown.enter.exact.prevent="sendMessage"
            placeholder="Спроси о чем угодно..." 
            :class="[
              'w-full bg-transparent text-white placeholder-gray-400 pl-4 md:pl-6 pr-10 md:pr-12 py-3 md:py-4 resize-none focus:outline-none scrollbar-thumb-gray-600 scrollbar-track-transparent rounded-t-2xl md:rounded-t-[2rem] transition-all text-base',
              isExpanded ? 'h-full text-lg leading-relaxed' : 'min-h-[50px] md:min-h-[56px] max-h-48'
            ]"
            :rows="isExpanded ? 10 : 1"
            :style="!isExpanded ? 'field-sizing: content;' : ''"
          ></textarea>

          <div class="flex justify-between items-center px-3 md:px-4 pb-2 md:pb-3 pt-0 mt-auto shrink-0 bg-mantis-input">
            <div class="text-gray-500 text-xs px-2 hidden md:block"></div>

            <div class="flex items-center gap-2 ml-auto">
               <button 
                @click="toggleMic"
                :class="['p-2 md:p-2.5 rounded-full transition-colors flex items-center justify-center', isRecording ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-white/10 text-gray-400']"
                title="Голосовой ввод"
              >
                <Mic :size="20" />
              </button>

              <button 
                @click="sendMessage"
                :disabled="!input.trim() || loading"
                :class="[
                  'p-2 md:p-2.5 rounded-full transition-all flex items-center justify-center',
                  input.trim() && !loading ? 'bg-white text-black hover:bg-gray-200 shadow-lg scale-100' : 'bg-white/10 text-gray-500 cursor-not-allowed scale-95'
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