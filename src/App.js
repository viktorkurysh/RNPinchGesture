import {PinchGestureHandler, State} from 'react-native-gesture-handler';
import React from 'react';
import {View, StatusBar, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  eq,
  multiply,
  useCode,
  cond,
  block,
  Value,
  set
} from 'react-native-reanimated';
import {
  vec,
  useValue,
  onGestureEvent,
  pinchBegan,
  pinchActive,
  transformOrigin,
  translate,
  timing,
} from 'react-native-redash/lib/module/v1';

const {width, height} = Dimensions.get('window');
const CANVAS = vec.create(width, height);
const CENTER = vec.divide(CANVAS, 2);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
});

function App() {
  const translation = vec.createValue(0, 0);
  const origin = vec.createValue(0, 0);
  const focal = vec.createValue(0, 0);
  const scale = new Value(1);
  const state = new Value(State.UNDETERMINED);
  const numberOfPoints = new Value(0);
  const gestureHandler = onGestureEvent({
    focalX: focal.x,
    focalY: focal.y,
    state,
    scale,
    numberOfPoints,
  });
  const adjuctedFocal = vec.sub(focal, CENTER);

  useCode(
    () =>
      block([
        cond(pinchBegan(state), vec.set(origin, adjuctedFocal)),
        cond(pinchActive(state, numberOfPoints), [
          vec.set(translation, vec.sub(adjuctedFocal, origin)),
        ]),
        cond(eq(state, State.END), [
          set(scale, timing({from: scale, to: 1})),
          set(translation.x, timing({from: translation.x, to: 0})),
          set(translation.y, timing({from: translation.y, to: 0})),
        ]),
      ]),
    [focal, origin, state],
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <PinchGestureHandler {...gestureHandler}>
        <Animated.View style={StyleSheet.absoluteFill}>
          <Animated.Image
            source={require('../assets/image.jpg')}
            style={[
              styles.image,
              {
                transform: [
                  ...translate(translation),
                  ...transformOrigin(origin, {scale}),
                ],
              },
            ]}
            resizeMode="cover"
          />
        </Animated.View>
      </PinchGestureHandler>
    </View>
  );
}

export default App;
