import {AllowedDirection, ScrollDetectionEnum, SwipeableDirective, SwipeableDirectiveBinding, SwipeableParameters, SwipeType} from './types';
import {VNode}                                                                                                                from 'vue/types/vnode';

const DefaultParameters: SwipeableParameters = {
  swipeOutThreshold: '25%', // TODO: WON'T WORK
  backTime: .5,
  swipeTime: .5,
  type: 'horizontal',
  swipeOut: false,
  swipeOutBy: '50%',
  threshold: 5,
  allowedDirection: null,
  debug: false,
  max: null,
  swipeAway: false,
  swipeAwayBy: '1000%',
  swipeAwayThreshold: '55%',
};

const Swipeable: SwipeableDirective = {
  bind: async (el: HTMLElement, binding: SwipeableDirectiveBinding, vnode: VNode): Promise<void> => {
    await HasRendered(); // Ensures that bindings have been evaluated

    let detectedScroll: ScrollDetectionEnum = ScrollDetectionEnum.UNKNOWN;
    let swipedOut                           = false;
    let resetTimeout: number | null = null;
    let resetStartedAt: number;
    let resetAtPosition: Touch;
    const parameters                        = {...DefaultParameters, ...binding.value};

    const {
            swipeOutThreshold,
            backTime,
            swipeTime,
            type,
            swipeOut,
            swipeOutBy,
            threshold,
            allowedDirection,
            debug,
            max,
            swipeAway,
            swipeAwayBy,
            swipeAwayThreshold,
          } = parameters;

    const AllowedDirectionNumber = GetAllowedDirectionSign(<'top' | 'bottom' | 'left' | 'right' | null> allowedDirection);

    const SwipeOutThresholdPixels  = GetActualPixels(<string> swipeOutThreshold, el, <'horizontal' | 'vertical'> type);
    const SwipeOutByPixels         = GetActualPixels(<string> swipeOutBy, el, <'horizontal' | 'vertical'> type);
    const SwipeAwayThresholdPixels = GetActualPixels(<string> swipeAwayThreshold, el, <'horizontal' | 'vertical'> type);
    const SwipeAwayByPixels        = GetActualPixels(<string> swipeAwayBy, el, <'horizontal' | 'vertical'> type);
    let initialX                   = 0;
    let initialY                   = 0;


    function onResetCompletion() {
      resetTimeout = null;
    }

    el.addEventListener('touchstart', touchStartHandler, false);
    el.addEventListener('touchmove', touchMoveHandler, false);
    el.addEventListener('touchend', touchEndHandler, false);


    function touchStartHandler(e: any) {
      el.style.transition = '';

      if (type === 'vertical' && ((el.getBoundingClientRect().top - el.offsetTop) * AllowedDirectionNumber < 0)) {
        Log(<boolean> debug, el, '[TouchStart] Ignoring vertical scroll');
        return;
      }

      const touchObj = e.changedTouches[0];


      if (!swipedOut && resetTimeout === null) {
        initialX = touchObj.pageX;
        initialY = touchObj.pageY;
        Log(<boolean> debug, el, '[TouchStart] Registered', initialX, initialY);
      }
      else {
        Log(<boolean> debug, el, '[TouchStart]: Registered with SwipedOut element)');
      }

      if (resetTimeout !== null) {
        let resetDelta = Date.now() - resetStartedAt;
        let estimatedMovedBackBy;
        if (type == 'vertical') {
          let movedByBeforeReset = max ? Math.min(resetAtPosition.pageY - initialY, GetActualPixels(max, el, 'vertical')) : resetAtPosition.pageY - initialY;
          estimatedMovedBackBy = resetDelta * (movedByBeforeReset) / (<number>backTime * 1000);
          initialY = touchObj.pageY - (movedByBeforeReset - estimatedMovedBackBy);
          initialX = touchObj.pageX;
        }
        else {
          let movedByBeforeReset = max ? Math.min(resetAtPosition.pageX - initialX, GetActualPixels(max, el, 'horizontal')) : resetAtPosition.pageX - initialX;
          estimatedMovedBackBy = resetDelta * (movedByBeforeReset) / (<number>backTime * 1000);
          initialX = touchObj.pageX - (movedByBeforeReset - estimatedMovedBackBy);
          initialY = touchObj.pageY;
        }
        clearTimeout(resetTimeout);
        resetTimeout = null;
        touchMoveHandler(e);
      }
    };
    function touchMoveHandler(e: any) {


      /**
       * Avoids any movement if the draggable element is (?) TODO: Test
       */
      if (detectedScroll == ScrollDetectionEnum.UNKNOWN && type === 'vertical' && ((el.getBoundingClientRect().top - el.offsetTop) * AllowedDirectionNumber < 0)) {
        Log(<boolean> debug, el, '[TouchMove] Detected scroll');
        detectedScroll = ScrollDetectionEnum.DETECTED;
        return;
      }


      const touchObj = e.changedTouches[0];
      if (detectedScroll == ScrollDetectionEnum.DETECTED) {
        Log(<boolean> debug, el, '[TouchMove] Detected scroll');
        return;
      }
      if (
          ShouldSkip(<'horizontal' | 'vertical'> type, touchObj.pageY, initialY, touchObj.pageX, initialX, <number> threshold, <boolean> debug)
          && detectedScroll == ScrollDetectionEnum.UNKNOWN
      ) {
        detectedScroll = ScrollDetectionEnum.DETECTED; // Commented
        Log(<boolean> debug, el, '[TouchMove] Skipping');
        return;
      }

      let movedBy: number; // MovedBy is the amount of pixels the finger has been moved
      let newMoveBy: number; // NewMovedBy is the amount of pixels the element has been moved taking in consideration any limit (e.g: max parameter)

      if (type === 'horizontal') {
        movedBy = touchObj.pageX - initialX;
      }
      else {
        movedBy = touchObj.pageY - initialY;
      }


      /**
       * Flagging as a scroll if there was no movement in any allowed direction before
       */
      if (detectedScroll === ScrollDetectionEnum.UNKNOWN && AllowedDirectionNumber !== 0 && (AllowedDirectionNumber * movedBy) < 0) {
        Log(<boolean> debug, el, '[TouchMove] Flagging as scroll, skipping translation');
        detectedScroll = ScrollDetectionEnum.DETECTED;
        return;
      } // TODO: Describe
      detectedScroll = ScrollDetectionEnum.NOT_DETECTED; // TODO: CHECK

      Log(<boolean> debug, el, '[TouchMove] Stopping propagation and preventing default.');
      if (e.cancelable) {
        e.preventDefault();
      } // TODO: CHECK
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (swipeAway) {
        const maxMoveBy = GetActualPixels(<string> swipeAwayBy, el, <'horizontal' | 'vertical'> type);
        newMoveBy       = maxMoveBy < Math.abs(movedBy) ? maxMoveBy : Math.abs(movedBy);
      }
      else if (swipeOut) {
        const maxMoveBy = Math.max(
            SwipeOutByPixels,
            SwipeOutThresholdPixels,
            swipeAway ? SwipeAwayByPixels : 0,
        );
        newMoveBy       = maxMoveBy < Math.abs(movedBy) ? maxMoveBy : Math.abs(movedBy);
      }
      else if (max) {
        const maxMoveBy = GetActualPixels(max, el, <'horizontal' | 'vertical'> type);
        newMoveBy       = maxMoveBy < Math.abs(movedBy) ? maxMoveBy : Math.abs(movedBy);
      }
      else {
        newMoveBy = Math.abs(movedBy);
      }

      Log(<boolean> debug, el, '[TouchMove] Detected movement of (movedBy, clamped movedBy, initial', movedBy, newMoveBy, initialX, initialY);

      requestAnimationFrame(() => {
        Log(<boolean> debug, el, '[TouchMove] Translating element');
        if (type === 'horizontal') {
          /* Horizontal swipe on X */
          if (allowedDirection === 'right' && movedBy < 0) {
            return;
          }

          if (allowedDirection === 'left' && movedBy > 0) {
            return;
          }

          el.style.transform = `translate3d(${Math.sign(movedBy) * newMoveBy}px, 0, 0)`;
        }
        else {
          /* vertical swipe on Y */
          if (allowedDirection === 'bottom' && movedBy < 0) {
            return;
          }

          if (allowedDirection === 'top' && movedBy > 0) {
            return;
          }

          if (detectedScroll == ScrollDetectionEnum.UNKNOWN) {
            detectedScroll = ScrollDetectionEnum.NOT_DETECTED;
          }
          el.style.transform = `translate3d(0, ${Math.sign(movedBy) * newMoveBy}px, 0)`;
        }
      });
      return false;
    };
    function touchEndHandler(e: any) {
      const touchObj = e.changedTouches[0];
      if (detectedScroll == ScrollDetectionEnum.DETECTED) {
        Log(<boolean> debug, el, '[TouchEnd] Detected scroll');
        detectedScroll = ScrollDetectionEnum.UNKNOWN;
        return;
      }
      detectedScroll      = ScrollDetectionEnum.UNKNOWN;
      const offset        = Math.abs(type === 'horizontal' ? touchObj.pageX - initialX : touchObj.pageY - initialY);
      const hasSwipedOut  = offset >= SwipeOutThresholdPixels;
      const hasSwipedAway = offset >= SwipeAwayThresholdPixels;
      if (type === 'horizontal') {
        requestAnimationFrame(() => {
          if (swipeAway && hasSwipedAway) {
            HandleTransform(el, SwipeAwayByPixels, swipeTime, <number> backTime, type, touchObj.pageX - initialX > 0);
          }
          else if (swipeOut && hasSwipedOut) {
            HandleTransform(el, SwipeOutByPixels, swipeTime, <number> backTime, type, touchObj.pageX - initialX > 0);
          }
          else {
            resetStartedAt = Date.now();
            resetTimeout = Reset(el, <number> backTime, onResetCompletion);
            resetAtPosition = touchObj;
            swipedOut = false;
            Log(<boolean> debug, el, '[TouchEnd] Resetting Position');
          }

          if (hasSwipedAway || hasSwipedOut) {
            swipedOut   = true; // It's not actually needed for the swipeAway logic.
            const event = {direction: touchObj.pageX - initialX > 0 ? 'right' : 'left'};
            Emit(vnode, event, swipeAway && hasSwipedAway);
            Log(<boolean> debug, el, '[TouchEnd] Emitting Swipe');
          }
        });
      }
      else if (type === 'vertical') {
        requestAnimationFrame(() => {
          if (swipeAway && hasSwipedAway) {
            HandleTransform(el, SwipeAwayByPixels, swipeTime, <number> backTime, type, touchObj.pageY - initialY > 0);
          }
          if (swipeOut && hasSwipedOut) {
            HandleTransform(el, SwipeOutByPixels, swipeTime, <number> backTime, type, touchObj.pageY - initialY > 0);
            swipedOut = true;
          }
          else {
            resetStartedAt = Date.now();
            resetAtPosition = touchObj;
            resetTimeout = Reset(el, <number> backTime, onResetCompletion);
            swipedOut = false;
            Log(<boolean> debug, el, '[TouchEnd]: Resetting Position');
          }

          if (hasSwipedAway || hasSwipedOut) {
            const event = {direction: touchObj.pageY - initialY > 0 ? 'top' : 'bottom'};
            Emit(vnode, event, swipeAway && hasSwipedAway);
            Log(<boolean> debug, el, '[TouchEnd]: Emitting Swipe');
          }

        });
      }
    };

  },
};


