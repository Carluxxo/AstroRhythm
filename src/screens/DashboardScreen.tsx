// DashboardScreen.tsx (código completo corrigido)

import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, PlayerScreenParams } from "../navigation/types";
import { Image as ExpoImage } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Services and Components
import { getAPODData, ApodData } from "../services/apodService";
import ApodModal from "../components/ApodModal";
import Premium from "../components/Premium";
import { supabase } from "../services/supabaseClient";

// Importar dados (serão substituídos ou complementados)
import meditationJsonData from "../data/meditations.json";
import astronomicalEventsData from "../data/astronomical_events.json";

// --- Cores ---
const COLORS = {
  backgroundPrimary: "#050810",
  backgroundSecondary: "#111528",
  backgroundTertiary: "#1E2245",
  accentPrimary: "#8A4FFF",
  accentSecondary: "#4ECDC4",
  textPrimary: "#FFFFFF",
  textSecondary: "#E0E0E0",
  textTertiary: "#A0A0B0",
  error: "#FF6B6B",
};

// --- Fontes ---
const FONTS = {
  title: "SpaceGrotesk-Bold",
  titleMedium: "SpaceGrotesk-Medium",
  body: "Inter-Regular",
  bodyMedium: "Inter-Medium",
  bodySemiBold: "Inter-SemiBold",
};

interface Meditation {
  id: string;
  title: string;
  duration_seconds: number;
  audio_url: string;
  image_url?: string;
  is_premium: boolean;
  artist?: string;
}

interface AstronomicalEvent {
  id: string;
  title: string;
  date: string; // Formato YYYY-MM-DD
  description: string;
  type: string;
  image_url?: string;
}

const formatDayOfWeek = (dateString: string): string => {
  const date = new Date(dateString + "T00:00:00");
  const dayOfWeek = date.toLocaleDateString("pt-BR", { weekday: "long" });
  return dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
};

const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
};

type DashboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const route = useRoute();
  const [apodData, setApodData] = useState<ApodData | null>(null);
  const [apodLoading, setApodLoading] = useState(true);
  const [apodError, setApodError] = useState<string | null>(null);
  const [isApodModalVisible, setIsApodModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("Explorador");
  const [loadingUserName, setLoadingUserName] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Verificar se deve mostrar o modal Premium para novos usuários
  useEffect(() => {
    const checkShouldShowPremium = async () => {
      try {
        const shouldShow = await AsyncStorage.getItem('shouldShowPremium');
        if (shouldShow === 'true') {
          // Adicionar um pequeno delay para garantir que a UI esteja carregada
          setTimeout(() => {
            setShowPremiumModal(true);
          }, 1500);
          
          // Remover a flag para não mostrar novamente
          await AsyncStorage.removeItem('shouldShowPremium');
        }
      } catch (error) {
        console.error('Erro ao verificar se deve mostrar premium:', error);
      }
    };

    checkShouldShowPremium();
  }, []);

  // Função para buscar o nome do usuário
  const fetchUserName = useCallback(async () => {
    try {
      // Primeiro verifica se temos o nome em cache
      const cachedName = await AsyncStorage.getItem('userName');
      
      if (cachedName) {
        setUserName(cachedName);
        setLoadingUserName(false);
        return;
      }

      // Se não tem em cache, busca do banco de dados
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Busca os dados do usuário - usando método mais seguro
        const { data: userData, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .maybeSingle(); // Usando maybeSingle em vez de single

        if (error) {
          console.error('Erro ao buscar nome do usuário:', error);
          // Se não encontrar na tabela profiles, tenta pegar do user_metadata
          const username = session.user.user_metadata?.username || 'Explorador';
          setUserName(username);
          await AsyncStorage.setItem('userName', username);
        } else if (userData) {
          setUserName(userData.username);
          await AsyncStorage.setItem('userName', userData.username);
        } else {
          // Se não encontrar dados, usa user_metadata
          const username = session.user.user_metadata?.username || 'Explorador';
          setUserName(username);
          await AsyncStorage.setItem('userName', username);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar nome do usuário:', error);
      setUserName('Explorador');
    } finally {
      setLoadingUserName(false);
    }
  }, []);

  // Buscar o nome do usuário ao montar o componente
  useEffect(() => {
    fetchUserName();
  }, [fetchUserName]);

  const [currentDayInfo, setCurrentDayInfo] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState<AstronomicalEvent[]>([]);
  const [recommendedMeditations, setRecommendedMeditations] = useState<Meditation[]>([]);

  const fetchDashboardData = useCallback(async (forceRefreshApod = false) => {
    setApodLoading(true);
    setApodError(null);
    try {
      const data = await getAPODData();
      setApodData(data);
      if (!data && !forceRefreshApod) {
        setApodError(
          "Não foi possível carregar a Imagem Astronômica do Dia. Verifique o limite de requisições ou tente mais tarde."
        );
      }
    } catch (e) {
      console.error("Failed to fetch APOD:", e);
      setApodError("Falha ao carregar a Imagem Astronômica do Dia.");
    } finally {
      setApodLoading(false);
    }

    const now = new Date();
    setCurrentDayInfo(
      `${formatDayOfWeek(now.toISOString().split("T")[0])}, ${formatFullDate(
        now.toISOString().split("T")[0]
      )}`
    );

    try {
      const today = new Date().toISOString().split("T")[0];
      const sortedEvents = (
        astronomicalEventsData as {
          id: string;
          day: number;
          month: number;
          year: number;
          title: string;
          description: string;
          color: string;
  viewing_tips: string[];
        }[]
      )
        .map((event) => ({
          id: event.id,
          date: `${event.year}-${String(event.month).padStart(2, "0")}-${String(
            event.day
          ).padStart(2, "0")}`,
          title: event.title,
          description: event.description,
          type: event.color,
          viewing_tips: event.viewing_tips,
        }))
        .filter((event) => event.date >= today)
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      setUpcomingEvents(sortedEvents.slice(0, 2));
    } catch (e) {
      console.error("Failed to load upcoming events:", e);
    }

    try {
      const allMeditations = meditationJsonData as Meditation[];
      const nonPremiumMeditations = allMeditations.filter(
        (m) => !m.is_premium
      );
      const shuffled = nonPremiumMeditations.sort(() => 0.5 - Math.random());
      setRecommendedMeditations(shuffled.slice(0, 2));
    } catch (e) {
      console.error("Failed to load recommended meditations:", e);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData(true);
    setRefreshing(false);
  }, [fetchDashboardData]);

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err)
    );
  };

  const handleApodPress = () => {
    if (apodData) {
      setIsApodModalVisible(true);
    }
  };

  const renderApodSection = () => {
    if (apodLoading && !refreshing) {
      return (
        <View style={[styles.apodContainer, styles.skeletonContainer]}>
          <View
            style={[
              styles.skeletonText,
              { width: "70%", height: 22, marginBottom: 15 },
            ]}
          />
          <View
            style={[
              styles.skeletonImage,
              { height: 250, marginBottom: 15 },
            ]}
          />
          <View
            style={[
              styles.skeletonText,
              { width: "100%", height: 16, marginBottom: 6 },
            ]}
          />
          <View
            style={[
              styles.skeletonText,
              { width: "100%", height: 16, marginBottom: 6 },
            ]}
          />
          <View style={[styles.skeletonText, { width: "80%", height: 16 }]} />
        </View>
      );
    }
    if (apodError && !apodData) {
      return (
        <View style={styles.apodContainer}>
          <Text style={styles.errorText}>{apodError}</Text>
        </View>
      );
    }
    if (apodData) {
      return (
        <TouchableOpacity
          style={styles.apodContainer}
          onPress={handleApodPress}
          activeOpacity={0.8}
        >
          <Text style={styles.apodTitle}>
            {apodData.translated_title || apodData.title}
          </Text>
          {apodData.media_type === "image" ? (
            <ExpoImage
              source={{ uri: apodData.hdurl || apodData.url }}
              style={styles.apodImage}
              contentFit="cover"
            />
          ) : (
            <TouchableOpacity
              onPress={() => openLink(apodData.url)}
              style={styles.apodVideoPlaceholder}
            >
              <Ionicons
                name="play-circle-outline"
                size={60}
                color={COLORS.textSecondary}
              />
              <Text style={styles.apodVideoText}>
                Vídeo: {apodData.translated_title || apodData.title}
              </Text>
            </TouchableOpacity>
          )}
          <Text style={styles.apodExplanation} numberOfLines={3}>
            {apodData.translated_explanation || apodData.explanation}
          </Text>
          {apodData.copyright && (
            <Text style={styles.apodCopyright}>© {apodData.copyright}</Text>
          )}
        </TouchableOpacity>
      );
    }
    return (
      <View style={styles.apodContainer}>
        <Text style={styles.errorText}>
          Nenhuma imagem astronômica disponível no momento. Tente atualizar.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.textSecondary}
          />
        }
      >
        <View style={styles.header}>
          {loadingUserName ? (
            <ActivityIndicator size="small" color={COLORS.accentPrimary} />
          ) : (
            <Text style={styles.greeting}>Olá, {userName}</Text>
          )}
          <Text style={styles.date}>{currentDayInfo}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Imagem Astronômica do Dia</Text>
          {renderApodSection()}
        </View>

        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Próximos Eventos Cósmicos</Text>
            {upcomingEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => navigation.navigate("Calendar")}
              >
                <View style={styles.eventDate}>
                  <Text style={styles.eventDay}>
                    {new Date(event.date + "T00:00:00").getDate()}
                  </Text>
                  <Text style={styles.eventMonth}>
                    {new Date(event.date + "T00:00:00")
                      .toLocaleDateString("pt-BR", { month: "short" })
                      .toUpperCase()
                      .replace(".", "")}
                  </Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDescription} numberOfLines={1}>
                    {event.description}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={22}
                  color={COLORS.textTertiary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {recommendedMeditations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recomendado para Você</Text>
            <View style={styles.meditationGrid}>
              {recommendedMeditations.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.meditationCard}
                  onPress={() => {
                    const params: PlayerScreenParams = {
                      id: item.id,
                      title: item.title,
                      audio_url: item.audio_url,
                      image_url: item.image_url,
                      artist: item.artist || "AstroRhythm",
                    };
                    navigation.navigate("Player", params);
                  }}
                >
                  <View style={styles.meditationImageContainer}>
                    {item.image_url ? (
                      <ExpoImage
                        source={{ uri: item.image_url }}
                        style={styles.meditationImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.meditationImage,
                          {
                            backgroundColor: COLORS.backgroundTertiary,
                            justifyContent: "center",
                            alignItems: "center",
                          },
                        ]}
                      >
                        <Ionicons
                          name="musical-notes-outline"
                          size={40}
                          color={COLORS.textTertiary}
                        />
                      </View>
                    )}
                    <View style={styles.meditationOverlay} />
                  </View>
                  <View style={styles.meditationInfo}>
                    <Text style={styles.meditationTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.meditationDuration}>
                      {formatDuration(item.duration_seconds)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <ApodModal
        visible={isApodModalVisible}
        onClose={() => setIsApodModalVisible(false)}
        apodData={apodData}
      />

      {/* Modal Premium */}
      <Premium 
        visible={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
      />
    </View>
  );
};

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
    paddingBottom: 100,
  },
  header: {
    marginTop: Platform.OS === "ios" ? 50 : 40,
    marginBottom: 30,
  },
  greeting: {
    fontFamily: FONTS.title,
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
    marginBottom: 35,
  },
  sectionTitle: {
    fontFamily: FONTS.titleMedium,
    fontSize: 22,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  apodContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 20,
    padding: 20,
    minHeight: 150,
    justifyContent: "center",
  },
  apodTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 15,
    textAlign: "center",
  },
  apodImage: {
    width: "100%",
    aspectRatio: 16 / 10,
    borderRadius: 15,
    marginBottom: 15,
  },
  apodVideoPlaceholder: {
    width: "100%",
    aspectRatio: 16 / 10,
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: COLORS.backgroundTertiary,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  apodVideoText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  apodExplanation: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textTertiary,
    lineHeight: 24,
    textAlign: "left",
  },
  apodCopyright: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textTertiary,
    opacity: 0.7,
    marginTop: 12,
    fontStyle: "italic",
    alignSelf: "flex-end",
  },
  errorText: {
    fontFamily: FONTS.body,
    color: COLORS.error,
    textAlign: "center",
    fontSize: 15,
    paddingVertical: 20,
  },
  skeletonContainer: {
  },
  skeletonImage: {
    width: "100%",
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 15,
  },
  skeletonText: {
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 4,
    height: 16,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
    alignItems: "center",
  },
  eventDate: {
    alignItems: "center",
    marginRight: 18,
    width: 45,
  },
  eventDay: {
    fontFamily: FONTS.titleMedium,
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  eventMonth: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textTertiary,
    textTransform: "uppercase",
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
  meditationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  meditationCard: {
    width: "48%",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
  },
  meditationImageContainer: {
    width: "100%",
    aspectRatio: 1,
  },
  meditationImage: {
    width: "100%",
    height: "100%",
  },
  meditationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  meditationInfo: {
    padding: 12,
  },
  meditationTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  meditationDuration: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textTertiary,
  },
});

export default DashboardScreen;