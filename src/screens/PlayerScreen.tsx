import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Audio, AVPlaybackStatus, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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

// Variável global para armazenar a instância de som atualmente ativa
let globalSoundInstance: Audio.Sound | null = null;
let globalAudioUrl: string | null = null;

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
    image_url
  } = route.params || {};

  // Estado local para status e UI, mas o som em si será gerenciado pela ref global
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Ref para esta instância específica, para limpeza no unmount
  const soundRef = useRef<Audio.Sound | null>(null);

  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const positionMillis = status?.isLoaded ? status.positionMillis : 0;
  const durationMillis = status?.isLoaded ? status.durationMillis : undefined;

  useEffect(() => {
    let isMounted = true;

    const setupAudio = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      setError(null);

      if (!audio_url) {
        if (isMounted) {
          setError("URL do áudio não fornecida.");
          setIsLoading(false);
        }
        return;
      }

      try {
        // Configurações de áudio
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });

        // Se a URL do áudio for diferente da global ou não houver som global, ou o som global não estiver carregado
        // Ou se o som global não for o mesmo que o soundRef desta instância (caso de re-navegação para a mesma tela com params diferentes)
        let needsToLoadNewSound = false;
        if (globalAudioUrl !== audio_url || !globalSoundInstance) {
            needsToLoadNewSound = true;
        } else {
            const currentGlobalStatus = await globalSoundInstance.getStatusAsync();
            if (!currentGlobalStatus.isLoaded) {
                needsToLoadNewSound = true;
            }
        }
        
        if (needsToLoadNewSound) {
            // Parar e descarregar o som global anterior, se existir
            if (globalSoundInstance) {
                console.log('Stopping and unloading previous global sound instance.');
                await globalSoundInstance.stopAsync().catch(e => console.warn('Error stopping previous global sound:', e));
                await globalSoundInstance.unloadAsync().catch(e => console.warn('Error unloading previous global sound:', e));
                globalSoundInstance = null;
                globalAudioUrl = null;
            }

            console.log('Loading new sound globally from:', audio_url);
            const { sound: newSound, status: initialStatus } = await Audio.Sound.createAsync(
               { uri: audio_url }, 
               { shouldPlay: false } // Não tocar automaticamente
            );
            
            if (isMounted) {
                globalSoundInstance = newSound;
                globalAudioUrl = audio_url;
                soundRef.current = newSound; // Atribui à ref local também
                setStatus(initialStatus);
                newSound.setOnPlaybackStatusUpdate((playbackStatus) => {
                    // Atualizar o status apenas se o som atual for o globalSoundInstance
                    // E se o componente ainda estiver montado
                    if (isMounted && soundRef.current === globalSoundInstance) {
                        setStatus(playbackStatus);
                    }
                });
            } else {
                // Componente desmontado durante o carregamento, descarregar o novo som
                console.log('Component unmounted during new sound load, unloading.');
                newSound.unloadAsync().catch(e => console.warn('Error unloading new sound on unmount:', e));
            }
        } else if (globalSoundInstance && globalAudioUrl === audio_url) {
            // Usar a instância global existente se a URL for a mesma
            console.log('Using existing global sound instance for:', audio_url);
            soundRef.current = globalSoundInstance;
            const currentGlobalStatus = await globalSoundInstance.getStatusAsync();
            if (isMounted) setStatus(currentGlobalStatus);
            // Reatribuir o callback de status para esta instância, caso tenha sido sobrescrito
            globalSoundInstance.setOnPlaybackStatusUpdate((playbackStatus) => {
                if (isMounted && soundRef.current === globalSoundInstance) {
                    setStatus(playbackStatus);
                }
            });
        }

      } catch (e) {
        console.error("Error loading sound:", e);
        if (isMounted) setError("Erro ao carregar o áudio. Verifique a URL e a conexão.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    setupAudio();

    return () => {
      isMounted = false;
      console.log('PlayerScreen cleanup for audio_url:', audio_url);
      // Não descarregar o som global aqui, pois ele pode ser usado por outra tela do player
      // A limpeza do som global ocorrerá quando um *novo* som for carregado
      // ou se precisarmos de uma lógica de parada global ao sair do app.
      // Apenas removemos o listener desta instância.
      if (soundRef.current) {
        soundRef.current.setOnPlaybackStatusUpdate(null);
      }
      // Se o som desta instância não for o som global atual (ex: um som antigo que não foi limpo)
      // E se o som global atual não for o mesmo que o som desta instância (para evitar duplo unload)
      if (soundRef.current && soundRef.current !== globalSoundInstance) {
          console.log('Unloading soundRef as it is not the global instance');
          soundRef.current.unloadAsync().catch(e => console.warn('Cleanup: Error unloading non-global soundRef:', e));
      }
      soundRef.current = null; // Limpa a ref local
    };
  }, [audio_url]); // Re-executa quando audio_url muda

  const handlePlayPause = async () => {
    if (!soundRef.current || !status?.isLoaded) return;
    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        if (status.didJustFinish) {
          await soundRef.current.replayAsync(); // ou setPositionAsync(0) e depois playAsync()
        } else {
          await soundRef.current.playAsync();
        }
      }
    } catch (e) {
        console.error("Error playing/pausing sound:", e);
        if (isMounted) setError("Erro ao reproduzir/pausar.");
    }
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekChange = (value: number) => {
    setSeekValue(value);
  };

  const handleSeekEnd = async (value: number) => {
    if (!soundRef.current || !durationMillis || !status?.isLoaded) return;
    const seekPosition = value * durationMillis;
    try {
        await soundRef.current.setPositionAsync(seekPosition);
    } catch (e) {
        console.error("Error seeking sound:", e);
        if (isMounted) setError("Erro ao buscar posição.");
    } finally {
        setIsSeeking(false);
    }
  };

  const handleSkip = async (seconds: number) => {
      if (!soundRef.current || !status?.isLoaded || !durationMillis) return;
      const newPosition = Math.max(0, Math.min(durationMillis, positionMillis + (seconds * 1000)));
      try {
          await soundRef.current.setPositionAsync(newPosition);
      } catch (e) {
          console.error("Error skipping sound:", e);
          if (isMounted) setError("Erro ao avançar/retroceder.");
      }
  };

  const sliderValue = durationMillis && durationMillis > 0 ? positionMillis / durationMillis : 0;
  const displayValue = isSeeking ? seekValue : sliderValue;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agora Tocando</Text>
        <TouchableOpacity style={styles.headerButton} disabled>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.textTertiary} />
        </TouchableOpacity>
      </View>

      <View style={styles.visualizationContainer}>
        <View style={styles.visualization}>
          {image_url ? (
            <Image source={{ uri: image_url }} style={styles.visualizationImage} resizeMode="cover" />
          ) : (
            <MaterialCommunityIcons name="headphones" size={100} color={`${COLORS.textTertiary}80`} />
          )}
        </View>
      </View>

      <View style={styles.meditationInfo}>
        <Text style={styles.meditationTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.meditationSubtitle}>
          Meditação guiada • {durationMillis ? formatTime(durationMillis) : durationString}
        </Text>
      </View>

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
          disabled={!status?.isLoaded || isLoading || !!error}
        />
        <View style={styles.timeInfo}>
          <Text style={styles.timeText}>{formatTime(positionMillis)}</Text>
          <Text style={styles.timeText}>{formatTime(durationMillis)}</Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.textPrimary} style={styles.controlsPlaceholder} />
      ) : error ? (
         <Text style={[styles.errorText, styles.controlsPlaceholder]}>{error}</Text>
      ) : (
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButtonSmall} disabled>
            <Ionicons name="shuffle" size={24} color={COLORS.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => handleSkip(-15)} disabled={!status?.isLoaded}>
            <MaterialCommunityIcons name="rewind-15" size={32} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.playPauseButton} onPress={handlePlayPause} disabled={!status?.isLoaded}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color={COLORS.textPrimary} style={isPlaying ? {} : styles.playIconOffset} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => handleSkip(15)} disabled={!status?.isLoaded}>
            <MaterialCommunityIcons name="fast-forward-15" size={32} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButtonSmall} disabled>
            <Ionicons name="repeat" size={24} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </View>
      )}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
    paddingHorizontal: 25,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? 55 : 45,
  },
  headerButton: {
    padding: 8,
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
    paddingHorizontal: 10,
  },
  visualization: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
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
    fontFamily: FONTS.titleMedium,
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
      height: 80, 
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
      opacity: 0.6, 
  },
  playPauseButton: {
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: COLORS.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  playIconOffset: {
      marginLeft: 4, 
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
    opacity: 0.7, 
  },
  errorText: {
      fontFamily: FONTS.body,
      color: COLORS.accentTertiary,
      textAlign: 'center',
      fontSize: 15,
  },
});

export default PlayerScreen;

