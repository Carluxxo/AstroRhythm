import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Platform } from 'react-native'; // Added Platform
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { BlurView } from 'expo-blur'; // Import BlurView
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons

// Importar dados
import meditationJsonData from '../data/meditations.json';

// --- Cores (Reutilizando) ---
const COLORS = {
  backgroundPrimary: '#050810',
  backgroundSecondary: '#111528',
  backgroundTertiary: '#1E2245',
  accentPrimary: '#8A4FFF',
  accentSecondary: '#4ECDC4',
  accentTertiary: '#FF6B6B',
  accentQuaternary: '#F7B801',
  textPrimary: '#FFFFFF',
  textSecondary: '#E0E0E0',
  textTertiary: '#A0A0B0',
  borderSubtle: '#606075',
};

// --- Fontes (Reutilizando) ---
const FONTS = {
  title: 'SpaceGrotesk-Bold',
  titleMedium: 'SpaceGrotesk-Medium',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
};

// Interface para Meditação
interface Meditation {
  id: string;
  title: string;
  description: string;
  duration_seconds: number;
  category: string;
  audio_url: string;
  image_url?: string;
  is_premium: boolean;
  related_event_id?: string | null;
  related_event_type?: string | null;
}

// Função para formatar segundos
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
};

type LibraryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Library'>;

const LibraryScreen = () => {
  const navigation = useNavigation<LibraryScreenNavigationProp>();
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      const loadedMeditations = meditationJsonData as Meditation[];
      setMeditations(loadedMeditations);
      const uniqueCategories = Array.from(new Set(loadedMeditations.map(item => item.category)));
      setCategories(['Todos', ...uniqueCategories]);
      setError(null);
    } catch (e) {
      console.error("Failed to load meditations:", e);
      setError('Falha ao carregar meditações.');
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredMeditations = selectedCategory === 'Todos'
    ? meditations
    : meditations.filter(item => item.category === selectedCategory);

  const featuredMeditation = meditations.find(m => !m.is_premium);

  const handleMeditationPress = (item: Meditation) => {
    if (item.is_premium) {
      Alert.alert(
        'Conteúdo Premium',
        'Esta meditação é exclusiva para assinantes. Faça login ou assine para ter acesso!',
        [{ text: 'OK' }]
      );
    } else {
      navigation.navigate('Player', {
        title: item.title,
        duration: formatDuration(item.duration_seconds),
        audio_url: item.audio_url,
      });
    }
  };

  // --- Renderização --- 
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Biblioteca Cósmica</Text>
          <Text style={styles.subtitle}>Explore meditações inspiradas no universo</Text>
        </View>

        {/* Categorias */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category ? styles.categoryButtonActive : styles.categoryButtonInactive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category ? styles.categoryTextActive : styles.categoryTextInactive
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Meditação em destaque */}
        {loading ? (
          <View style={[styles.featuredCard, styles.skeletonContainer, { height: 350 }]}>
              <View style={[styles.skeletonImage, { height: 200, marginBottom: 15 }]} />
              <View style={[styles.skeletonText, { width: '60%', height: 20, marginBottom: 10 }]} />
              <View style={[styles.skeletonText, { width: '90%', height: 14, marginBottom: 6 }]} />
              <View style={[styles.skeletonText, { width: '80%', height: 14, marginBottom: 20 }]} />
              <View style={[styles.skeletonText, { width: '30%', height: 14, alignSelf: 'flex-start' }]} />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : featuredMeditation ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Em Destaque</Text>
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() => handleMeditationPress(featuredMeditation)}
            >
              <View style={styles.featuredImageContainer}>
                {/* Placeholder com Ícone */}
                <View style={[styles.featuredImage, {backgroundColor: COLORS.accentSecondary}]}>
                    <MaterialCommunityIcons name="star-four-points-outline" size={60} color={`${COLORS.backgroundPrimary}99`} />
                </View>
              </View>
              <View style={styles.featuredContent}>
                <Text style={styles.featuredTitle}>{featuredMeditation.title}</Text>
                <Text style={styles.featuredDescription} numberOfLines={3}>{featuredMeditation.description}</Text>
                <View style={styles.featuredFooter}>
                  <Text style={styles.featuredDuration}>{formatDuration(featuredMeditation.duration_seconds)}</Text>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => handleMeditationPress(featuredMeditation)}
                  >
                    <Ionicons name="play" size={16} color={COLORS.textPrimary} style={{ marginRight: 5 }} />
                    <Text style={styles.playButtonText}>Iniciar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Todas as meditações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{selectedCategory === 'Todos' ? 'Todas as Meditações' : `Meditações: ${selectedCategory}`}</Text>
          {loading ? (
             <ActivityIndicator size="small" color={COLORS.textPrimary} />
          ) : error ? (
             <Text style={styles.errorText}>{error}</Text>
          ) : (
            <View style={styles.meditationGrid}>
              {filteredMeditations.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.meditationCard}
                  onPress={() => handleMeditationPress(item)}
                >
                  <View style={styles.meditationImageContainer}>
                     {/* Placeholder com Ícone */}
                     <View style={[styles.meditationImage, {backgroundColor: COLORS.backgroundTertiary}]}>
                       <MaterialCommunityIcons name="meditation" size={40} color={`${COLORS.textTertiary}99`} />
                     </View>
                     {item.is_premium && (
                        <View style={styles.premiumBadge}>
                            <Ionicons name="star" size={12} color={COLORS.accentQuaternary} />
                        </View>
                     )}
                  </View>
                  <View style={styles.meditationInfo}>
                    <Text style={styles.meditationTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.meditationDuration}>{formatDuration(item.duration_seconds)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
               {filteredMeditations.length === 0 && !loading && (
                  <Text style={styles.noItemsText}>Nenhuma meditação encontrada nesta categoria.</Text>
               )}
            </View>
          )}
        </View>

      </ScrollView>

      {/* Navegação inferior (Reutilizar) */}
       <BlurView intensity={90} tint="dark" style={styles.navbarContainer}>
         <View style={styles.navbar}>
           <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}> 
             <Ionicons name="home-outline" size={24} color={COLORS.textTertiary} />
             <Text style={styles.navText}>Início</Text>
           </TouchableOpacity>
           {/* Item Ativo */}
           <TouchableOpacity style={styles.navItem}>
             <View style={styles.navItemActiveIndicator} />
             <Ionicons name="library" size={24} color={COLORS.accentPrimary} />
             <Text style={[styles.navText, styles.navTextActive]}>Biblioteca</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Calendar')}> 
             <Ionicons name="calendar-outline" size={24} color={COLORS.textTertiary} />
             <Text style={styles.navText}>Eventos</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.navItem} disabled> 
             <Ionicons name="person-outline" size={24} color={COLORS.textTertiary} />
             <Text style={styles.navText}>Perfil</Text>
           </TouchableOpacity>
         </View>
       </BlurView>
    </View>
  );
};

