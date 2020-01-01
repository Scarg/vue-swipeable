interface DraggableParameters {
    swipeOutThreshold: string,
    backTime: string,
    swipeTime: string,
    type: SwipeType,
    swipeOut: boolean,
    swipeOutBy: string,
    threshold: string,
    direction?: Direction, // TODO: changed to 1 | -1
}

const DefaultParameters: DraggableParameters = {
    swipeOutThreshold: '25%',
    backTime: '0.5s',
    swipeTime: '0.5s',
    type: 'horizontal',
    swipeOut: false,
    swipeOutBy: '50%',
    threshold: '5',
    // direction: null,
};

type SwipeType = 'horizontal' | 'vertical';
type Direction = 'top' | 'bottom' | 'left' | 'right' | null;

const Draggable: any = {
    bind: (el: any, binding: {value: DraggableParameters}, vnode: any) => {
        let detectedScroll: boolean | null = false;
        let swipedOut = false;

        const parameters = {...DefaultParameters, ...binding.value};

        const {
            swipeOutThreshold,
            backTime,
            swipeTime,
            type,
            swipeOut,
            swipeOutBy,
            threshold,
            direction,
        } = parameters;

        let initialX = 0;
        let initialY = 0;

        el.addEventListener('touchstart', function (e: any) {

            if (type === 'vertical' && ((el.getBoundingClientRect().top - el.offsetTop) * direction < 0)) {
                return;
            }

            const touchObj = e.changedTouches[0];
            el.style.transition = 'none';
            if (!swipedOut) {
                initialX = touchObj.pageX;
                initialY = touchObj.pageY;
                Log('START: starting', initialX, initialY);
            } else {
                Log('START: starting (ALREADY OPEN)');
            }
        }, false);


        el.addEventListener('touchmove', function (e: any) {
            const touchObj = e.changedTouches[0];
            if (detectedScroll) {
                Log('MOVE: detectedScroll');
                return;
            }
            if (ShouldSkip(type, touchObj.pageY, initialY, touchObj.pageX, initialX, threshold) && detectedScroll == null) {
                detectedScroll = true;
                Log('MOVE: shouldSkip');
                return;
            }
            detectedScroll = false;
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            requestAnimationFrame(() => {
                Log('MOVE: translating');
                let movedBy, newMoveBy
                if (type === 'horizontal') {
                    /* Horizontal swipe on X */
                    movedBy = touchObj.pageX - initialX;
                    if (swipeOut && swipeOutBy) {
                        let maxMoveBy = Math.max(GetActualPixels(swipeOutBy, el, type), GetActualPixels(swipeOutThreshold, el, type));

                        newMoveBy = maxMoveBy < Math.abs(movedBy) ? maxMoveBy : Math.abs(movedBy)
                    } else {
                        newMoveBy = Math.abs(movedBy)
                    }
                    el.style.transform = `translate3d(${Math.sign(movedBy) * newMoveBy}px, 0, 0)`
                } else {
                    /* vertical swipe on Y */
                    movedBy = touchObj.pageY - initialY;
                    if (swipeOut && swipeOutBy) {
                        let maxMoveBy = Math.max(GetActualPixels(swipeOutBy, el, type), GetActualPixels(swipeOutThreshold, el, type));

                        newMoveBy = maxMoveBy < Math.abs(movedBy) ? maxMoveBy : Math.abs(movedBy)
                    } else {
                        newMoveBy = Math.abs(movedBy)
                    }
                    console.log(movedBy, 'movedBy')
                    if (direction === 'bottom' && movedBy < 0) return;

                    if (direction === 'top' && movedBy > 0) return;

                    el.style.transform = `translate3d(0, ${Math.sign(movedBy) * newMoveBy}px, 0)`;
                }
            });
            return false
        }, false);

        el.addEventListener('touchend', function (e: any) {
            const touchObj = e.changedTouches[0];
            if (detectedScroll) {
                Log('END: detectedscroll');
                detectedScroll = null;
                return
            }
            detectedScroll = null;
            const offset = Math.abs(type === 'horizontal' ? touchObj.pageX - initialX : touchObj.pageY - initialY);
            if (type === 'horizontal' && Math.abs(touchObj.pageX - initialX) >= +swipeOutThreshold) {
                el.style.transition = `all ${swipeTime || '.5s'}` /* UNCOMMENT IF THE VISIBLITY SHOULD BE HANDLED BY THE DIRECTIVE */ //, visibility ${swipeTime || '.5s'}
                requestAnimationFrame(() => {
                    if (swipeOut) {
                        el.style.transform = `translate3d(${touchObj.pageX - initialX > 0 ? '' : '-'}${swipeOutBy || '90%'}, 0, 0)`
                        /* UNCOMMENT IF THE VISIBLITY SHOULD BE HANDLED BY THE DIRECTIVE */
                        // el.style.visiblity = 'hidden'
                        swipedOut = true;
                    } else {
                        el.style.transform = '';
                    }
                    vnode.context.$emit(`swiped`, {
                        direction: touchObj.pageX - initialX > 0 ? 'right' : 'left'
                    });
                    if (vnode.componentInstance) {
                        vnode.componentInstance.$emit('swiped', {direction: touchObj.pageX - initialX > 0 ? 'right' : 'left'}); // use {detail:} to be uniform
                    } else {
                        vnode.elm.dispatchEvent(new CustomEvent('swiped', {detail: {direction: touchObj.pageX - initialX > 0 ? 'right' : 'left'}}));
                    }
                    //emit(vnode, {direction: touchObj.pageX - initialX > 0 ? 'right' : 'left'})
                    Log('END: emitting swipe');
                    setTimeout(() => {
                        el.style.transition = ''
                    }, 1000)
                })
            } else if (type === 'vertical' && offset >= GetActualPixels(swipeOutThreshold, el, type)) {
                const event = {direction: touchObj.pageY - initialY > 0 ? 'bottom' : 'up'};
                Emit(vnode, event, true);
            } else {
                Reset(el, backTime);
                swipedOut = false;
                Log('END: resettings');
            }
        }, false);
    }
};


