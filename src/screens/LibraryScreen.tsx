import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, PlayerScreenParams } from "../navigation/types"; // Ensure PlayerScreenParams is defined
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import meditationJsonData from "../data/meditations.json";
import { usePlayer, Track } from "../contexts/PlayerContext";

const COLORS = {
  backgroundPrimary: "#050810",
  backgroundSecondary: "#111528",
  backgroundTertiary: "#1E2245",
  accentPrimary: "#8A4FFF",
  accentSecondary: "#4ECDC4",
  accentTertiary: "#FF6B6B",
  accentQuaternary: "#F7B801",
  textPrimary: "#FFFFFF",
  textSecondary: "#E0E0E0",
  textTertiary: "#A0A0B0",
  borderSubtle: "#606075",
  error: "#FF6B6B",
};

const FONTS = {
  title: "SpaceGrotesk-Bold",
  titleMedium: "SpaceGrotesk-Medium",
  body: "Inter-Regular",
  bodyMedium: "Inter-Medium",
  bodySemiBold: "Inter-SemiBold",
};

interface Meditation extends Track {
  description: string;
  duration_seconds: number;
  category: string;
  is_premium: boolean;
  related_event_id?: string | null;
  related_event_type?: string | null;
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
};

type LibraryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Library"
>;

const LibraryScreen = () => {
  const navigation = useNavigation<LibraryScreenNavigationProp>();
  const {
    currentTrack,
    playTrack,
    isPlaying,
    isFavorite,
    toggleFavorite,
    loadFavorites,
  } = usePlayer();
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [categories, setCategories] = useState<string[]>(["Todos"]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // No need for localFavorites state if isFavorite from context is reactive enough

  // Load initial data and favorites
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        await loadFavorites(); // Ensure favorites are loaded from storage via context
        const loadedMeditations = meditationJsonData.map(m => ({
          ...m,
          audio_url: m.audio_url || "", // Ensure audio_url is always a string
          duration_seconds: m.duration_seconds || 0,
        })) as Meditation[];
        setMeditations(loadedMeditations);
        const uniqueCategories = Array.from(
          new Set(loadedMeditations.map(item => item.category))
        );
        setCategories(["Todos", ...uniqueCategories, "Favoritos"]);
        setError(null);
      } catch (e) {
        console.error("Failed to load meditations:", e);
        setError("Falha ao carregar meditações.");
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [loadFavorites]);

  // Refresh favorites when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const filteredMeditations = useMemo(() => {
    if (selectedCategory === "Todos") return meditations;
    if (selectedCategory === "Favoritos") {
      return meditations.filter(med => isFavorite(med.id));
    }
    return meditations.filter(item => item.category === selectedCategory);
  }, [meditations, selectedCategory, isFavorite, currentTrack, isPlaying]); // Added currentTrack and isPlaying to re-render if playing status changes for indicators

  const featuredMeditation = useMemo(() => {
    return (
      meditations.find(m => !m.is_premium && m.id === "med_003") ||
      meditations.find(m => !m.is_premium)
    );
  }, [meditations]);

  const handleMeditationPress = (item: Meditation) => {
    if (item.is_premium) {
      Alert.alert(
        "Conteúdo Premium",
        "Esta meditação é exclusiva para assinantes AstroRhythm Premium. Desbloqueie o acesso a todo o nosso catálogo cósmico!",
        [{ text: "Entendido" }]
      );
    } else {
      const params: PlayerScreenParams = {
        id: item.id,
        title: item.title,
        audio_url: item.audio_url,
        image_url: item.image_url,
        artist: item.artist || "AstroRhythm",
      };
      navigation.navigate("Player", params);
    }
  };

  const handleToggleFavorite = async (track: Meditation) => {
    // Ensure the track object passed to toggleFavorite is complete as per Track interface
    const trackDataForFavorite: Track = {
        id: track.id,
        title: track.title,
        audio_url: track.audio_url,
        image_url: track.image_url,
        artist: track.artist,
        duration: track.duration_seconds, // Pass duration if available
    };
    await toggleFavorite(trackDataForFavorite);
    // Re-filter or re-render will be handled by useMemo and state updates from context
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item
          ? styles.categoryButtonActive
          : styles.categoryButtonInactive,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item
            ? styles.categoryTextActive
            : styles.categoryTextInactive,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderMeditationItem = ({ item }: { item: Meditation }) => (
    <TouchableOpacity
      style={styles.meditationCard}
      onPress={() => handleMeditationPress(item)}
    >
      <View style={styles.meditationImageContainer}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.meditationImage}
            resizeMode="cover"
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
            <MaterialCommunityIcons
              name="meditation"
              size={40}
              color={`${COLORS.textTertiary}99`}
            />
          </View>
        )}
        {item.is_premium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={12} color={COLORS.accentQuaternary} />
          </View>
        )}
        {currentTrack?.id === item.id && isPlaying && (
          <View style={styles.playingIndicator}>
            <Ionicons name="musical-notes" size={14} color={COLORS.accentSecondary} />
            <Text style={styles.playingIndicatorText}>Tocando</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleToggleFavorite(item)}
        >
          <Ionicons
            name={isFavorite(item.id) ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite(item.id) ? COLORS.accentTertiary : COLORS.textTertiary}
          />
        </TouchableOpacity>
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
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centeredLoading]}>
        <ActivityIndicator size="large" color={COLORS.accentPrimary} />
        <Text style={{ color: COLORS.textSecondary, marginTop: 10, fontFamily: FONTS.body }}>
          Carregando sua biblioteca...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centeredLoading]}>
        <Ionicons name="cloud-offline-outline" size={60} color={COLORS.accentTertiary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadFavorites} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        stickyHeaderIndices={[1]} // Index of the categories container
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Biblioteca Cósmica</Text>
          <Text style={styles.subtitle}>
            Explore meditações e sons para sua jornada interior
          </Text>
        </View>

        {/* Sticky Categories Header */}
        <View style={styles.stickyCategoriesContainer}>
          <FlatList
            horizontal
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          />
        </View>

        {selectedCategory === "Todos" && featuredMeditation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Em Destaque</Text>
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() => handleMeditationPress(featuredMeditation)}
            >
              <View style={styles.featuredImageContainer}>
                {featuredMeditation.image_url ? (
                  <Image
                    source={{ uri: featuredMeditation.image_url }}
                    style={styles.featuredImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.featuredImage,
                      {
                        backgroundColor: COLORS.accentSecondary,
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="star-four-points-outline"
                      size={60}
                      color={`${COLORS.backgroundPrimary}99`}
                    />
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.favoriteButton, styles.favoriteButtonFeatured]}
                  onPress={() => handleToggleFavorite(featuredMeditation)}
                >
                  <Ionicons
                    name={isFavorite(featuredMeditation.id) ? "heart" : "heart-outline"}
                    size={26}
                    color={isFavorite(featuredMeditation.id) ? COLORS.accentTertiary : COLORS.textPrimary}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.featuredContent}>
                <Text style={styles.featuredTitle}>{featuredMeditation.title}</Text>
                <Text style={styles.featuredDescription} numberOfLines={2}>
                  {featuredMeditation.description}
                </Text>
                <View style={styles.featuredFooter}>
                  <Text style={styles.featuredDuration}>
                    {formatDuration(featuredMeditation.duration_seconds)}
                  </Text>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => handleMeditationPress(featuredMeditation)}
                  >
                    <Ionicons name="play-circle-outline" size={20} color={COLORS.textPrimary} style={{ marginRight: 6 }} />
                    <Text style={styles.playButtonText}>Ouvir Agora</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === "Todos"
              ? "Todas as Jornadas"
              : selectedCategory === "Favoritos"
              ? "Seus Favoritos"
              : `Explorando ${selectedCategory}`}
          </Text>
          {filteredMeditations.length > 0 ? (
            <FlatList
              data={filteredMeditations}
              renderItem={renderMeditationItem}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.meditationGridColumnWrapper}
              scrollEnabled={false} // Handled by parent ScrollView
            />
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons
                name={selectedCategory === "Favoritos" ? "heart-dislike-outline" : "sad-outline"}
                size={50}
                color={COLORS.textTertiary}
              />
              <Text style={styles.noItemsText}>
                {selectedCategory === "Favoritos"
                  ? "Você ainda não marcou nenhuma meditação como favorita. Explore e toque no coração para salvar!"
                  : "Nenhuma meditação encontrada nesta categoria."}
              </Text>
              {selectedCategory === "Favoritos" && (
                <TouchableOpacity
                  onPress={() => setSelectedCategory("Todos")}
                  style={styles.exploreButton}
                >
                  <Ionicons name="search-outline" size={18} color={COLORS.backgroundPrimary} style={{ marginRight: 8 }} />
                  <Text style={styles.exploreButtonText}>Explorar Meditações</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
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
  centeredLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 100, // Space for navbar
  },
  header: {
    marginTop: Platform.OS === "ios" ? 60 : 50,
    marginBottom: 20,
    paddingHorizontal: 20,
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
  stickyCategoriesContainer: {
    backgroundColor: COLORS.backgroundPrimary, // Or a slightly different shade for effect
    paddingVertical: 10,
    // Shadow for sticky effect (optional)
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: COLORS.borderSubtle + "80",
    // elevation: 2,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.accentPrimary,
    borderColor: COLORS.accentPrimary,
  },
  categoryButtonInactive: {
    backgroundColor: COLORS.backgroundSecondary,
    borderColor: COLORS.borderSubtle,
  },
  categoryText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
  },
  categoryTextActive: {
    color: COLORS.textPrimary,
  },
  categoryTextInactive: {
    color: COLORS.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: FONTS.titleMedium,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: 18,
  },
  featuredCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredImageContainer: {
    height: 200,
    backgroundColor: COLORS.backgroundTertiary,
    position: "relative", // For favorite button
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredContent: {
    padding: 18,
  },
  featuredTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  featuredDescription: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textTertiary,
    lineHeight: 20,
  },
  featuredFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  featuredDuration: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accentPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playButtonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  meditationGridColumnWrapper: {
    justifyContent: "space-between",
  },
  meditationCard: {
    width: "48%", // For two columns
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  meditationImageContainer: {
    width: "100%",
    aspectRatio: 1, // Square images
    position: "relative", // For overlay buttons
  },
  meditationImage: {
    width: "100%",
    height: "100%",
  },
  premiumBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },
  playingIndicator: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  playingIndicatorText: {
    color: COLORS.accentSecondary,
    fontSize: 10,
    fontFamily: FONTS.bodyMedium,
    marginLeft: 4,
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 15,
    padding: 5,
  },
  favoriteButtonFeatured: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 7, 
    borderRadius: 20,
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
  errorText: {
    fontFamily: FONTS.body,
    color: COLORS.error,
    textAlign: "center",
    fontSize: 15,
    paddingVertical: 10,
  },
  retryButton: {
    backgroundColor: COLORS.accentSecondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  retryButtonText: {
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.backgroundPrimary,
    fontSize: 14,
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noItemsText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: "center",
    marginTop: 15,
    lineHeight: 20,
  },
  exploreButton: {
    marginTop: 20,
    backgroundColor: COLORS.accentSecondary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  exploreButtonText: {
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.backgroundPrimary,
    fontSize: 14,
  },
});

export default LibraryScreen;