// --- Estilos Refinados ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
      padding: 20,
      paddingBottom: 100, // Espaço para navbar
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 50 : 40,
    marginBottom: 30,
  },
  title: {
    fontFamily: FONTS.title,
    fontSize: 28,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.textTertiary,
  },
  // --- Categorias --- 
  categoriesContainer: {
    marginBottom: 30,
    marginHorizontal: -20, // Para scroll ir até a borda
  },
  categoriesContent: {
    paddingHorizontal: 20, // Padding interno do scroll
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20, // Pill shape
  },
  categoryButtonActive: {
    backgroundColor: COLORS.accentPrimary,
  },
  categoryButtonInactive: {
    backgroundColor: COLORS.backgroundSecondary,
    // borderWidth: 1, // Remover borda, usar fundo diferente
    // borderColor: COLORS.accentPrimary,
  },
  categoryText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
  },
  categoryTextActive: {
    color: COLORS.textPrimary,
  },
  categoryTextInactive: {
    color: COLORS.textTertiary,
  },
  // --- Seções e Títulos --- 
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontFamily: FONTS.titleMedium,
    fontSize: 22,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  // --- Card em Destaque --- 
  featuredCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  featuredImageContainer: {
      height: 220,
      backgroundColor: COLORS.backgroundTertiary,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredContent: {
    padding: 20,
  },
  featuredTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 20,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  featuredDescription: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textTertiary,
    marginBottom: 20,
    lineHeight: 22,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredDuration: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.textTertiary,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentPrimary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    // Sombra
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  playButtonText: {
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  // --- Grid de Meditações --- 
  meditationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  meditationCard: {
    width: '48%',
    aspectRatio: 1, // Manter quadrado
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: COLORS.backgroundSecondary,
    position: 'relative', // Para o overlay e badge
  },
  meditationImageContainer: {
      flex: 1,
      backgroundColor: COLORS.backgroundTertiary,
  },
  meditationImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBadge: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: `${COLORS.backgroundPrimary}99`,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 3,
      flexDirection: 'row',
      alignItems: 'center',
  },
  meditationInfo: {
    padding: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // Adicionar gradiente sutil para melhor contraste?
    // backgroundColor: 'rgba(5, 8, 16, 0.6)',
  },
  meditationTitle: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  meditationDuration: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  // --- Navbar (Reutilizado) --- 
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 75,
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
    borderTopWidth: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  navItemActiveIndicator: {
      position: 'absolute',
      top: 8,
      width: 24,
      height: 3,
      backgroundColor: COLORS.accentPrimary,
      borderRadius: 2,
  },
  navIcon: {
    // Ícones são usados diretamente
    marginBottom: 5,
  },
  navText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  navTextActive: {
    color: COLORS.accentPrimary,
  },
  // --- Outros --- 
  errorText: {
    fontFamily: FONTS.body,
    color: COLORS.accentTertiary,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 15,
  },
  noItemsText: {
      fontFamily: FONTS.body,
      color: COLORS.textTertiary,
      opacity: 0.8,
      textAlign: 'center',
      marginTop: 15,
      width: '100%',
      fontSize: 15,
  },
  // --- Skeleton --- 
  skeletonContainer: {
      backgroundColor: COLORS.backgroundSecondary,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
  },
  skeletonText: {
      backgroundColor: COLORS.backgroundTertiary,
      borderRadius: 4,
      opacity: 0.8,
  },
  skeletonImage: {
      backgroundColor: COLORS.backgroundTertiary,
      borderRadius: 15,
      opacity: 0.8,
  },
});

export default LibraryScreen;