/**
 * "Should skip" utility function (if the horizontal/vertical swipe is greater than the threshold
 * @param type type of swipe ('horizontal' or 'vertical')
 * @param pageY
 * @param initialY
 * @param pageX
 * @param initialX
 * @param threshold Minim amount of pixels of movement before a swipe is registered
 * @param debug
 * @returns {boolean} True if an actual swipe has not been registered
 */
function ShouldSkip(
    type: SwipeType,
    pageY: number,
    initialY: number,
    pageX: number,
    initialX: number,
    threshold: number,
    debug: boolean): boolean { // TODO: Fix madman indentation
  Log(debug, null,'[SkipCheck] Checking if the swipe should be skipped', {...arguments}); // TODO: remove useless debug line
  if (type === 'horizontal') {
    return Math.abs(pageX - initialX) < threshold;
  }
  else {
    return Math.abs(pageY - initialY) < threshold;
  }
}

/**
 * Get the amount of pixels of a given swipeOutBy value -> 5px becomes 5 while 50% in a 120px containers becomes 60
 * @param inputValue Accepted values are 1, 1% or 1px
 * @param element The dom element of the container
 * @param type Type of swipe ('horizontal' or 'vertical')
 * @returns {number} The actual number of pixels
 */
function GetActualPixels(inputValue: string, element: any, type: SwipeType): number {
  let actualValue: number;
  if (inputValue.includes != null) {
    if (inputValue.includes('%')) {
      if (type === 'horizontal') {
        actualValue = element.clientWidth * +inputValue.slice(0, -1) / 100; // TODO: check if float is needed
      }
      else {
        actualValue = element.clientHeight * +inputValue.slice(0, -1) / 100;
      }
    }
    else if (inputValue.includes('px')) {
      actualValue = +inputValue.slice(0, -2);
    }
    else {
      return +inputValue;
    }
  }
  else {
    return +inputValue;
  }

  return actualValue;
}

