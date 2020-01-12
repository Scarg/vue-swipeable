import { DirectiveOptions, DirectiveBinding, DirectiveFunction } from 'vue/types/options'

export type SwipeType = 'horizontal' | 'vertical'; //TODO: add 'any'

export type AllowedDirection = 'top' | 'bottom' | 'left' | 'right' | null;

export interface DraggableParameters {
  swipeOutThreshold: string;
  backTime: number; // Animation time for the transform 0
  swipeTime: number; // Animation time for the swipe
  type: SwipeType;
  swipeOut: boolean;
  swipeOutBy: string; // IN PIXELS OR PERCENTAGE 5 or 5px become 5 while 50% in a 100px containers becomes 50
  threshold: number; // Minimum amount of pixels of movement before a swipe is registered
  allowedDirection: AllowedDirection;
  debug: boolean;
  max: string | null;
  swipeAway: boolean;
  swipeAwayBy: string; // 5, 5px or 5% => The amount of pixels that the element will be swipedAway
  swipeAwayThreshold: string; // 5, 5px or 5% || the amount of pixels after which a swipeAway is detected
  // TODO: Add "hold" preference
}

export interface SwipeableDirective extends DirectiveOptions {
  bind: ExtendedSwipeableFunction,
}

export interface SwipeableDirectiveBinding extends DirectiveBinding {
 readonly value: DraggableParameters
}

type SwipeableFunction = (
  binding: SwipeableDirectiveBinding
) => Promise<void>;

type ExtendedSwipeableFunction = SwipeableFunction & DirectiveFunction;


