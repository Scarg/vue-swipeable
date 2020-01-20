<template>
    <div id="app" class="flex flex-col items-center justify-center h-screen">
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                v-swipeable="directiveOptions" @swiped="swipedEvent"> TEST-BUTTON
        </button>
    </div>
</template>

<script>
  export default {
    name: 'App',
    data() {
      return {
        test: 'test',
        directiveOptions: {
          type: 'horizontal',
          swipeOut: true,
          swipeOutBy: '200px',
          swipeOutThreshold: '50px',
          debug: true
        }
      }
    },
    methods: {
      swipedEvent(event) {
        console.log('SWIPED:', event);
      },
    }
  };
</script>
