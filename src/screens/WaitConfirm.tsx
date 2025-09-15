import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import { supabase } from '../services/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useIsFocused } from '@react-navigation/native';

// --- Supabase Admin Client ---
const supabaseAdminUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseAdminUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// --- Paleta e Tipografia ---
const COLORS = {
  backgroundPrimary: '#050810',
  backgroundSecondary: '#111528',
  accentPrimary: '#8A4FFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#E0E0E0',
  success: '#4ECDC4',
  error: '#FF6B6B',
};

const FONTS = {
  title: 'SpaceGrotesk-Bold',
  bodySemiBold: 'Inter-SemiBold',
  body: 'Inter-Regular',
};

// --- Props ---
interface WaitConfirmScreenProps {
  route: { params: { email: string; password: string } };
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const WaitConfirmScreen: React.FC<WaitConfirmScreenProps> = ({ route, navigation }) => {
  const { email, password } = route.params;

  const [status, setStatus] = useState<'pending' | 'verified' | 'expired' | 'error'>('pending');
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const lottieRef = useRef<LottieView | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();

  // --- Verifica confirmação de email usando o email com o cliente ADMIN ---
  const checkEmailVerification = async () => {
    if (['verified', 'expired', 'error'].includes(status)) return;

    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      
      if (error) {
        console.error('Erro ao buscar usuários:', error.message);
        return;
      }

      // Encontra o usuário pelo email
      const user = data.users.find(u => u.email === email);
      
      if (!user) {
        console.error('Usuário não encontrado.');
        return;
      }

      if (user.email_confirmed_at) {
        // Email confirmado. Faz o login silencioso no cliente principal.
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });

        if (signInError) {
          console.error('Erro ao fazer login:', signInError.message);
          setStatus('error');
          return;
        }
        
        setIsConfirmed(true);
        
        // Limpa os intervalos
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    } catch (err) {
      console.error('Erro no polling:', err);
      setStatus('error');
    }
  };

  // --- Atualiza status quando a tela fica focada ---
  useEffect(() => {
    if (isFocused && isConfirmed && status === 'pending') {
      setStatus('verified');
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 50,
      }).start();
    }
  }, [isFocused, isConfirmed]);

  // --- Expiração e Redirecionamento ---
  const handleExpiration = () => {
    if (status === 'pending') {
      setStatus('expired');
      if (pollingRef.current) clearInterval(pollingRef.current);
      setTimeout(() => navigation.replace('Onboarding'), 2000);
    }
  };

  // --- Polling e timers ---
  useEffect(() => {
    const resendTimer = setTimeout(() => setCanResend(true), 30000);

    // Inicia o polling para verificar confirmação de email
    pollingRef.current = setInterval(checkEmailVerification, 3000);
    timeoutRef.current = setTimeout(handleExpiration, 300000); // 5 minutos

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      clearTimeout(resendTimer);
    };
  }, []);

  // --- Reenviar email ---
  const resendConfirmationEmail = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      setResending(false);

      if (error) {
        Alert.alert('Erro ao reenviar email', error.message);
      } else {
        Alert.alert('Email reenviado', 'Verifique sua caixa de entrada.');
        setCanResend(false);
        setTimeout(() => setCanResend(true), 30000);
      }
    } catch (err) {
      setResending(false);
      Alert.alert('Erro inesperado', 'Tente novamente mais tarde.');
    }
  };

  const handleLottieFinish = () => {
    if (status === 'error' || status === 'expired') {
      navigation.replace('Onboarding');
    }
    if (status === 'verified') {
      // Navega para a tela principal após a animação de sucesso
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }, 500);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2111' }}
      style={styles.background}
      resizeMode="cover"
    >
      <BlurView intensity={50} style={styles.blurContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Confirme seu email</Text>
          <Text style={styles.subtitle}>
            Enviamos um link para:{'\n'}
            <Text style={{ fontFamily: FONTS.bodySemiBold, color: COLORS.accentPrimary }}>
              {email}
            </Text>
            {'\n'}
            Verifique sua caixa de entrada!
          </Text>

          <View style={styles.iconContainer}>
            {status === 'pending' && (
              <LottieView
                ref={lottieRef}
                source={require('../../assets/anims/loading-spinner.json')}
                autoPlay
                loop
                style={styles.lottie}
              />
            )}
            {status === 'verified' && (
              <LottieView
                ref={lottieRef}
                source={require('../../assets/anims/sucess-animation.json')}
                autoPlay
                loop={false}
                onAnimationFinish={handleLottieFinish}
                style={styles.lottie}
              />
            )}
            {(status === 'error' || status === 'expired') && (
              <LottieView
                ref={lottieRef}
                source={require('../../assets/anims/error-animation.json')}
                autoPlay
                loop={false}
                onAnimationFinish={handleLottieFinish}
                style={styles.lottie}
              />
            )}
          </View>

          <Text style={styles.loadingText}>
            {status === 'pending' && 'Aguardando confirmação...'}
            {status === 'verified' && 'Email confirmado! Redirecionando...'}
            {status === 'error' && 'Houve um erro! Tente novamente.'}
            {status === 'expired' && 'Link expirado. Redirecionando para cadastro...'}
          </Text>

          {canResend && status === 'pending' && (
            <TouchableOpacity
              style={[styles.resendButton, resending && { opacity: 0.7 }]}
              onPress={resendConfirmationEmail}
              disabled={resending}
            >
              {resending ? (
                <ActivityIndicator color={COLORS.textPrimary} />
              ) : (
                <Text style={styles.resendText}>Reenviar Email</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </ImageBackground>
  );
};

export default WaitConfirmScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: COLORS.backgroundPrimary },
  blurContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: {
    width: '90%',
    backgroundColor: COLORS.backgroundSecondary + 'D9',
    padding: 28,
    borderRadius: 24,
    alignItems: 'center',
  },
  title: { fontFamily: FONTS.title, fontSize: 28, color: COLORS.textPrimary, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: -50 },
  iconContainer: { justifyContent: 'center', alignItems: 'center', marginBottom: -40 },
  lottie: { width: width * 0.8, height: width * 0.8 },
  loadingText: { fontFamily: FONTS.body, fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginTop: 10 },
  resendButton: {
    marginTop: 20,
    backgroundColor: COLORS.accentPrimary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  resendText: { fontFamily: FONTS.bodySemiBold, color: COLORS.textPrimary, fontSize: 16 },
});