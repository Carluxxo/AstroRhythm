import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Linking, Platform } from 'react-native'; // Added Platform
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { BlurView } from 'expo-blur'; // Import BlurView for glassmorphism

// Importar dados das meditações
import meditationJsonData from '../data/meditations.json';

// --- Novas Cores ---
const COLORS = {
  backgroundPrimary: '#050810', // Azul Meia-Noite Muito Escuro
  backgroundSecondary: '#111528', // Azul Marinho Escuro
  backgroundTertiary: '#1E2245', // Índigo Escuro
  accentPrimary: '#8A4FFF', // Roxo Elétrico
  accentSecondary: '#4ECDC4', // Turquesa Brilhante
  accentTertiary: '#FF6B6B', // Coral Vivo
  accentQuaternary: '#F7B801', // Dourado Cósmico
  textPrimary: '#FFFFFF', // Branco Puro
  textSecondary: '#E0E0E0', // Branco Gelo
  textTertiary: '#A0A0B0', // Cinza Claro Azulado
  borderSubtle: '#606075', // Cinza Médio Azulado
};

// --- Novas Fontes (Assumindo que foram carregadas) ---
const FONTS = {
  title: 'SpaceGrotesk-Bold', // Exemplo de nome pós-carregamento
  titleMedium: 'SpaceGrotesk-Medium',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
};

// Interface para APOD
interface ApodData {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  service_version: string;
  title: string;
  url: string;
  copyright?: string;
}

// Interface para Meditação
interface Meditation {
  id: string;
  title: string;
  duration_seconds: number;
  audio_url: string;
  image_url?: string;
  is_premium: boolean;
}

// Função para formatar segundos
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
};

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

