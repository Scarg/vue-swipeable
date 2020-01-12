# vue-swipeable
Vue-swipeable is a Vue directive that serves multiple purposes:
* Swiping away a component (e.g: clearing up a notification)
* Partially swiping a component in order to reveal an option underneath
* Pulling a component in order to trigger a particular action (e.g: pull to refresh)

## Configuration

In your main.ts/main.js file 
```
import Draggable from 'path';
Vue.directive('draggable', Draggable);
```

Then in your desired .vue file:
```vue
<template>
 <some-element-or-component v-draggable="directiveOptions">
 </some-element-or-component>
</template>
<script>
//...
data(): {
  directiveOptions: {
    type: 'horizontal',
    swipeOut: true,
    swipeOutBy: '200px',
    swipeOutThreshold: '50px',
  }
}
//...
</script>
```


## Options
| Option | Description | Allowed values | Default |
| ----- | ----- | ----- | ----- |
| threshold | Minimum amount of pixels of movement before a swipe is registered | Number (pixels) | 5 |
| backTime | Time in seconds taken by the element while returnint to its default position | Number (seconds) | .5 |
| swipeTime | Time in seconds taken by element while moving to its swipedOut position | Number (seconds) | .5 |
| type | Axix of the swipe | String ('horizontal' or 'vertical')  | 'horizontal' |
| allowedDirection | The direction to which the swipe should be limited on its axis | String? ( 'top', 'bottom', 'left', 'right' or null) | null |
| swipeOut | SwipeOut | Boolean | false |
| swipeOutBy | How much should the element be swiped out | String ( 5, '5px' or '50%') | '50%' |
| swipeOutThreshold | Pixels of movement required to trigger the swipe out logic | String ( 5, '5px' or '50%') | '25%' |
| swipeAway | Can the element be completely swiped away | Boolean | false |
| swipeAwayBy | How much should the element be swiped away | String ( 5, '5px' or '50%') | '1000%' |
| swipeAwayThreshold | Pixels of movement required to trigger the swipe away logic | String ( 5, '5px' or '50%') | '55%' |
| max | The max amount of pixel to component can be moved around on its axis (used only if swipeOut and swipeAway are false) | String? ( 5, '5px', '50%' or null) | null | 
| debug | Should the directive print information related to its internal logic | Boolean | false |

## Events
| Event | Description | Data |
| ----- | ----- | ----- |
| 'swiped' | Triggered when the user has realeased the element after a movement greated than the swipeAwayThreshold | {direction: 'top'} ('top', 'bottom', 'left' or 'right') |
| 'swiped-away' | Triggered when the user has realeased the element after a movement greated than the swipeOutThreshold | {direction: 'top'} ('top', 'bottom', 'left' or 'right') |
