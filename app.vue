<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent; 
}

::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1); /* Полупрозрачный белый */
  border-radius: 10px; /* Круглые края */
  transition: background-color 0.2s;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

* {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}
</style>