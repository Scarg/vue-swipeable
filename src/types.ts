import { DirectiveOptions, DirectiveBinding, DirectiveFunction } from 'vue/types/options'
import { VNode } from 'vue/types/vnode'

export type SwipeType = 'horizontal' | 'vertical'; //TODO: add 'any'

export type AllowedDirection = 'top' | 'bottom' | 'left' | 'right' | null;

export interface DirectiveParameters {
  swipeOutThreshold?: string;
  backTime?: number; // Animation time for the transform 0
  swipeTime?: number; // Animation time for the swipe
  type?: SwipeType;
  swipeOut?: boolean;
  swipeOutBy?: string; // IN PIXELS OR PERCENTAGE 5 or 5px become 5 while 50% in a 100px containers becomes 50
  threshold?: number; // Minimum amount of pixels of movement before a swipe is registered
  allowedDirection?: AllowedDirection;
  debug?: boolean;
  max?: string | null;
  swipeAway?: boolean;
  swipeAwayBy?: string; // 5, 5px or 5% => The amount of pixels that the element will be swipedAway
  swipeAwayThreshold?: string; // 5, 5px or 5% || the amount of pixels after which a swipeAway is detected
  // TODO: Add "hold" preference
}

export class DirectiveParametersWithDefaults implements DirectiveParameters {

}

export interface SwipeableDirective extends DirectiveOptions {
  bind: SwipeableFunction & DirectiveFunction,
}

export interface SwipeableDirectiveBinding extends DirectiveBinding {
 readonly value?: DirectiveParameters
}

type SwipeableFunction = (
  el: HTMLElement,
  binding: SwipeableDirectiveBinding,
  vnode: VNode,
  oldVnode: VNode
) => Promise<void>;
