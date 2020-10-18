<template>
    <div class="h-screen flex flex-col" style="overflow-x: hidden">
        <div id="app" class="flex flex-col items-center justify-center flex-1 bg-blue-100 main-container"
             v-swipeable="dragToRefresh" @swiped="refreshPage">
            <!-- EXAMPLE 1: SIMPLE -->
            <button id="ex-1" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    v-swipeable="firstExOptions" @swiped="swipedEvent('EX1')"> EX 1
            </button>
            <!-- EXAMPLE 1: END -->

            <!-- EXAMPLE 2: Reveal Actions -->
            <div class="w-1/2 ex2-container mt-5">
                <button id="ex-2" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                        v-swipeable="secondExOptions" @swiped="swipedEvent('EX2')"> EX 2
                </button>
                <div class="w-full example-actions h-full">
                    <button class="bg-blue-300 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-1/2 h-full"
                            > LEFT
                    </button>
                    <button class="bg-blue-300 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-1/2 h-full"
                            > RIGHT
                    </button>
                </div>
            </div>
            <!-- EXAMPLE 2: END -->

            <!-- EXAMPLE 3: Android notification example -->
            <transition name="third-example-transition">
                <div class="w-full ex3-container mt-5" :class="thirdExampleClasses">
                    <button id="ex-3" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                            v-swipeable="thirdExOptions" @swiped="swipedEvent('EX3')" @swiped-away="swipedAway"> EX 3
                    </button>
                    <div class="w-full example-actions h-full">
                        <button class="bg-blue-300 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-1/2 h-full"
                        > LEFT
                        </button>
                        <button class="bg-blue-300 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-1/2 h-full"
                        > RIGHT
                        </button>
                    </div>
                </div>
            </transition>
            <!-- EXAMPLE 3: END -->

        </div>

        <div id="REFRESH-ICON" class="refresh-icon flex flex-row items-center justify-center bg-blue-200">
            <svg style="width: 25px; height: 25px;" :class="{'spin': loading}" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sync"
                 role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="currentColor"
                      d="M440.65 12.57l4 82.77A247.16 247.16 0 0 0 255.83 8C134.73 8 33.91 94.92 12.29 209.82A12 12 0 0 0 24.09 224h49.05a12 12 0 0 0 11.67-9.26 175.91 175.91 0 0 1 317-56.94l-101.46-4.86a12 12 0 0 0-12.57 12v47.41a12 12 0 0 0 12 12H500a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12h-47.37a12 12 0 0 0-11.98 12.57zM255.83 432a175.61 175.61 0 0 1-146-77.8l101.8 4.87a12 12 0 0 0 12.57-12v-47.4a12 12 0 0 0-12-12H12a12 12 0 0 0-12 12V500a12 12 0 0 0 12 12h47.35a12 12 0 0 0 12-12.6l-4.15-82.57A247.17 247.17 0 0 0 255.83 504c121.11 0 221.93-86.92 243.55-201.82a12 12 0 0 0-11.8-14.18h-49.05a12 12 0 0 0-11.67 9.26A175.86 175.86 0 0 1 255.83 432z">
                </path>
            </svg>
            </div>
        <h1 class="flex flex-col items-center justify-center bg-blue-100">Version 1.1.1</h1>
        <input v-model="logs" type="text" placeholder="LOGS" readonly
               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-center
        leading-tight focus:outline-none focus:shadow-outline">
    </div>
</template>

<script>
  export default {
    name: 'App',
    data() {
      return {
        loading: false,
        logs: '',
        timeoutHandler: null,
        dragToRefresh: {
          swipeOutThreshold: 75, // drag by at least 75px to emit swipe event
          backTime: 2, // 2s of "going to 0 position animation"
          swipeTime: 1, // 1s of "going to swipeOutBy animation"
          type: 'vertical',
          swipeOut: false,
          allowedDirection: 'bottom', // can drag only to bottom
          swipeOutBy: '100px', // if the drag is greater than the swipeOutThreshold then move to 100px
          max: 100,
          debug: true,
        },
        firstExOptions: {
          type: 'horizontal',
          swipeOut: true,
          swipeOutBy: '200%',
          swipeOutThreshold: '100%',
          debug: true
        },
        secondExOptions: {
          type: 'horizontal',
          swipeOut: true,
          swipeOutBy: '50%',
          swipeOutThreshold: '25%',
          debug: true
        },
        thirdExOptions: {
          type: 'horizontal',
          swipeOut: true,
          swipeOutBy: '50%',
          swipeOutThreshold: '25%',
          debug: true,
          swipeAway: true,
          swipeAwayThreshold: '51%',
          swipeAwayBy: '100%',
        },
        hideThirdExample: false,
        thirdExampleDirection: 'left'
      }
    },
    methods: {
      swipedEvent(from) {
        this.log(from, 'SWIPED');
      },
      swipedAway(event) {
        this.log('EX3', 'SWIPED-AWAY');
        this.hideThirdExample = true;
        this.thirdExampleDirection = event.detail.direction;
      },
      refreshPage() {
        this.log('PAGE', 'SWIPED');
        this.loading = true;
        if (this.timeoutHandler) {
          clearTimeout(this.timeoutHandler);
        }
        this.timeoutHandler = setTimeout(() => {
          this.loading = false
        }, 5000);
      },
      log(from, type) {
        this.logs = `Got ${type} from ${from}`;
        this.$forceUpdate();
      }
    },
    computed: {
      thirdExampleClasses() {
        return {
          'hide-me': this.hideThirdExample,
          [this.thirdExampleDirection]: true
        }
      }
    }
  };
</script>
<style>

    @-webkit-keyframes spin {
        0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
        }
        100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
        }
    }

    @keyframes spin {
        0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
        }
        100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
        }
    }

    .spin {
        -webkit-animation: spin 2s infinite linear;
        animation: spin 2s infinite linear;
    }

    .main-container {
        z-index: 1;
    }
    .refresh-icon {
        z-index: -1;
        position: absolute;
        top: 0;
        width: 100%;
        height: 100px;
    }
    .example-actions {
        /*position: absolute;*/
        /*z-index: 2;*/
        /*height: 50px;*/
        /*width: 50%;*/

        height: 100%;
        position: absolute;
        z-index: 2;
        vertical-align: center;
        display: flex;
        align-items: center;
        top: 0;
    }
    #ex-2 {
        position: relative;
        z-index: 3;
        height: 50px;
    }
    .ex2-container {
        position: relative;
    }

    #ex-3 {
        position: relative;
        z-index: 3;
        height: 50px;
    }
    .ex3-container {
        position: relative;
    }

    button:focus {
        outline: none !important;
    }

    .hide-me{
        transition: 2s;

        opacity: 0;
    }
    .hide-me.right {
        transform: translateX(100vh);
    }
    .hide-me.left {
        transform: translateX(-100vh);
    }
</style>
