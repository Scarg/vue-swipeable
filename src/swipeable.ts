import {DraggableParameters, SwipeableDirective, AllowedDirection, SwipeType} from './types';

const DefaultParameters: DraggableParameters = {
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
  bind: async (el: any, binding: { value: DraggableParameters }, vnode: any) : Promise<void> => {
    await HasRendered(); // Ensures that bindings have been evaluated
    let detectedScroll: boolean | null = false;
    let swipedOut                      = false;

    const parameters = {...DefaultParameters, ...binding.value};

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

    const AllowedDirectionNumber = GetAllowedDirectionSign(allowedDirection);

    const SwipeOutThresholdPixels  = GetActualPixels(swipeOutThreshold, el, type);
    const SwipeOutByPixels         = GetActualPixels(swipeOutBy, el, type);
    const SwipeAwayThresholdPixels = GetActualPixels(swipeAwayThreshold, el, type);
    const SwipeAwayByPixels        = GetActualPixels(swipeAwayBy, el, type);
    let initialX                   = 0;
    let initialY                   = 0;

    el.addEventListener('touchstart', (e: any) => {
      el.style.transition = '';

      if (type === 'vertical' && ((el.getBoundingClientRect().top - el.offsetTop) * AllowedDirectionNumber < 0)) {
        return;
      }

      const touchObj      = e.changedTouches[0];
      if (!swipedOut) {
        initialX = touchObj.pageX;
        initialY = touchObj.pageY;
        Log(debug, 'START: starting', initialX, initialY);
      }
      else {
        Log(debug, 'START: starting (ALREADY OPEN)');
      }
    }, false);


    el.addEventListener('touchmove', (e: any) => {


      /**
       * Avoids any movement if the draggable element is (?) TODO: Test
       */
      if (detectedScroll === null && type === 'vertical' && ((el.getBoundingClientRect().top - el.offsetTop) * AllowedDirectionNumber < 0)) {
        detectedScroll = true;
        return;
      }


      const touchObj = e.changedTouches[0];
      if (detectedScroll) {
        Log(debug, 'MOVE: detectedScroll');
        return;
      }
      if (
          ShouldSkip(type, touchObj.pageY, initialY, touchObj.pageX, initialX, threshold, debug)
          && detectedScroll == null
      ) {
        // detectedScroll = true;
        Log(debug, 'MOVE: shouldSkip');
        return;
      }

      let movedBy: number; // TODO: Explain
      let newMoveBy: number; // TODO: Explain

      if (type === 'horizontal') {
        movedBy = touchObj.pageX - initialX;
      }
      else {
        movedBy = touchObj.pageY - initialY;
      }


      /**
       * Flagging as a scroll if there was no movement in any allowed direction before
       */
      if (detectedScroll === null && AllowedDirectionNumber !== 0 && (AllowedDirectionNumber * movedBy) < 0) {
        detectedScroll = true;
        return;
      } // TODO: Describe
      detectedScroll = false; // TODO: CHECK

      if (e.cancelable) {
        e.preventDefault();
      } // TODO: CHECK
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (swipeAway) {
        const maxMoveBy = GetActualPixels(swipeAwayBy, el, type);
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
        const maxMoveBy = GetActualPixels(max, el, type);
        newMoveBy       = maxMoveBy < Math.abs(movedBy) ? maxMoveBy : Math.abs(movedBy);
      }
      else {
        newMoveBy = Math.abs(movedBy);
      }

      Log(debug, movedBy, 'movedBy');

      requestAnimationFrame(() => {
        Log(debug, 'MOVE: translating');
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

          if (detectedScroll === null) {
            detectedScroll = false;
          }
          el.style.transform = `translate3d(0, ${Math.sign(movedBy) * newMoveBy}px, 0)`;
        }
      });
      return false;
    }, false);

    el.addEventListener('touchend', (e: any) => {
      const touchObj = e.changedTouches[0];
      if (detectedScroll) {
        Log(debug, 'END: detectedscroll');
        detectedScroll = null;
        return;
      }
      detectedScroll      = null;
      const offset        = Math.abs(type === 'horizontal' ? touchObj.pageX - initialX : touchObj.pageY - initialY);
      const hasSwipedOut  = offset >= SwipeOutThresholdPixels;
      const hasSwipedAway = offset >= SwipeAwayThresholdPixels;
      if (type === 'horizontal') {
        requestAnimationFrame(() => {
          if (swipeAway && hasSwipedAway) {
            HandleTransform(el, SwipeAwayByPixels, swipeTime, backTime, type, touchObj.pageX - initialX > 0);
          }
          else if (swipeOut && hasSwipedOut) {
            HandleTransform(el, SwipeOutByPixels, swipeTime, backTime, type, touchObj.pageX - initialX > 0);
          }
          else {
            Reset(el, backTime);
            swipedOut = false;
            Log(debug, 'END: resettings');
          }

          if (hasSwipedAway || hasSwipedOut) {
            swipedOut   = true; // It's not actually needed for the swipeAway logic.
            const event = {direction: touchObj.pageX - initialX > 0 ? 'right' : 'left'};
            Emit(vnode, event, hasSwipedAway);
            Log(debug, 'END: emitting swipe');
          }
        });
      }
      else if (type === 'vertical') {
        requestAnimationFrame(() => {
          if (swipeAway && hasSwipedAway) {
            HandleTransform(el, SwipeAwayByPixels, swipeTime, backTime, type, touchObj.pageY - initialY > 0);
          }
          if (swipeOut && hasSwipedOut) {
            HandleTransform(el, SwipeOutByPixels, swipeTime, backTime, type, touchObj.pageY - initialY > 0);
            swipedOut = true;
          }
          else {
            Reset(el, backTime);
            swipedOut = false;
            Log(debug, 'END: resettings');
          }

          if (hasSwipedAway || hasSwipedOut) {
            const event = {direction: touchObj.pageY - initialY > 0 ? 'top' : 'bottom'};
            Emit(vnode, event, hasSwipedAway);
            Log(debug, 'END: emitting swipe');
          }

        });
      }
    }, false);
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
  Log(debug, 'SKIP_CHECK -> ', {...arguments}); // TODO: remove useless debug line
  if (type === 'horizontal') {
    return Math.abs(pageX - initialX) < threshold;
  }
  else {
    return Math.abs(pageY - initialY) < threshold;
  }
}

/**
 * Get the amount of pixels of a given swipeOutBy value -> 5px becomes 5 while 50% in a 100px containers becomes 50
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
 */
function Reset(el: any, backTime: number): void {
  el.style.transition = `transform ${backTime}s`;
  el.style.transform  = '';
  requestAnimationFrame(() => {
        setTimeout(() => {
          el.style.transition = '';
        }, backTime * 1000);
      }
  );
}

/**
 * Just a dumb shorthand for Logs;
 * @param debug
 * @param args
 * @constructor
 */
function Log(debug: boolean, ...args: any[]): void {
  if (debug) {
    console.log(args);
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

function Emit(vnode: any, event: any, hasSwipedAway: boolean = false): void {
  const eventName = hasSwipedAway ? 'swiped-away' : 'swiped';
  vnode.context.$emit(eventName, event);
  if (vnode.componentInstance) {
    vnode.componentInstance.$emit(eventName, event); // use {detail:} to be uniform
  }
  else {
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

function HandleTransform(el: any, targetPosition: number, swipeTime: number = .5, resetTime: number, type: SwipeType, sign: boolean) {
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