/**
 * Reset elements position because the user stopped swiping before the desired swipeOutThreshold or because it's not
 * swiping in the wanted direction
 * @param el Element
 * @param backTime Animation time for the transform 0
 * @param callback Function to call on reset completion (after BackTime)
 */
function Reset(el: HTMLElement, backTime: number, callback?: Function): number {
  el.style.transition = `transform ${backTime}s`;
  el.style.transform  = '';
  // requestAnimationFrame(() => {
  return setTimeout(() => {
    el.style.transition = '';
    if (callback && typeof callback === 'function') {
      callback();
    }
  }, backTime * 1000);
      // }
  // );
}

/**
 * Just a dumb shorthand for Logs;
 * @param debug
 * @param el Element used to retrieve ID
 * @param args
 * @constructor
 */
function Log(debug: boolean, el?: HTMLElement | null, ...args: any[]): void {
  if (debug) {
    console.trace(el && el.id ? `Element ID: ${el.id}` : 'Unknown element ID', args);
  }
}

/**
 * Emits the event using the proper method falling back to the dom's default CustomEvent when a componentInstance
 * on the vnode is not available
 * @param vnode
 * @param event
 * @param hasSwipedAway
 * @constructor
 */

function Emit(vnode: VNode, event: any, hasSwipedAway: boolean = false): void {
  const eventName = hasSwipedAway ? 'swiped-away' : 'swiped';
  // @ts-ignore // TODO: Fix
  vnode.context.$emit(eventName, event);
  if (vnode.componentInstance) {
    vnode.componentInstance.$emit(eventName, event); // use {detail:} to be uniform
  }
  else {
    // @ts-ignore // TODO: Fix
    vnode.elm.dispatchEvent(new CustomEvent(eventName, {detail: event}));
  }
}

function GetAllowedDirectionSign(direction: AllowedDirection): number {
  if (!direction) {
    return 0;
  }
  else if (direction === 'top' || direction === 'left') {
    return -1;
  }
  else {
    return 1;
  }
}

function HandleTransform(el: HTMLElement, targetPosition: number, swipeTime: number = .5, resetTime: number, type: SwipeType, sign: boolean) {
  const actualTargetPosition = (sign ? 1 : -1) * targetPosition;
  el.style.transition        = `all ${swipeTime}s`;
  if (type == 'horizontal') {
    el.style.transform = `translate3d(${actualTargetPosition}px, 0, 0)`;
  }
  else {
    el.style.transform = `translate3d(0, ${actualTargetPosition}px, 0)`;
  }
  requestAnimationFrame(() => {
    setTimeout(() => {
      el.style.transition = '';
    }, swipeTime * 1000);
  });
}

/**
 * Creates a promises that will be resolved after the first rendered frame
 * @constructor
 */
function HasRendered(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}

export default Swipeable;
