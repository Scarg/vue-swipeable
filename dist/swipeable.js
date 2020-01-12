"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var DefaultParameters = {
    swipeOutThreshold: '25%',
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
var Swipeable = {
    bind: function (el, binding, vnode) { return __awaiter(void 0, void 0, void 0, function () {
        var detectedScroll, swipedOut, parameters, swipeOutThreshold, backTime, swipeTime, type, swipeOut, swipeOutBy, threshold, allowedDirection, debug, max, swipeAway, swipeAwayBy, swipeAwayThreshold, AllowedDirectionNumber, SwipeOutThresholdPixels, SwipeOutByPixels, SwipeAwayThresholdPixels, SwipeAwayByPixels, initialX, initialY;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, HasRendered()];
                case 1:
                    _a.sent(); // Ensures that bindings have been evaluated
                    detectedScroll = false;
                    swipedOut = false;
                    parameters = __assign(__assign({}, DefaultParameters), binding.value);
                    swipeOutThreshold = parameters.swipeOutThreshold, backTime = parameters.backTime, swipeTime = parameters.swipeTime, type = parameters.type, swipeOut = parameters.swipeOut, swipeOutBy = parameters.swipeOutBy, threshold = parameters.threshold, allowedDirection = parameters.allowedDirection, debug = parameters.debug, max = parameters.max, swipeAway = parameters.swipeAway, swipeAwayBy = parameters.swipeAwayBy, swipeAwayThreshold = parameters.swipeAwayThreshold;
                    AllowedDirectionNumber = GetAllowedDirectionSign(allowedDirection);
                    SwipeOutThresholdPixels = GetActualPixels(swipeOutThreshold, el, type);
                    SwipeOutByPixels = GetActualPixels(swipeOutBy, el, type);
                    SwipeAwayThresholdPixels = GetActualPixels(swipeAwayThreshold, el, type);
                    SwipeAwayByPixels = GetActualPixels(swipeAwayBy, el, type);
                    initialX = 0;
                    initialY = 0;
                    el.addEventListener('touchstart', function (e) {
                        el.style.transition = '';
                        if (type === 'vertical' && ((el.getBoundingClientRect().top - el.offsetTop) * AllowedDirectionNumber < 0)) {
                            return;
                        }
                        var touchObj = e.changedTouches[0];
                        if (!swipedOut) {
                            initialX = touchObj.pageX;
                            initialY = touchObj.pageY;
                            Log(debug, 'START: starting', initialX, initialY);
                        }
                        else {
                            Log(debug, 'START: starting (ALREADY OPEN)');
                        }
                    }, false);
                    el.addEventListener('touchmove', function (e) {
                        /**
                         * Avoids any movement if the draggable element is (?) TODO: Test
                         */
                        if (detectedScroll === null && type === 'vertical' && ((el.getBoundingClientRect().top - el.offsetTop) * AllowedDirectionNumber < 0)) {
                            detectedScroll = true;
                            return;
                        }
                        var touchObj = e.changedTouches[0];
                        if (detectedScroll) {
                            Log(debug, 'MOVE: detectedScroll');
                            return;
                        }
                        if (ShouldSkip(type, touchObj.pageY, initialY, touchObj.pageX, initialX, threshold, debug)
                            && detectedScroll == null) {
                            // detectedScroll = true;
                            Log(debug, 'MOVE: shouldSkip');
                            return;
                        }
                        var movedBy; // TODO: Explain
                        var newMoveBy; // TODO: Explain
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
                            var maxMoveBy = GetActualPixels(swipeAwayBy, el, type);
                            newMoveBy = maxMoveBy < Math.abs(movedBy) ? maxMoveBy : Math.abs(movedBy);
                        }
                        else if (swipeOut) {
                            var maxMoveBy = Math.max(SwipeOutByPixels, SwipeOutThresholdPixels, swipeAway ? SwipeAwayByPixels : 0);
                            newMoveBy = maxMoveBy < Math.abs(movedBy) ? maxMoveBy : Math.abs(movedBy);
                        }
                        else if (max) {
                            var maxMoveBy = GetActualPixels(max, el, type);
                            newMoveBy = maxMoveBy < Math.abs(movedBy) ? maxMoveBy : Math.abs(movedBy);
                        }
                        else {
                            newMoveBy = Math.abs(movedBy);
                        }
                        Log(debug, movedBy, 'movedBy');
                        requestAnimationFrame(function () {
                            Log(debug, 'MOVE: translating');
                            if (type === 'horizontal') {
                                /* Horizontal swipe on X */
                                if (allowedDirection === 'right' && movedBy < 0) {
                                    return;
                                }
                                if (allowedDirection === 'left' && movedBy > 0) {
                                    return;
                                }
                                el.style.transform = "translate3d(" + Math.sign(movedBy) * newMoveBy + "px, 0, 0)";
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
                                el.style.transform = "translate3d(0, " + Math.sign(movedBy) * newMoveBy + "px, 0)";
                            }
                        });
                        return false;
                    }, false);
                    el.addEventListener('touchend', function (e) {
                        var touchObj = e.changedTouches[0];
                        if (detectedScroll) {
                            Log(debug, 'END: detectedscroll');
                            detectedScroll = null;
                            return;
                        }
                        detectedScroll = null;
                        var offset = Math.abs(type === 'horizontal' ? touchObj.pageX - initialX : touchObj.pageY - initialY);
                        var hasSwipedOut = offset >= SwipeOutThresholdPixels;
                        var hasSwipedAway = offset >= SwipeAwayThresholdPixels;
                        if (type === 'horizontal') {
                            requestAnimationFrame(function () {
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
                                    swipedOut = true; // It's not actually needed for the swipeAway logic.
                                    var event_1 = { direction: touchObj.pageX - initialX > 0 ? 'right' : 'left' };
                                    Emit(vnode, event_1, hasSwipedAway);
                                    Log(debug, 'END: emitting swipe');
                                }
                            });
                        }
                        else if (type === 'vertical') {
                            requestAnimationFrame(function () {
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
                                    var event_2 = { direction: touchObj.pageY - initialY > 0 ? 'top' : 'bottom' };
                                    Emit(vnode, event_2, hasSwipedAway);
                                    Log(debug, 'END: emitting swipe');
                                }
                            });
                        }
                    }, false);
                    return [2 /*return*/];
            }
        });
    }); },
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
function ShouldSkip(type, pageY, initialY, pageX, initialX, threshold, debug) {
    Log(debug, 'SKIP_CHECK -> ', __assign({}, arguments)); // TODO: remove useless debug line
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
function GetActualPixels(inputValue, element, type) {
    var actualValue;
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
function Reset(el, backTime) {
    el.style.transition = "transform " + backTime + "s";
    el.style.transform = '';
    requestAnimationFrame(function () {
        setTimeout(function () {
            el.style.transition = '';
        }, backTime * 1000);
    });
}
/**
 * Just a dumb shorthand for Logs;
 * @param debug
 * @param args
 * @constructor
 */
function Log(debug) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
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
function Emit(vnode, event, hasSwipedAway) {
    if (hasSwipedAway === void 0) { hasSwipedAway = false; }
    var eventName = hasSwipedAway ? 'swiped-away' : 'swiped';
    vnode.context.$emit(eventName, event);
    if (vnode.componentInstance) {
        vnode.componentInstance.$emit(eventName, event); // use {detail:} to be uniform
    }
    else {
        vnode.elm.dispatchEvent(new CustomEvent(eventName, { detail: event }));
    }
}
function GetAllowedDirectionSign(direction) {
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
function HandleTransform(el, targetPosition, swipeTime, resetTime, type, sign) {
    if (swipeTime === void 0) { swipeTime = .5; }
    var actualTargetPosition = (sign ? 1 : -1) * targetPosition;
    el.style.transition = "all " + swipeTime + "s";
    if (type == 'horizontal') {
        el.style.transform = "translate3d(" + actualTargetPosition + "px, 0, 0)";
    }
    else {
        el.style.transform = "translate3d(0, " + actualTargetPosition + "px, 0)";
    }
    requestAnimationFrame(function () {
        setTimeout(function () {
            el.style.transition = '';
        }, swipeTime * 1000);
    });
}
/**
 * Creates a promises that will be resolved after the first rendered frame
 * @constructor
 */
function HasRendered() {
    return new Promise(function (resolve) {
        requestAnimationFrame(function () {
            resolve();
        });
    });
}
exports.default = Swipeable;