/**
 * "Should skip" utility function (if the horizontal/vertical swipe is greater than the threshold
 * @param type type of swipe ('horizontal' or 'vertical')
 * @param pageY
 * @param initialY
 * @param pageX
 * @param initialX
 * @param threshold Minim amount of pixels of movement before a swipe is registered
 * @returns {boolean} True if an actual swipe has not been registered
 */
function ShouldSkip (type: SwipeType, pageY: number, initialY: number, pageX: number, initialX: number, threshold: string): boolean {
    Log('SKIP_CHECK -> ', {...arguments});
    // if (type === 'horizontal' && Math.abs(pageY - initialY) >= Math.abs(pageX - initialX)) { return true }
    if (type === 'horizontal') {
        return Math.abs(pageX - initialX) < +threshold;
    } else {
        return Math.abs(pageY - initialY) < +threshold;
    }
}

/**
 * Get the amount of pixels of a given swipeOutBy value -> 5px becomes 5 while 50% in a 100px containers becomes 50
 * @param inputValue Accepted values are 1, 1% or 1px
 * @param element The dom element of the container
 * @param type Type of swipe ('horizontal' or 'vertical')
 * @returns {number} The actual number of pixels
 */
function GetActualPixels (inputValue: string, element: any, type: SwipeType): number {
    let actualValue: number;
    if (inputValue.includes != null) {
        if (inputValue.includes('%')) {
            if (type === 'horizontal') {
                actualValue = element.clientWidth * +inputValue.slice(0, -1) / 100; // TODO: check if float is needed
            } else {
                actualValue = element.clientHeight * +inputValue.slice(0, -1) / 100;
            }
        } else if (inputValue.includes('px')) {
            actualValue = +inputValue.slice(0, -2);
        } else {
            return +inputValue;
        }
    } else {
        return +inputValue;
    }

    return actualValue;
}

/**
 * Reset elements position because the user stopped swiping before the desired swipeOutThreshold or because it's not swiping in the wanted direction
 * @param el Element
 * @param backTime Animation time for the transform 0
 */
function Reset (el: any, backTime: string): void {
    el.style.transition = `transform ${backTime || '.5s'}`;
    requestAnimationFrame(() => {
        el.style.transform = '';
        setTimeout(() => {
            el.style.transition = ''
        }, 500)
    })
}

function Log (...args: any[]): void {
    console.log(args);
}

function Emit(vnode: any, event: any): void {
    vnode.context.$emit(`swiped`, event);
    if (vnode.componentInstance) {
        vnode.componentInstance.$emit('swiped', event); // use {detail:} to be uniform
    } else {
        vnode.elm.dispatchEvent(new CustomEvent('swiped', {detail: event}));
    }
}
