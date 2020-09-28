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
  set,
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
  const gestureScale = new Value(1);
  const state = new Value(State.UNDETERMINED);
  const numberOfPoints = new Value(0);
  const gestureHandler = onGestureEvent({
    focalX: focal.x,
    focalY: focal.y,
    state,
    scale: gestureScale,
    numberOfPoints,
  });
  const scaleOffset = new Value(1);
  const offset = vec.createValue(0, 0);

  const adjuctedFocal = vec.sub(focal, vec.add(CENTER, offset));

  useCode(
    () =>
      block([
        cond(pinchBegan(state), vec.set(origin, adjuctedFocal)),
        cond(pinchActive(state, numberOfPoints), [
          vec.set(
            translation,
            vec.add(
              vec.sub(adjuctedFocal, origin),
              origin,
              vec.multiply(-1, gestureScale, origin),
            ),
          ),
        ]),
        cond(eq(state, State.END), [
          set(scaleOffset, multiply(scaleOffset, gestureScale)),
          vec.set(offset, vec.add(offset, translation)),
          set(gestureScale, 1),
          vec.set(focal, 0),
          vec.set(translation, 0),
        ]),
      ]),
    [adjuctedFocal, gestureScale, numberOfPoints, origin, state, translation],
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
                  ...translate(vec.add(translation, offset)),
                  {scale: multiply(gestureScale, scaleOffset)},
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
