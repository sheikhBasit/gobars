import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ImageBackground,
  useWindowDimensions,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';



type OnboardingScreenProps = {
  onComplete: () => void;
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView | null>(null);
  const { width: windowWidth } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      title: 'Welcome Gobars',
      description:
        'Find the best grooming experience in your city with just one tap! Don’t miss out on the haircut or treatment of your dreams. Let’s start now!',
      image: require('../../assets/onboard1.jpeg'),
    },
    {
      title: 'Looking for barber?',
      description:
        'Find the best barbershop around you in seconds, make an appointment, and enjoy the best grooming experience.',
      image: require('../../assets/onboard2.jpeg'),
    },
    {
      title: 'Everything in your hands',
      description:
        'With Gobar, find high-quality barbershops, see reviews, and make appointments easily. Achieve your confident appearance!',
      image: require('../../assets/onboard3.jpeg'),
    },
  ];

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / windowWidth);
    setCurrentIndex(index);

    // Automatically complete onboarding if user swipes beyond the last slide
    if (index >= slides.length) {
      onComplete();
    }
  };

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({ x: index * windowWidth, animated: true });
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      >
        {slides.map((slide, index) => (
          <View key={index} style={[styles.slide, { width: windowWidth }]}>
            <ImageBackground source={slide.image} style={styles.image} resizeMode="cover">
              <View style={styles.bottomContainer}>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>

                <View style={styles.indicatorContainer}>
                  {slides.map((_, i) => {
                    const inputRange = [
                      (i - 1) * windowWidth,
                      i * windowWidth,
                      (i + 1) * windowWidth,
                    ];

                    const animatedWidth = scrollX.interpolate({
                      inputRange,
                      outputRange: [8, 24, 8],
                      extrapolate: 'clamp',
                    });

                    const animatedColor = scrollX.interpolate({
                      inputRange,
                      outputRange: [
                        'rgba(255,255,255,0.5)',
                        '#363062',
                        'rgba(255,255,255,0.5)',
                      ],
                      extrapolate: 'clamp',
                    });

                    return (
                      <TouchableOpacity key={i} onPress={() => scrollToIndex(i)} activeOpacity={0.7}>
                        <Animated.View
                          style={[
                            styles.indicator,
                            {
                              width: animatedWidth,
                              backgroundColor: animatedColor,
                            },
                          ]}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    if (currentIndex === slides.length - 1) {
                      onComplete();
                    } else {
                      scrollToIndex(currentIndex + 1);
                    }
                  }}
                >
                  <Text style={styles.buttonText}>
                    Get Started
                  </Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        ))}

        {/* Extra empty slide to trigger automatic completion on swipe */}
        <View style={{ width: windowWidth }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bottomContainer: {
    backgroundColor: '#F99417',
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'flex-start',
    marginBottom:25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
    marginBottom: 25,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    backgroundColor: '#363062',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OnboardingScreen;
