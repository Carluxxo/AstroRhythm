import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabaseClient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

// --- PALETA DE CORES ---
const COLORS = {
  backgroundPrimary: '#050810',
  backgroundSecondary: '#111528',
  backgroundTertiary: '#1E2245',
  accentPrimary: '#8A4FFF',
  accentSecondary: '#4ECDC4',
  error: '#FF6B6B',
  success: '#4ECDC4',
  textPrimary: '#FFFFFF',
  textSecondary: '#E0E0E0',
  textTertiary: '#A0A0B0',
};

// --- TIPOGRAFIA ---
const FONTS = {
  title: 'SpaceGrotesk-Bold',
  bodySemiBold: 'Inter-SemiBold',
  bodyMedium: 'Inter-Medium',
  body: 'Inter-Regular',
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LoginAccount'>;

const LoginAccountScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  
  // --- ESTADOS ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);

  // --- VALIDAÇÕES ---
  const validateEmail = (text: string) => {
    setEmail(text);
    setLoginError('');
    const emailRegex = /^\S+@\S+\.\S+$/;
    
    if (text.length > 0 && !emailRegex.test(text)) {
      setEmailError('Formato de e-mail inválido.');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (text: string) => {
    setPassword(text);
    setLoginError('');
    
    if (text.length > 0 && text.length < 8) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres.');
    } else {
      setPasswordError('');
    }
  };

  const isFormValid = email.length > 0 && password.length >= 6 && !emailError;

  // --- FUNÇÃO DE LOGIN ---
  const handleLogin = async () => {
    if (!isFormValid) {
      setLoginError('Por favor, preencha todos os campos corretamente.');
      return;
    }
    
    setLoading(true);
    setLoginError('');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        // Traduzir mensagem de erro
        const errorMessage = error.message === 'Invalid login credentials' 
          ? 'E-mail ou senha incorretos.' 
          : error.message;
        
        setLoginError(errorMessage);
        
        // Incrementar tentativas de login
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
      }
      // Login bem-sucedido - a sessão será salva automaticamente pelo Supabase
      // O AppNavigator detectará a mudança e redirecionará para MainTabs
    } catch (err) {
      setLoginError('Não foi possível fazer login. Tente novamente.');
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToCreateAccount = () => {
    navigation.replace('CreateAccount');
  };

  const handleForgotPassword = () => {
    // Implementar lógica de recuperação de senha aqui
    console.log('Esqueci a senha clicado para:', email);
    // Você pode navegar para uma tela de recuperação de senha ou abrir um modal
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2111',
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <BlurView intensity={50} style={styles.blurContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Animated.View entering={FadeInDown.duration(500)} style={styles.modal}>
              <Text style={styles.title}>Faça seu login</Text>
              <Text style={styles.subtitle}>Bem-vindo de volta! Acesse sua conta.</Text>

              {/* Campo Email */}
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={COLORS.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={validateEmail}
                  onBlur={() => validateEmail(email)}
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              {/* Campo Senha */}
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Senha"
                  placeholderTextColor={COLORS.textTertiary}
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={validatePassword}
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                  <Ionicons
                    name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textTertiary}
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

              {/* Mensagem de erro de login */}
              {loginError ? (
                <Animated.View entering={FadeInDown} style={styles.loginErrorContainer}>
                  <Ionicons name="warning-outline" size={16} color={COLORS.error} />
                  <Text style={styles.loginErrorText}>{loginError}</Text>
                </Animated.View>
              ) : null}

              <TouchableOpacity
                style={[styles.button, (!isFormValid || loading) && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={!isFormValid || loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textPrimary} />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Link condicional baseado em tentativas de login */}
              {loginAttempts > 0 ? (
                <TouchableOpacity
                  style={styles.createAccountButton}
                  onPress={handleForgotPassword}
                >
                  <Text style={styles.createAccountText}>
                    Não lembra a senha? <Text style={styles.createAccountLink}>Recuperar senha</Text>
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.createAccountButton}
                  onPress={navigateToCreateAccount}
                >
                  <Text style={styles.createAccountText}>
                    Não tem uma conta? <Text style={styles.createAccountLink}>Criar conta</Text>
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </BlurView>
    </ImageBackground>
  );
};

export default LoginAccountScreen;

// --- ESTILOS ---
const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: COLORS.backgroundSecondary + 'D9',
    borderRadius: 24,
    padding: 28,
    shadowColor: COLORS.accentPrimary,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(138, 79, 255, 0.2)',
  },
  title: {
    fontFamily: FONTS.title,
    fontSize: 28,
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 16,
    marginBottom: 18,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    paddingVertical: 14,
    fontFamily: FONTS.body,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.accentPrimary,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: COLORS.backgroundTertiary,
    opacity: 0.8,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyMedium,
    fontSize: 16,
  },
  errorText: {
    color: COLORS.error,
    fontFamily: FONTS.body,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 10,
    marginLeft: 15,
  },
  loginErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '20',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  loginErrorText: {
    color: COLORS.error,
    fontFamily: FONTS.body,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.backgroundTertiary,
  },
  dividerText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textTertiary,
    marginHorizontal: 10,
  },
  createAccountButton: {
    alignItems: 'center',
  },
  createAccountText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  createAccountLink: {
    color: COLORS.accentSecondary,
    fontFamily: FONTS.bodySemiBold,
  },
});