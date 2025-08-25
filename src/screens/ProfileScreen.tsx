import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons, Feather } from '@expo/vector-icons'; // Feather for more icon options

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

  // Placeholder data
  const userName = "Explorador Cósmico";
  const meditationsCompleted = 12;
  const timeMeditating = "3h 45min";
  const joinDate = "Desde Abril, 2025";

  const handleLogout = () => {
    // Simulate logout - In a real app, clear tokens, navigate to Auth flow
    console.log("Logout pressed");
    navigation.navigate('Dashboard'); // Or a Login screen if it existed
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
          <View style={{width: 28}} />{/* Spacer for centering title */}
        </View>

        <View style={styles.profileHeaderContainer}>
          <View style={styles.avatarContainer}>
            {/* Placeholder for Avatar Image - using an icon for now */}
            <Feather name="user" size={60} color={COLORS.accentPrimary} />
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.joinDate}>{joinDate}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{meditationsCompleted}</Text>
            <Text style={styles.statLabel}>Meditações Concluídas</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{timeMeditating}</Text>
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

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={COLORS.error} style={styles.menuIcon} />
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>

      </ScrollView>
      {/* CustomBottomNavbar is rendered by AppNavigator */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
  },
  scrollContentContainer: {
    paddingBottom: 120, // Space for navbar and some breathing room
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
  logoutButtonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: COLORS.error,
    marginLeft: 8,
  },
});

export default ProfileScreen;