const NASA_API_KEY = 'DEMO_KEY';
const APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const [apodData, setApodData] = useState<ApodData | null>(null);
  const [apodLoading, setApodLoading] = useState(true);
  const [apodError, setApodError] = useState<string | null>(null);
  const [meditations, setMeditations] = useState<Meditation[]>([]);

  useEffect(() => {
    try {
      setMeditations(meditationJsonData.filter(m => !m.is_premium).slice(0, 2) as Meditation[]);
    } catch (e) {
      console.error("Failed to load meditations for dashboard:", e);
    }
  }, []);

  useEffect(() => {
    const fetchApod = async () => {
      setApodLoading(true);
      setApodError(null);
      try {
        const response = await fetch(APOD_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ApodData = await response.json();
        setApodData(data);
      } catch (e) {
        console.error("Failed to fetch APOD:", e);
        setApodError('Falha ao carregar a Imagem Astronômica do Dia.');
      } finally {
        setApodLoading(false);
      }
    };
    fetchApod();
  }, []);

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, Explorador</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>

        {/* APOD */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Imagem Astronômica do Dia</Text>
          {apodLoading ? (
            // Placeholder/Skeleton enquanto carrega
            <View style={[styles.apodContainer, styles.skeletonContainer]}>
                 <View style={[styles.skeletonText, { width: '70%', height: 22, marginBottom: 15 }]} />
                 <View style={[styles.skeletonImage, { height: 250, marginBottom: 15 }]} />
                 <View style={[styles.skeletonText, { width: '100%', height: 16, marginBottom: 6 }]} />
                 <View style={[styles.skeletonText, { width: '100%', height: 16, marginBottom: 6 }]} />
                 <View style={[styles.skeletonText, { width: '80%', height: 16 }]} />
            </View>
          ) : apodError ? (
            <View style={styles.apodContainer}><Text style={styles.errorText}>{apodError}</Text></View>
          ) : apodData ? (
            <View style={styles.apodContainer}>
              <Text style={styles.apodTitle}>{apodData.title}</Text>
              {apodData.media_type === 'image' ? (
                <Image source={{ uri: apodData.url }} style={styles.apodImage} resizeMode="cover" />
              ) : (
                <TouchableOpacity onPress={() => openLink(apodData.url)} style={styles.apodVideoPlaceholder}>
                   {/* Ícone de Play poderia ser adicionado aqui */}
                  <Text style={styles.apodVideoText}>Vídeo: {apodData.title} (Clique para assistir)</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.apodExplanation} numberOfLines={4}>{apodData.explanation}</Text>
              {apodData.copyright && <Text style={styles.apodCopyright}>© {apodData.copyright}</Text>}
            </View>
          ) : null}
        </View>

        {/* Player em destaque - Simplificado visualmente por enquanto */}
        <TouchableOpacity
          style={styles.featuredPlayer}
          onPress={() => navigation.navigate('Player', {
            title: 'Nebulosa de Órion',
            duration: '15 min',
            audio_url: 'placeholder' // Precisa de URL real
          })}
        >
           <View style={styles.playerVisualization}> 
             {/* Placeholder para visualização futura */}
             <Text style={styles.placeholderTextLarge}>Visualização</Text>
           </View>
           <Text style={styles.playerTitle}>Nebulosa de Órion</Text>
           <Text style={styles.playerSubtitle}>Meditação guiada • 15 min</Text>
           {/* Controles simplificados */}
           <View style={styles.playButtonContainer}>
             <TouchableOpacity style={styles.playButtonLarge}>
               <Text style={styles.playIconLarge}>▶</Text>
             </TouchableOpacity>
           </View>
        </TouchableOpacity>

        {/* Próximos eventos */}
         <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos Eventos Cósmicos</Text>
          {/* Exemplo de Card de Evento Refinado */} 
          <TouchableOpacity style={styles.eventCard} onPress={() => navigation.navigate('Calendar')}>
            <View style={styles.eventDate}><Text style={styles.eventDay}>25</Text><Text style={styles.eventMonth}>ABR</Text></View>
            <View style={styles.eventInfo}><Text style={styles.eventTitle}>Chuva de Meteoros Líridas</Text><Text style={styles.eventDescription}>Meditação especial disponível</Text></View>
            {/* Ícone de seta ou chevron */}
            <Text style={styles.eventArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.eventCard} onPress={() => navigation.navigate('Calendar')}>
            <View style={styles.eventDate}><Text style={styles.eventDay}>30</Text><Text style={styles.eventMonth}>ABR</Text></View>
            <View style={styles.eventInfo}><Text style={styles.eventTitle}>Lua Nova</Text><Text style={styles.eventDescription}>Perfeito para meditação profunda</Text></View>
            <Text style={styles.eventArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Meditações recomendadas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recomendado para Você</Text>
          {meditations.length > 0 ? (
            <View style={styles.meditationGrid}>
              {meditations.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.meditationCard}
                  onPress={() => navigation.navigate('Player', {
                    title: item.title,
                    duration: formatDuration(item.duration_seconds),
                    audio_url: item.audio_url,
                  })}
                >
                  <View style={styles.meditationImageContainer}>
                    {/* Placeholder para imagem com overlay */}
                    <View style={[styles.meditationImage, {backgroundColor: COLORS.backgroundTertiary}]}>
                      <Text style={styles.placeholderTextSmall}>{item.title.split(' ').pop()}</Text>
                    </View>
                    <View style={styles.meditationOverlay} />
                  </View>
                  <View style={styles.meditationInfo}>
                    <Text style={styles.meditationTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.meditationDuration}>{formatDuration(item.duration_seconds)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noMeditationsText}>Carregando recomendações...</Text>
          )}
        </View>

      </ScrollView>

      {/* Navegação inferior com Glassmorphism */}
       <BlurView intensity={90} tint="dark" style={styles.navbarContainer}>
         <View style={styles.navbar}>
           {/* Ícone Ativo */}
           <TouchableOpacity style={styles.navItem}>
             <View style={styles.navItemActiveIndicator} />
             <Ionicons name="home" size={24} color={COLORS.accentPrimary} style={styles.navIcon} />
             <Text style={[styles.navText, styles.navTextActive]}>Início</Text>
           </TouchableOpacity>
           {/* Ícones Inativos */}
           <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Library')}> 
             <Ionicons name="library-outline" size={24} color={COLORS.textTertiary} style={styles.navIcon} />
             <Text style={styles.navText}>Biblioteca</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Calendar')}>
             <Ionicons name="calendar-outline" size={24} color={COLORS.textTertiary} style={styles.navIcon} />
             <Text style={styles.navText}>Eventos</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.navItem} disabled> 
             <Ionicons name="person-outline" size={24} color={COLORS.textTertiary} style={styles.navIcon} />
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
      paddingBottom: 100, // Espaço extra para navbar flutuante
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 50 : 40, // Ajuste para StatusBar
    marginBottom: 30,
  },
  greeting: {
    fontFamily: FONTS.title, // Aplicar fonte
    fontSize: 28,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  date: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.textTertiary,
  },
  section: {
    marginBottom: 35, // Aumentar espaçamento entre seções
  },
  sectionTitle: {
    fontFamily: FONTS.titleMedium,
    fontSize: 22,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  // --- Estilos APOD Refinados ---
  apodContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 20, // Aumentar arredondamento
    padding: 20,
    // Sombra sutil (opcional, pode pesar performance)
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 10,
    // elevation: 3,
  },
  apodTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 15,
    textAlign: 'center',
  },
  apodImage: {
    width: '100%',
    aspectRatio: 16 / 10, // Proporção mais comum
    borderRadius: 15,
    marginBottom: 15,
  },
  apodVideoPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: COLORS.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  apodVideoText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  apodExplanation: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textTertiary,
    lineHeight: 24, // Aumentar espaçamento entre linhas
    textAlign: 'left',
    width: '100%',
  },
  apodCopyright: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textTertiary,
    opacity: 0.7,
    marginTop: 12,
    fontStyle: 'italic',
    alignSelf: 'flex-end',
  },
  errorText: {
    fontFamily: FONTS.body,
    color: COLORS.accentTertiary,
    textAlign: 'center',
    fontSize: 15,
    paddingVertical: 20,
  },
  // --- Estilos Player em Destaque Refinados ---
  featuredPlayer: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 20,
    padding: 25,
    marginBottom: 35,
    alignItems: 'center', // Centralizar conteúdo
  },
  playerVisualization: {
    height: 150, // Reduzir um pouco
    width: '100%',
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 15,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderTextLarge: {
      fontFamily: FONTS.bodyMedium,
      color: COLORS.textTertiary,
      fontSize: 16,
      opacity: 0.5,
  },
  playerTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  playerSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textTertiary,
    marginBottom: 25,
  },
  playButtonContainer: {
      // Container para o botão de play
  },
  playButtonLarge: {
    backgroundColor: COLORS.accentPrimary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra para destaque
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  playIconLarge: {
    fontSize: 28,
    color: COLORS.textPrimary,
    marginLeft: 3, // Ajuste visual do ícone
  },

  // --- Estilos Eventos Refinados ---
  eventCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSecondary, // Fundo sólido
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
    alignItems: 'center',
  },
  eventDate: {
    alignItems: 'center',
    marginRight: 18,
    width: 45,
  },
  eventDay: {
    fontFamily: FONTS.titleMedium, // Fonte mais destacada
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  eventMonth: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  eventDescription: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textTertiary,
  },
  eventArrow: {
      fontSize: 24,
      color: COLORS.textTertiary,
      marginLeft: 10,
  },

  // --- Estilos Meditações Recomendadas Refinados ---
  meditationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Permitir quebra de linha se necessário
    justifyContent: 'space-between',
  },
  meditationCard: {
    width: '48%',
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundSecondary,
  },
  meditationImageContainer: {
      aspectRatio: 1, // Manter quadrado
      position: 'relative',
  },
  meditationImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderTextSmall: {
      fontFamily: FONTS.bodyMedium,
      color: COLORS.textTertiary,
      fontSize: 14,
      opacity: 0.5,
  },
  meditationOverlay: { // Overlay para contraste do texto
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(5, 8, 16, 0.2)', // Overlay escuro sutil
  },
  meditationInfo: {
    padding: 12,
  },
  meditationTitle: {
    fontFamily: FONTS.bodyMedium, // Usar Medium
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  meditationDuration: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  noMeditationsText: {
      fontFamily: FONTS.body,
      color: COLORS.textTertiary,
      opacity: 0.8,
      marginTop: 10,
      textAlign: 'center',
      width: '100%',
  },

  // --- Estilos Navbar Refinados com Glassmorphism ---
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // O BlurView cuida do fundo
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 75, // Aumentar altura
    paddingBottom: Platform.OS === 'ios' ? 10 : 0, // Padding inferior para safe area
    // Sem backgroundColor aqui, o BlurView faz o efeito
    borderTopWidth: 0, // Remover borda superior, o blur define a separação
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Distribuir espaço igualmente
    height: '100%',
    position: 'relative', // Para o indicador ativo
  },
  navItemActiveIndicator: { // Indicador sutil para item ativo
      position: 'absolute',
      top: 8,
      width: 24,
      height: 3,
      backgroundColor: COLORS.accentPrimary,
      borderRadius: 2,
  },
  navIcon: {
    fontSize: 26, // Aumentar ícone
    color: COLORS.textTertiary, // Cor padrão inativa
    marginBottom: 5,
  },
  navIconActive: {
    color: COLORS.accentPrimary, // Cor ativa
  },
  navText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 11, // Levemente menor
    color: COLORS.textTertiary, // Cor padrão inativa
  },
  navTextActive: {
    color: COLORS.accentPrimary, // Cor ativa
  },

  // --- Estilos Skeleton ---
  skeletonContainer: {
      // Usa o estilo do container normal (apodContainer)
  },
  skeletonText: {
      backgroundColor: COLORS.backgroundTertiary, // Cor do skeleton
      borderRadius: 4,
      opacity: 0.8,
      // Adicionar animação shimmer aqui se desejado
  },
  skeletonImage: {
      backgroundColor: COLORS.backgroundTertiary,
      borderRadius: 15, // Mesmo do apodImage
      opacity: 0.8,
  },
});

export default DashboardScreen;

