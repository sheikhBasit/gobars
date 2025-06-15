import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from './src/screens/SplashScreen.tsx';
import LoginScreen from './src/screens/LoginScreen.tsx';
import OnboardingScreen from './src/screens/OnboardingScreen.tsx';
import HomeScreen from './src/screens/HomeScreen.tsx';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen.tsx';
import RegisterScreen from './src/screens/RegisterScreen.tsx';
import { RootStackParamList } from './types.ts';

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Splash');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const [userToken, hasCompletedOnboarding] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('hasCompletedOnboarding'),
        ]);

        if (userToken) {
          setInitialRoute(hasCompletedOnboarding === 'true' ? 'Home' : 'Onboarding');
        } else {
          setInitialRoute('Login');
        }
      } catch (error) {
        console.error('Auth check failed', error);
        setInitialRoute('Login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#363062" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login">
          {(props:any) => (
            <LoginScreen
              {...props}
              onLoginSuccess={async (token: string) => {
                await AsyncStorage.setItem('userToken', token);
                props.navigation.reset({
                  index: 0,
                  routes: [{ name: 'Onboarding' }],
                });
              }}
              skipOnboarding={async () => {
                await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
                props.navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              }}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Onboarding">
          {(props:any) => (
            <OnboardingScreen
              {...props}
              onComplete={async () => {
                await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
                props.navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              }}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;