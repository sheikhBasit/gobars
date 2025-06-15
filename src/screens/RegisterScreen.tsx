import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { API_ENDPOINTS } from '../constants/constant.ts';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
type FormData = {
  name: string;
  email: string;
  phonePrefix: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};
const countryCodes = [
  { label: '+1 ', value: '+1' },
  { label: '+44 ', value: '+44' },
  { label: '+91 ', value: '+91' },
  { label: '+92 ', value: '+92' },
  { label: '+62 ', value: '+62' },
];
type Errors = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

type Touched = {
  name: boolean;
  email: boolean;
  phoneNumber: boolean;
  password: boolean;
  confirmPassword: boolean;
};

type RegisterScreenProps = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const registerUrl = API_ENDPOINTS.AUTH.SIGNUP;
   const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phonePrefix: '+62',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Errors>({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [touched, setTouched] = useState<Touched>({
    name: false,
    email: false,
    phoneNumber: false,
    password: false,
    confirmPassword: false,
  });

  const validateField = (name: keyof Touched, value: string): string => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {error = 'Name is required';}
        else if (value.trim().length < 3) {error = 'Name must be at least 3 characters';}
        break;
      case 'email':
        if (!value) {error = 'Email is required';}
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {error = 'Invalid email format';}
        break;
      case 'phoneNumber':
        if (!value) {error = 'Phone number is required';}
        else if (!/^[\d-]{10,15}$/.test(value)) {error = 'Invalid phone number format';}
        break;
      case 'password':
        if (!value) {error = 'Password is required';}
        else if (value.length < 8) {error = 'Password must be at least 8 characters';}
        else if (!/[A-Z]/.test(value)) {error = 'Password needs at least one uppercase letter';}
        else if (!/[0-9]/.test(value)) {error = 'Password needs at least one number';}
        break;
      case 'confirmPassword':
        if (!value) {error = 'Please confirm your password';}
        else if (value !== formData.password) {error = 'Passwords do not match';}
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = (name: keyof Touched, value: string) => {
  setFormData(prev => ({ ...prev, [name]: value }));

  if (touched[name]) {
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  }
};

  const handleBlur = (name: keyof Touched) => {
  setTouched(prev => ({ ...prev, [name]: true }));
  setErrors(prev => ({ ...prev, [name]: validateField(name, formData[name]) }));
};

const handleRegister = async () => {
  // Mark all fields as touched to show all errors
  const newTouched: Touched = {
    name: true,
    email: true,
    phoneNumber: true,
    password: true,
    confirmPassword: true,
  };
  setTouched(newTouched);

  // Validate all fields
  const newErrors: Errors = {
    name: validateField('name', formData.name),
    email: validateField('email', formData.email),
    phoneNumber: validateField('phoneNumber', formData.phoneNumber),
    password: validateField('password', formData.password),
    confirmPassword: validateField('confirmPassword', formData.confirmPassword),
  };

  setErrors(newErrors);

  const isValid = Object.values(newErrors).every(error => !error);

  if (isValid) {
    try {
      setIsLoading(true);

      // Prepare the data according to database schema
      const requestData = {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phoneNumber ? `${formData.phonePrefix}${formData.phoneNumber}` : null,
        password: formData.password, // Note: Server should hash this before storing
        // created_at and updated_at will be handled by the database
      };

      // Make the API call
      const response = await axios.post(registerUrl, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Handle successful registration
      if (response.status === 201) { // 201 Created is typical for successful registration
        Alert.alert(
          'Success',
          'Registration successful!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        // Handle API-level errors
        Alert.alert(
          'Registration Failed',
          response.data.message || 'Something went wrong during registration'
        );
      }
    } catch (error: any) {
      // Handle network errors or server errors
      let errorMessage = 'An error occurred during registration';

      if (error.response) {
        // The request was made and the server responded with a status code
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid registration data';
        } else if (error.response.status === 409) {
          errorMessage = 'Email already exists';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error - please try again later';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Network error - please check your connection';
      }

      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }
};
  return (
    <View style={styles.wrapper}>

      <View style={styles.container}>
         <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.wrapper}
    >
        <ScrollView contentContainerStyle={styles.formCard}
        keyboardShouldPersistTaps="handled">

          <Text style={styles.title}>Register here</Text>
          <Text style={styles.subtitle}>
            Please enter your data to complete your{'\n'}account registration process
          </Text>

 <View style={styles.fieldContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={[
              styles.inputWrapper,
              errors.name && touched.name && styles.inputError,
            ]}>
              <Icon name="account" size={20} color="#888" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                onBlur={() => handleBlur('name')}
                placeholder="Enter your full name"
                placeholderTextColor="#888"
              />
            </View>
            {touched.name && errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
          </View>

          {/* Email Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[
              styles.inputWrapper,
              errors.email && touched.email && styles.inputError,
            ]}>
              <Icon name="email" size={20} color="#888" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                onBlur={() => handleBlur('email')}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#888"
              />
            </View>
            {touched.email && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Phone Number Field */}
   <View style={styles.fieldContainer}>
  <Text style={styles.label}>Phone Number</Text>
  <View style={[
    styles.inputWrapper,
    errors.phoneNumber && touched.phoneNumber && styles.inputError,
  ]}>
    <View style={styles.countryCodeContainer}>
      <RNPickerSelect
        onValueChange={(value) => setFormData(prev => ({...prev, phonePrefix: value}))}
        items={countryCodes}
        value={formData.phonePrefix}
        style={pickerSelectStyles}
        useNativeAndroidPickerStyle={false}
        placeholder={{}}
        Icon={() => <Icon name="chevron-down" size={18} color="#666" />}
      />
    </View>
    <TextInput
      style={styles.phoneInput}
      value={formData.phoneNumber}
      onChangeText={(text) => handleChange('phoneNumber', text)}
      onBlur={() => handleBlur('phoneNumber')}
      keyboardType="phone-pad"
      placeholder="Phone number"
      placeholderTextColor="#888"
    />
  </View>
  {touched.phoneNumber && errors.phoneNumber && (
    <Text style={styles.errorText}>{errors.phoneNumber}</Text>
  )}
</View>
   
          {/* Password Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Create Password</Text>
            <View style={[
              styles.inputWrapper,
              errors.password && touched.password && styles.inputError,
            ]}>
              <Icon name="key" size={20} color="#888" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                onBlur={() => handleBlur('password')}
                placeholder="Create your password"
                secureTextEntry={!showPassword}
                placeholderTextColor="#888"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Confirm Password Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[
              styles.inputWrapper,
              errors.confirmPassword && touched.confirmPassword && styles.inputError,
            ]}>
              <Icon name="key" size={20} color="#888" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Confirm your password"
                secureTextEntry={!showPassword}
                placeholderTextColor="#888"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>
          {/* Register Button */}
<TouchableOpacity
  style={[
    styles.registerButton,
    (isLoading || Object.values(errors).some(error => error)) && styles.disabledButton,
  ]}
  onPress={handleRegister}
  disabled={isLoading || Object.values(errors).some(error => error)}
>
  {isLoading ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Text style={styles.registerText}>Register</Text>
  )}
</TouchableOpacity>
          {/* Redirect to Login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
   wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    marginTop:15,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#363062',
    marginBottom: 10,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
    marginBottom: 10,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  inputWrapper: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingLeft: 10,
  },
  icon: {
    marginRight: 5,
  },
  eyeIcon: {
    padding: 5,
  },
    countryCodeContainer: {
    width: 100,
    justifyContent: 'center',
    paddingLeft: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingLeft: 10,
    marginLeft: 5,
  },
  validationIcon: {
    marginRight: 10,
  },
  prefixBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
  prefixText: {
    fontSize: 14,
    color: '#333',
    marginRight: 5,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 10,
  },
  registerButton: {
    backgroundColor: '#3d2c8d',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
    opacity: 0.7,
  },
  registerText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  footerText: {
    fontSize: 13,
    color: '#666',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3d2c8d',
  },
    label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#363062',
    marginBottom: 8,
    marginLeft: 5,
  },
});
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    color: '#333',
    paddingVertical: 10,
    paddingRight: 30,
    paddingLeft: 5,
  },
  inputAndroid: {
    fontSize: 14,
    color: '#333',
    paddingVertical: 8,
    paddingRight: 30,
    paddingLeft: 5,
    height: 40,  // Added height for Android
  },
  iconContainer: {
    top: Platform.OS === 'android' ? 10 : 12,
    right: 10,
  },
});

export default RegisterScreen;

