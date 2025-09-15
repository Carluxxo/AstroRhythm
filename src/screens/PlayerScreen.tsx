import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, PlayerScreenParams } from "../navigation/types";
import Slider from "@react-native-community/slider";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Heart } from "phosphor-react-native";
import { Image as ExpoImage } from 'expo-image'; // Importado o ExpoImage

import { usePlayer, Track } from "../contexts/PlayerContext";

// --- Cores (Reutilizando) ---
const COLORS = {
  backgroundPrimary: "#050810",
  backgroundSecondary: "#111528",
  accentPrimary: "#8A4FFF",
  accentSecondary: "#4ECDC4",
  accentTertiary: "#FF6B6B",
  textPrimary: "#FFFFFF",
  textSecondary: "#E0E0E0",
  textTertiary: "#A0A0B0",
};

// --- Fontes (Reutilizando) ---
const FONTS = {
  title: "SpaceGrotesk-Bold", 
  titleMedium: "SpaceGrotesk-Medium",
  body: "Inter-Regular",
  bodyMedium: "Inter-Medium",
  bodySemiBold: "Inter-SemiBold",
};

type PlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, "Player">;
type PlayerScreenRouteProp = RouteProp<RootStackParamList, "Player">;

const formatTime = (millis: number | undefined | null): string => {
  if (millis === undefined || millis === null || isNaN(millis) || millis < 0) return "0:00";
  const totalSeconds = Math.floor(millis / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const PlayerScreen = () => {
  const navigation = useNavigation<PlayerScreenNavigationProp>();
  const route = useRoute<PlayerScreenRouteProp>();
  const {
    isPlaying,
    currentTrack: contextTrack,
    sound: contextSound,
    positionMillis,
    durationMillis,
    playTrack,
    pauseTrack,
    resumeTrack,
    seekTrack,
    isFavorite,
    toggleFavorite,
  } = usePlayer();

  const params = route.params as PlayerScreenParams;

  const trackToPlay: Track | null = params ? {
    id: params.id,
    title: params.title,
    audio_url: params.audio_url,
    image_url: params.image_url,
    artist: params.artist || "AstroRhythm",
  } : null;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    if (trackToPlay) {
      if (contextTrack?.id !== trackToPlay.id || contextTrack?.audio_url !== trackToPlay.audio_url) {
        setIsLoading(true);
        setError(null);
        playTrack(trackToPlay)
          .then(() => setIsLoading(false))
          .catch(err => {
            console.error("Error playing track in PlayerScreen:", err);
            setError("Erro ao carregar a música.");
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    }
  }, [trackToPlay?.id, trackToPlay?.audio_url, playTrack, contextTrack]);

  useEffect(() => {
    if (!isSeeking && durationMillis > 0) {
      setSliderValue(positionMillis / durationMillis);
    } else if (!isSeeking && durationMillis === 0) {
      setSliderValue(0);
    }
  }, [positionMillis, durationMillis, isSeeking]);

  const handlePlayPause = () => {
    if (!trackToPlay) return;
    if (isPlaying) {
      pauseTrack().catch(err => {
        console.error("Error pausing track:", err);
        setError("Erro ao pausar.");
      });
    } else {
      if (contextTrack?.id === trackToPlay.id) {
        resumeTrack().catch(err => {
          console.error("Error resuming track:", err);
          setError("Erro ao tocar.");
        });
      } else {
        setIsLoading(true);
        playTrack(trackToPlay)
            .then(() => setIsLoading(false))
            .catch(err => {
                console.error("Error re-playing track:", err);
                setError("Erro ao tocar.");
                setIsLoading(false);
            });
      }
    }
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekChange = (value: number) => {
    setSliderValue(value);
  };

  const handleSeekEnd = async (value: number) => {
    if (durationMillis > 0) {
      const seekPositionMillis = value * durationMillis;
      seekTrack(seekPositionMillis)
        .catch(e => {
          console.error("Error seeking sound:", e);
          setError("Erro ao buscar posição.");
        });
    }
    setTimeout(() => setIsSeeking(false), 100); 
  };

  const handleSkip = async (seconds: number) => {
    if (durationMillis > 0) {
      const newPosition = Math.max(0, Math.min(durationMillis, positionMillis + seconds * 1000));
      seekTrack(newPosition).catch(e => {
        console.error("Error skipping sound:", e);
        setError("Erro ao avançar/retroceder.");
      });
    }
  };

  const handleToggleFavorite = () => {
    if (contextTrack) {
        toggleFavorite(contextTrack).catch(e => console.error("Error toggling favorite:", e));
    }
  };

  const displayTrack = contextTrack?.id === trackToPlay?.id ? contextTrack : trackToPlay;

  if (isLoading && (!contextTrack || contextTrack.id !== trackToPlay?.id)) {
    return (
      <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color={COLORS.textPrimary} /></View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
            <Text style={{color: COLORS.accentSecondary}}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!displayTrack) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Nenhuma música selecionada ou dados da música ausentes.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
            <Text style={{color: COLORS.accentSecondary}}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const currentArtwork = displayTrack.image_url;
  const currentTitle = displayTrack.title;
  const currentArtist = displayTrack.artist || "AstroRhythm";

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agora Tocando</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleToggleFavorite} disabled={!contextTrack}>
            <Heart size={24} color={contextTrack && isFavorite(contextTrack.id) ? COLORS.accentTertiary : COLORS.textSecondary} weight={contextTrack && isFavorite(contextTrack.id) ? "fill" : "regular"} />
        </TouchableOpacity>
      </View>

      <View style={styles.visualizationContainer}>
        <View style={styles.visualization}>
          {currentArtwork ? (
            <ExpoImage // Updated to ExpoImage
              source={{ uri: currentArtwork }}
              style={styles.visualizationImage}
              contentFit="cover" // Updated prop
            />
          ) : (
            <MaterialCommunityIcons name="headphones" size={100} color={`${COLORS.textTertiary}80`} />
          )}
        </View>
      </View>

      <View style={styles.meditationInfo}>
        <Text style={styles.meditationTitle} numberOfLines={1}>{currentTitle}</Text>
        <Text style={styles.meditationSubtitle}>
          {currentArtist} 
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <Slider
          style={styles.progressSlider}
          minimumValue={0}
          maximumValue={1}
          value={sliderValue}
          minimumTrackTintColor={COLORS.accentSecondary}
          maximumTrackTintColor={`${COLORS.textPrimary}30`}
          thumbTintColor={COLORS.accentSecondary}
          onSlidingStart={handleSeekStart}
          onValueChange={handleSeekChange}
          onSlidingComplete={handleSeekEnd}
          disabled={durationMillis === 0}
        />
        <View style={styles.timeInfo}>
          <Text style={styles.timeText}>{formatTime(positionMillis)}</Text>
          <Text style={styles.timeText}>{formatTime(durationMillis)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButtonSmall} disabled={durationMillis === 0} onPress={() => {/* TODO: Shuffle */}}>
          <Shuffle size={24} color={durationMillis === 0 ? COLORS.textTertiary + "80" : COLORS.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={() => handleSkip(-15)} disabled={durationMillis === 0}>
          <SkipBack size={32} color={durationMillis === 0 ? COLORS.textSecondary + "80" : COLORS.textSecondary} weight="fill"/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playPauseButton} onPress={handlePlayPause} disabled={!trackToPlay}> 
          {isPlaying ? (
            <Pause size={38} color={!trackToPlay ? COLORS.textPrimary+"80" : COLORS.textPrimary} weight="fill" />
          ) : (
            <Play size={38} color={!trackToPlay ? COLORS.textPrimary+"80" : COLORS.textPrimary} weight="fill" style={styles.playIconOffset}/>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={() => handleSkip(15)} disabled={durationMillis === 0}>
          <SkipForward size={32} color={durationMillis === 0 ? COLORS.textSecondary + "80" : COLORS.textSecondary} weight="fill"/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButtonSmall} disabled={durationMillis === 0} onPress={() => {/* TODO: Repeat */}}>
          <Repeat size={24} color={durationMillis === 0 ? COLORS.textTertiary + "80" : COLORS.textTertiary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
    paddingHorizontal: 25,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    justifyContent: "space-between",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Platform.OS === "ios" ? 55 : 45, 
  },
  headerButton: {
    padding: 8,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: FONTS.bodyMedium, 
    fontSize: 15,
    color: COLORS.textTertiary,
  },
  visualizationContainer: {
    flexShrink: 1, 
    flexGrow: 1, 
    maxHeight: "40%", 
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  visualization: {
    width: "90%", 
    aspectRatio: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  visualizationImage: {
      width: "100%",
      height: "100%",
  },
  meditationInfo: {
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  meditationTitle: {
    fontFamily: FONTS.titleMedium, 
    fontSize: 22, 
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  meditationSubtitle: {
    fontFamily: FONTS.body, 
    fontSize: 14,
    color: COLORS.textTertiary,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressSlider: {
    width: "100%",
    height: 40,
  },
  timeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10, 
    marginTop: -5, 
  },
  timeText: {
    fontFamily: FONTS.body, 
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 20, 
    paddingHorizontal: 10,
  },
  controlButton: {
    padding: 10,
  },
  controlButtonSmall: {
    padding: 8,
  },
  playPauseButton: {
    backgroundColor: COLORS.accentPrimary,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  playIconOffset: {
    // marginLeft: 3,
  },
  errorText: {
    color: COLORS.accentTertiary,
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

export default PlayerScreen;