// src/screens/CreateAccountScreen.tsx
import React, { useState, useMemo } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// --- ATENÇÃO: NÃO USAR EM PRODUÇÃO ---
// Esta é a sua chave de service_role. Ela deve ser usada APENAS em um ambiente de servidor seguro, NUNCA no front-end.
// Este código é fornecido apenas para que você possa testar a lógica durante o desenvolvimento.
// Em produção: mova essa verificação para um endpoint seguro no servidor.
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY ?? '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY ?? '';

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

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

// --- COMPONENTE DE REQUISITO DE SENHA ---
interface PasswordRequirementItemProps {
  isValid: boolean;
  text: string;
}

const PasswordRequirementItem: React.FC<PasswordRequirementItemProps> = ({ isValid, text }) => (
  <View style={styles.requirementItem}>
    <Ionicons
      name={isValid ? 'checkmark-circle' : 'close-circle'}
      size={16}
      color={isValid ? COLORS.success : COLORS.error}
      style={{ marginRight: 8 }}
    />
    <Text style={[styles.requirementText, { color: isValid ? COLORS.success : COLORS.textTertiary }]}>
      {text}
    </Text>
  </View>
);

const CreateAccountScreen = ({ navigation }: { navigation: any }) => {
  // --- ESTADOS ---
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailChecking, setIsEmailChecking] = useState(false);

  // --- VALIDAÇÕES ---
  const passwordRequirements = useMemo(() => {
    const hasValidChars = /^[ -~]+$/.test(password); // ASCII printable
    return {
      length: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasValidChars,
    };
  }, [password]);

  const isPasswordValid = useMemo(() => {
    // validar que TODOS os requisitos são verdadeiros
    return (
      passwordRequirements.length &&
      passwordRequirements.hasUpper &&
      passwordRequirements.hasLower &&
      passwordRequirements.hasNumber &&
      passwordRequirements.hasSpecial &&
      passwordRequirements.hasValidChars
    );
  }, [passwordRequirements]);

  const isFormValid = useMemo(() => {
    return (
      !usernameError &&
      !emailError &&
      !isEmailChecking &&
      username.trim().length >= 5 &&
      email.trim().length > 0 &&
      isPasswordValid &&
      password === confirmPassword
    );
  }, [
    username,
    email,
    password,
    confirmPassword,
    usernameError,
    emailError,
    isEmailChecking,
    isPasswordValid,
  ]);

  // --- FUNÇÃO DE VERIFICAÇÃO DE EMAIL JÁ EXISTENTE ---
  const checkEmailExists = async (emailToCheck: string) => {
    const trimmed = emailToCheck?.trim();
    if (!trimmed) {
      setEmailError('');
      return;
    }

    // validação local de formato (rápida)
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError('Formato de e-mail inválido.');
      return;
    }

    if (!supabaseAdmin) {
      // se não tiver a service key no ambiente, pulamos a checagem (apenas dev)
      setEmailError('');
      return;
    }

    setIsEmailChecking(true);
    try {
      // chamamos listUsers sem filtros (tipagem do SDK costuma não aceitar 'filter' aqui)
      // e checamos localmente se o e-mail já existe.
      // OBS: isso não é ideal para grandes bases em produção — preferir endpoint server-side que use a Admin API com filtro.
      const res: any = await supabaseAdmin.auth.admin.listUsers();
      const users = (res?.data?.users) ?? (res?.users) ?? [];
      const exists = users.some((u: any) => {
        return !!u?.email && u.email.toLowerCase() === trimmed.toLowerCase();
      });

      if (exists) {
        setEmailError('Este e-mail já está em uso.');
      } else {
        setEmailError('');
      }
    } catch (err: any) {
      console.error('Erro inesperado na verificação de email:', err);
      // não expomos erro técnico ao usuário, apenas mensagem amigável
      setEmailError('Erro de verificação. Tente novamente.');
    } finally {
      setIsEmailChecking(false);
    }
  };

  // Chamado no onBlur do campo email
  const handleEmailChangeAndBlur = (text: string) => {
    setEmail(text);
    checkEmailExists(text);
  };

  const validateUsername = (text: string) => {
    setUsername(text);
    if (!text) {
      setUsernameError('');
      return;
    }
    if (text.trim() !== text) {
      setUsernameError('Não pode haver espaços no início ou fim.');
      return;
    }
    if (text.length < 5) {
      setUsernameError('Mínimo de 5 caracteres.');
      return;
    }
    if (text.length > 20) {
      setUsernameError('Máximo de 20 caracteres.');
      return;
    }
    // permite letras (unicode), números e espaços (no máximo um espaço consecutivo)
    if (/[^\p{L}0-9 ]/u.test(text)) {
      setUsernameError('Use apenas letras, números e espaços.');
      return;
    }
    if ((text.match(/ /g) || []).length > 1) {
      setUsernameError('Use no máximo um espaço.');
      return;
    }
    setUsernameError('');
  };

  const handlePasswordChange = (text: string) => {
    // filtrar apenas caracteres ASCII imprimíveis
    const filteredText = text.split('').filter(char => /^[ -~]+$/.test(char)).join('');
    setPassword(filteredText);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
  };

  const handleCreateAccount = async () => {
    if (!isFormValid) {
      Alert.alert('Formulário inválido', 'Por favor, corrija os erros e preencha todos os campos.');
      return;
    }

    if (!supabase) {
      Alert.alert('Erro de configuração', 'Supabase não está configurado corretamente no app.');
      return;
    }

    setLoading(true);
    try {
      // signUp: dependendo da versão do SDK, a assinatura pode variar.
      // Aqui usamos o padrão que costuma funcionar: passar email e password no primeiro objeto,
      // e outras opções (metadata) em options?.data.
      const resp = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            username: username.trim(),
          },
        },
      } as any); // cast para evitar mismatch de tipagem em diferentes versões do sdk

      const { data, error } = resp as any;

      if (error) {
        Alert.alert('Erro ao criar conta', error.message ?? String(error));
      } else if (data?.user) {
        // Navegação atualizada com email e password (apenas dev — evitar passar senha em params em prod)
        navigation.navigate('WaitConfirm', { email: email.trim(), password });
      } else {
        Alert.alert('Erro Inesperado', 'Não foi possível completar o cadastro. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro ao criar conta:', err);
      Alert.alert('Erro', err?.message ?? 'Erro desconhecido ao criar conta.');
    } finally {
      setLoading(false);
    }
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
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <Animated.View entering={FadeInDown.duration(500)} style={styles.modal}>
              <Text style={styles.title}>Crie sua conta</Text>
              <Text style={styles.subtitle}>Bem-vindo! Preencha os dados abaixo.</Text>

              {/* Campo Nome de Usuário */}
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome de usuário"
                  placeholderTextColor={COLORS.textTertiary}
                  autoCapitalize="none"
                  value={username}
                  onChangeText={validateUsername}
                  maxLength={25}
                />
              </View>
              {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}

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
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError(''); // limpa erro enquanto digita
                  }}
                  onBlur={() => handleEmailChangeAndBlur(email)}
                />
                {isEmailChecking && <ActivityIndicator color={COLORS.accentSecondary} />}
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
                  onChangeText={handlePasswordChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                  <Ionicons
                    name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textTertiary}
                  />
                </TouchableOpacity>
              </View>

              {/* Lógica de Requisitos de Senha e Confirmação */}
              {passwordFocused && !isPasswordValid && (
                <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={styles.requirementsContainer}>
                  <PasswordRequirementItem isValid={passwordRequirements.length} text="Pelo menos 8 caracteres" />
                  <PasswordRequirementItem isValid={passwordRequirements.hasUpper} text="Uma letra maiúscula" />
                  <PasswordRequirementItem isValid={passwordRequirements.hasLower} text="Uma letra minúscula" />
                  <PasswordRequirementItem isValid={passwordRequirements.hasNumber} text="Pelo menos um número" />
                  <PasswordRequirementItem isValid={passwordRequirements.hasSpecial} text="Um caractere especial (!@#...)" />
                </Animated.View>
              )}

              {isPasswordValid && (
                <Animated.View entering={FadeInDown} style={styles.inputWrapper}>
                  <Ionicons name="lock-closed" size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirme a senha"
                    placeholderTextColor={COLORS.textTertiary}
                    secureTextEntry={!passwordVisible}
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                  />
                </Animated.View>
              )}
              {isPasswordValid && password !== confirmPassword && confirmPassword.length > 0 && (
                <Animated.View entering={FadeInDown}>
                  <Text style={styles.errorText}>As senhas não coincidem.</Text>
                </Animated.View>
              )}

              <TouchableOpacity
                style={[styles.button, (!isFormValid || loading) && styles.buttonDisabled]}
                onPress={handleCreateAccount}
                disabled={!isFormValid || loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textPrimary} />
                ) : (
                  <Text style={styles.buttonText}>Criar Conta</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.registerText}>
                Já tem conta? <Text style={styles.registerLink} onPress={() => navigation.replace('LoginAccount')}>Entrar</Text>
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </BlurView>
    </ImageBackground>
  );
};

export default CreateAccountScreen;

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
  registerText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  registerLink: {
    color: COLORS.accentSecondary,
    fontFamily: FONTS.bodySemiBold,
  },
  errorText: {
    color: COLORS.error,
    fontFamily: FONTS.body,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 10,
    marginLeft: 15,
  },
  requirementsContainer: {
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontFamily: FONTS.body,
    fontSize: 13,
  },
});
