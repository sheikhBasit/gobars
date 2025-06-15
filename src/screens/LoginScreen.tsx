/* eslint-disable @typescript-eslint/no-shadow */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types.ts';
import { API_ENDPOINTS } from '../constants/constant.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenProps = {
  onLoginSuccess: (token: string) => void;
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
  skipOnboarding?: () => void;
};
const loginUrl = API_ENDPOINTS.AUTH.LOGIN;
const LoginScreen: React.FC<LoginScreenProps> = ({
  // onLoginSuccess,
  navigation,
  // skipOnboarding
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState({
    email: false,
    password: false,
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  useEffect(() => {
    if (isTouched.email) {
      if (!email) {
        setEmailError('Email is required');
      } else if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address (e.g., example@domain.com)');
      } else {
        setEmailError(null);
      }
    }
  }, [email, isTouched.email]);

  useEffect(() => {
    if (isTouched.password) {
      if (!password) {
        setPasswordError('Password is required');
      } else if (!validatePassword(password)) {
        setPasswordError('Password must be at least 8 characters long');
      } else {
        setPasswordError(null);
      }
    }
  }, [password, isTouched.password]);

const handleLogin = async () => {
    try {
      // Check if there are any validation errors
      if (emailError || passwordError) {
        return;
      }

      setIsLoading(true);
      const response = await axios.post(loginUrl, {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Assuming the API returns a token in the response
      const token = response.data.token;
      console.log(response.data);

       if (token) {
        await AsyncStorage.setItem('userToken', token);
        // Clear navigation stack and navigate to Onboarding
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        });
      } else {
        throw new Error('No token received');
      }

    } catch (error: any) {
      let errorMessage = 'An error occurred during login';

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (error.response.status === 400) {
          errorMessage = 'Bad request - please check your input';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error - please try again later';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Network error - please check your connection';
      }

      Alert.alert(
        'Login Failed',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (!isTouched.email) {
      setIsTouched(prev => ({ ...prev, email: true }));
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (!isTouched.password) {
      setIsTouched(prev => ({ ...prev, password: true }));
    }
  };

  return (

  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.container}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
  >
    <Image
        source={require('../../assets/loginBackground.jpeg')}
        style={styles.background}
        resizeMode="cover"
      />
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back 👋</Text>
        <Text style={styles.subtitle}>
          Please enter your login information below to access your account
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={[
            styles.inputWrapper,
            emailError && styles.errorInput,
          ]}>
            <Icon name="email-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="example@domain.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
              onBlur={() => setIsTouched(prev => ({ ...prev, email: true }))}
            />
          </View>
          {emailError && <Text style={styles.errorText}>{emailError}</Text>}

          <Text style={styles.label}>Password</Text>
          <View style={[
            styles.inputWrapper,
            passwordError && styles.errorInput,
          ]}>
            <Icon name="lock-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={handlePasswordChange}
              onBlur={() => setIsTouched(prev => ({ ...prev, password: true }))}
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <Icon
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#bbb"
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>
          {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.loginButton,
            (!!emailError || !!passwordError || !email || !password) && styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={isLoading || !!emailError || !!passwordError || !email || !password}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.register}>
          <Text style={styles.registerPrompt}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>

  );
};

const styles = StyleSheet.create({
   background: {
    ...StyleSheet.absoluteFillObject, // This makes the image cover the whole screen
    zIndex: -1,
    width:'100%',
  },
  container: {
    flex: 1,
  },
  label: {
    margin: 5,
    color: '#363062',
    fontWeight: '500',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  paddingBottom: 20,

  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    paddingBottom: 50,
    marginTop: 'auto',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#363062',
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#667085',
    marginBottom: 20,
    textAlign: 'left',
  },
  inputContainer: {
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  errorInput: {
    borderColor: '#FF3B30',
  },
  icon: {
    marginRight: 10,
  },
  eyeIcon: {
    marginLeft: 'auto',
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 14,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#363062',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
    marginBottom: 15,
  },
  linkText: {
    color: '#363062',
    fontSize: 13,
    fontWeight: 'bold',
  },
  register: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerPrompt: {
    color: '#667085',
  },
  registerText: {
    color: '#363062',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
});

export default LoginScreen;
