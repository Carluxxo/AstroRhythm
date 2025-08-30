import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons, Feather } from '@expo/vector-icons';
import { supabase } from '../services/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Cores ---
const COLORS = {
  backgroundPrimary: '#050810',
  backgroundSecondary: '#111528',
  backgroundTertiary: '#1E2245',
  accentPrimary: '#8A4FFF',
  accentSecondary: '#4ECDC4',
  textPrimary: '#FFFFFF',
  textSecondary: '#E0E0E0',
  textTertiary: '#A0A0B0',
  error: '#FF6B6B',
};

// --- Fontes ---
const FONTS = {
  title: 'SpaceGrotesk-Bold',
  titleMedium: 'SpaceGrotesk-Medium',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
};

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    userName: "Explorador Cósmico",
    joinDate: "Carregando...",
    meditationsCompleted: 12,
    timeMeditating: "3h 45min"
  });

  // Função para formatar a data com inicial do mês maiúscula
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    let formatted = date.toLocaleDateString('pt-BR', options);
    // Coloca a inicial do mês maiúscula
    formatted = formatted.replace(/^([a-zà-ú])/i, (match) => match.toUpperCase());
    // Troca "Mês de Ano" por "Mês, Ano"
    formatted = formatted.replace(/ de /i, ', ');
    return `Desde: ${formatted}`;
  };

  // Buscar dados do usuário ao carregar a tela
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Buscar dados do usuário do AsyncStorage
        const cachedUserData = await AsyncStorage.getItem('userProfileData');
        if (cachedUserData) {
          setUserData(JSON.parse(cachedUserData));
        }
        
        // Buscar dados do Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Buscar username da tabela profiles
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username, created_at')
            .eq('id', session.user.id)
            .single();

          if (!profileError && profileData) {
            const newUserData = {
              userName: profileData.username || "Explorador Cósmico",
              joinDate: formatJoinDate(profileData.created_at || session.user.created_at),
              meditationsCompleted: 12,
              timeMeditating: "3h 45min"
            };
            
            setUserData(newUserData);
            await AsyncStorage.setItem('userProfileData', JSON.stringify(newUserData));
          } else {
            // Fallback para user_metadata se profiles não existir
            const newUserData = {
              userName: session.user.user_metadata?.username || "Explorador Cósmico",
              joinDate: formatJoinDate(session.user.created_at),
              meditationsCompleted: 12,
              timeMeditating: "3h 45min"
            };
            
            setUserData(newUserData);
            await AsyncStorage.setItem('userProfileData', JSON.stringify(newUserData));
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };
    
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // 1. Fazer logout do Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
        console.error('Erro no logout:', error.message);
        return;
      }
      
      // 2. Limpar TODO o cache do AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys();
      
      // Filtrar chaves que NÃO devem ser removidas (se houver alguma)
      const keysToRemove = allKeys.filter(key => 
        !key.startsWith('ExpoImage') && // Mantém cache do Expo Image
        !key.startsWith('@expo') // Mantém outras chaves do Expo se necessário
      );
      
      // Remover todas as chaves selecionadas
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
      
      console.log('Cache limpo com sucesso. Chaves removidas:', keysToRemove);
      
    } catch (err) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado ao fazer logout.');
      console.error('Erro no logout:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Sair da Conta",
      "Tem certeza que deseja sair da sua conta? Todos os dados locais serão removidos.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Sair", 
          onPress: handleLogout,
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Meu Perfil</Text>
          <View style={{width: 28}} />
        </View>

        <View style={styles.profileHeaderContainer}>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={60} color={COLORS.accentPrimary} />
          </View>
          <Text style={styles.userName}>{userData.userName}</Text>
          <Text style={styles.joinDate}>{userData.joinDate}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.meditationsCompleted}</Text>
            <Text style={styles.statLabel}>Meditações Concluídas</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.timeMeditating}</Text>
            <Text style={styles.statLabel}>Tempo Meditando</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => alert('Configurações da Conta (Em Breve)')}>
            <Feather name="settings" size={22} color={COLORS.textSecondary} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Configurações da Conta</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => alert('Preferências (Em Breve)')}>
            <Feather name="sliders" size={22} color={COLORS.textSecondary} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Preferências</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => alert('Ajuda e Suporte (Em Breve)')}>
            <Feather name="help-circle" size={22} color={COLORS.textSecondary} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Ajuda e Suporte</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, loading && styles.logoutButtonDisabled]} 
          onPress={confirmLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.error} />
          ) : (
            <>
              <Feather name="log-out" size={20} color={COLORS.error} style={styles.menuIcon} />
              <Text style={styles.logoutButtonText}>Sair da Conta</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
  },
  scrollContentContainer: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: Platform.OS === 'ios' ? 50 : 40,
    marginBottom: 20,
    height: 50,
  },
  backButton: {
    padding: 5,
  },
  pageTitle: {
    fontFamily: FONTS.titleMedium,
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  profileHeaderContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundSecondary,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: COLORS.accentPrimary,
  },
  userName: {
    fontFamily: FONTS.title,
    fontSize: 24,
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  joinDate: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textTertiary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: 20,
    marginHorizontal: 20,
    borderRadius: 15,
    marginTop: 25,
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: FONTS.titleMedium,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  statSeparator: {
    width: 1,
    height: '70%',
    backgroundColor: COLORS.backgroundTertiary,
    alignSelf: 'center',
  },
  menuSection: {
    marginHorizontal: 20,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 25,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundTertiary,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuItemText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 16,
    color: COLORS.textSecondary,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.error + '80',
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutButtonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: COLORS.error,
    marginLeft: 8,
  },
});

export default ProfileScreen;