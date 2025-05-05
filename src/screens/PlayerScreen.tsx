import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Image } from 'react-native'; // Added Platform, Image
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Audio, AVPlaybackStatus, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av'; // Import interruption modes
import Slider from '@react-native-community/slider';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons

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

type PlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Player'>;
type PlayerScreenRouteProp = RouteProp<RootStackParamList, 'Player'>;

// Função para formatar milissegundos
const formatTime = (millis: number | undefined): string => {
  if (millis === undefined || isNaN(millis)) return '0:00';
  const totalSeconds = Math.max(0, Math.floor(millis / 1000));
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const PlayerScreen = () => {
  const navigation = useNavigation<PlayerScreenNavigationProp>();
  const route = useRoute<PlayerScreenRouteProp>();

  const { 
    title = 'Meditação Desconhecida',
    duration: durationString = '0 min',
    audio_url,
    image_url // Receber image_url se passado
  } = route.params || {};

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const positionMillis = status?.isLoaded ? status.positionMillis : 0;
  const durationMillis = status?.isLoaded ? status.durationMillis : undefined;

  // Carregar áudio
  useEffect(() => {
    let isMounted = true;
    const loadSound = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      setError(null);
      if (!audio_url) {
        setError("URL do áudio não fornecida.");
        setIsLoading(false);
        return;
      }
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix, // Não misturar com outros áudios
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          shouldDuckAndroid: false, // Não diminuir volume de outros apps
          playThroughEarpieceAndroid: false,
        });

        console.log('Loading Sound from:', audio_url);
        const { sound: newSound, status: initialStatus } = await Audio.Sound.createAsync(
           { uri: audio_url }, 
           { shouldPlay: false } // Não começar a tocar automaticamente
        );
        
        if (isMounted) {
            setSound(newSound);
            setStatus(initialStatus);
            newSound.setOnPlaybackStatusUpdate((playbackStatus) => {
                if (isMounted) {
                    setStatus(playbackStatus);
                }
            });
        }
      } catch (e) {
        console.error("Error loading sound:", e);
        if (isMounted) setError("Erro ao carregar o áudio.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadSound();

    return () => {
      isMounted = false;
      console.log('Unloading Sound');
      sound?.unloadAsync();
    };
  }, [audio_url]);

  // Controles
  const handlePlayPause = async () => {
    if (!sound || !status?.isLoaded) return;
    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        if (status.didJustFinish) {
          await sound.replayAsync();
        } else {
          await sound.playAsync();
        }
      }
    } catch (e) {
        console.error("Error playing/pausing sound:", e);
        setError("Erro ao reproduzir/pausar.");
    }
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekChange = (value: number) => {
    setSeekValue(value);
  };

  const handleSeekEnd = async (value: number) => {
    if (!sound || !durationMillis || !status?.isLoaded) return;
    const seekPosition = value * durationMillis;
    try {
        await sound.setPositionAsync(seekPosition);
    } catch (e) {
        console.error("Error seeking sound:", e);
        setError("Erro ao buscar posição.");
    } finally {
        setIsSeeking(false);
    }
  };

  const handleSkip = async (seconds: number) => {
      if (!sound || !status?.isLoaded || !durationMillis) return;
      const newPosition = Math.max(0, Math.min(durationMillis, positionMillis + (seconds * 1000)));
      try {
          await sound.setPositionAsync(newPosition);
      } catch (e) {
          console.error("Error skipping sound:", e);
          setError("Erro ao avançar/retroceder.");
      }
  };

  const sliderValue = durationMillis ? positionMillis / durationMillis : 0;
  const displayValue = isSeeking ? seekValue : sliderValue;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agora Tocando</Text>
        <TouchableOpacity style={styles.headerButton} disabled>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Visualização */}
      <View style={styles.visualizationContainer}>
        <View style={styles.visualization}>
          {image_url ? (
            <Image source={{ uri: image_url }} style={styles.visualizationImage} resizeMode="cover" />
          ) : (
            <MaterialCommunityIcons name="headphones" size={100} color={`${COLORS.textTertiary}80`} />
          )}
        </View>
      </View>

      {/* Informações */}
      <View style={styles.meditationInfo}>
        <Text style={styles.meditationTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.meditationSubtitle}>
          Meditação guiada • {durationMillis ? formatTime(durationMillis) : durationString}
        </Text>
      </View>

      {/* Barra de Progresso */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.progressSlider}
          minimumValue={0}
          maximumValue={1}
          value={displayValue}
          minimumTrackTintColor={COLORS.accentSecondary}
          maximumTrackTintColor={`${COLORS.textPrimary}30`}
          thumbTintColor={COLORS.accentSecondary}
          onSlidingStart={handleSeekStart}
          onValueChange={handleSeekChange}
          onSlidingComplete={handleSeekEnd}
          disabled={!status?.isLoaded || isLoading || error}
        />
        <View style={styles.timeInfo}>
          <Text style={styles.timeText}>{formatTime(positionMillis)}</Text>
          <Text style={styles.timeText}>{formatTime(durationMillis)}</Text>
        </View>
      </View>

      {/* Controles Principais */}
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.textPrimary} style={styles.controlsPlaceholder} />
      ) : error ? (
         <Text style={[styles.errorText, styles.controlsPlaceholder]}>{error}</Text>
      ) : (
        <View style={styles.controls}>
          {/* Botão Shuffle (desabilitado) */}
          <TouchableOpacity style={styles.controlButtonSmall} disabled>
            <Ionicons name="shuffle" size={24} color={COLORS.textTertiary} />
          </TouchableOpacity>
          
          {/* Retroceder 15s */}
          <TouchableOpacity style={styles.controlButton} onPress={() => handleSkip(-15)} disabled={!status?.isLoaded}>
            <MaterialCommunityIcons name="rewind-15" size={32} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          {/* Play/Pause */}
          <TouchableOpacity style={styles.playPauseButton} onPress={handlePlayPause} disabled={!status?.isLoaded}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color={COLORS.textPrimary} style={isPlaying ? {} : styles.playIconOffset} />
          </TouchableOpacity>
          
          {/* Avançar 15s */}
          <TouchableOpacity style={styles.controlButton} onPress={() => handleSkip(15)} disabled={!status?.isLoaded}>
            <MaterialCommunityIcons name="fast-forward-15" size={32} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          {/* Botão Repeat (desabilitado) */}
          <TouchableOpacity style={styles.controlButtonSmall} disabled>
            <Ionicons name="repeat" size={24} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Controles Adicionais (Simplificado) */}
      <View style={styles.additionalControls}>
        <TouchableOpacity style={styles.additionalButton} onPress={() => setIsFavorite(!isFavorite)}>
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={26} color={isFavorite ? COLORS.accentTertiary : COLORS.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.additionalButton} disabled>
          <Ionicons name="arrow-down-circle-outline" size={26} color={COLORS.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.additionalButton} disabled>
          <Ionicons name="share-social-outline" size={26} color={COLORS.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.additionalButton} disabled>
          <Ionicons name="information-circle-outline" size={26} color={COLORS.textTertiary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Estilos Refinados ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
    paddingHorizontal: 25,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Padding inferior
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? 55 : 45,
  },
  headerButton: {
    padding: 8, // Área de toque
  },
  headerTitle: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 15,
    color: COLORS.textTertiary,
  },
  visualizationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 25,
    paddingHorizontal: 10, // Evitar que a imagem toque as bordas
  },
  visualization: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 30, // Mais arredondado
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    // Sombra sutil
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  visualizationImage: {
      width: '100%',
      height: '100%',
  },
  meditationInfo: {
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  meditationTitle: {
    fontFamily: FONTS.titleMedium, // Usar fonte de título
    fontSize: 24,
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  meditationSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textTertiary,
  },
  progressContainer: {
    marginBottom: 25,
  },
  progressSlider: {
    width: '100%',
    height: 40,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: -8,
  },
  timeText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  controlsPlaceholder: {
      height: 80, // Altura aproximada dos controles
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 30,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  controlButton: {
    padding: 10,
  },
  controlButtonSmall: {
      padding: 10,
      opacity: 0.6, // Desabilitado
  },
  playPauseButton: {
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: COLORS.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  playIconOffset: {
      marginLeft: 4, // Ajuste visual do ícone play
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  additionalButton: {
    padding: 10,
    opacity: 0.7, // Levemente desabilitado por padrão
  },
  errorText: {
      fontFamily: FONTS.body,
      color: COLORS.accentTertiary,
      textAlign: 'center',
      fontSize: 15,
  },
});

export default PlayerScreen;

