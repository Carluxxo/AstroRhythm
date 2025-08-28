import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Play, Pause, X } from 'phosphor-react-native';
import { usePlayer } from '../contexts/PlayerContext';
import {
  useNavigation,
  StackActions,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Image as ExpoImage } from 'expo-image';

const COLORS = {
  primaryHighlight: '#8A4FFF',
  textNeutralLight: '#E0E0E0',
  white: '#FFFFFF',
  backgroundSecondary: '#111528',
};

const TYPO = {
  fontRegular: 'Inter-Regular',
  fontMedium: 'Inter-Medium',
  titleSize: 14,
  artistSize: 12,
};

const ICON_SMALL = 20;
const ICON_MED = 28;

type NavProp = StackNavigationProp<RootStackParamList>;

interface MiniPlayerProps {
  currentRouteName: string | undefined;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ currentRouteName }) => {
  const navigation = useNavigation<NavProp>();
  const {
    currentTrack,
    isPlaying,
    pauseTrack,
    resumeTrack,
    stopTrack,
    setCurrentTrack,
  } = usePlayer();

  // controla visibilidade local para "despawn" instantâneo
  const [visible, setVisible] = useState(true);
  // evita chamadas concorrentes ao stop
  const [isStopping, setIsStopping] = useState(false);

  // Se uma nova faixa aparecer no contexto, reabilita a visibilidade
  useEffect(() => {
    if (currentTrack) {
      setVisible(true);
      setIsStopping(false); // reset state para novas tentativas futuras
    }
  }, [currentTrack]);

  if (
    !visible ||
    !currentTrack ||
    currentRouteName === 'Player' ||
    currentRouteName === 'Onboarding' ||
    !currentRouteName
  ) {
    return null;
  }

  const handleOpenPlayer = (e?: GestureResponderEvent) => {
    // abre a tela do Player
    navigation.dispatch(
      StackActions.push('Player', {
        id: currentTrack.id,
        title: currentTrack.title,
        audio_url: currentTrack.audio_url,
        image_url: currentTrack.image_url,
        artist: currentTrack.artist,
      })
    );
  };

  const handleToggle = async (e?: GestureResponderEvent) => {
    e?.stopPropagation();
    try {
      if (isPlaying) {
        await pauseTrack();
      } else {
        await resumeTrack();
      }
    } catch {
      // intentionally silent — no logs
    }
  };

  const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const handleStop = async (e?: GestureResponderEvent) => {
    e?.stopPropagation();

    if (isStopping) return; // evita reentrância
    setIsStopping(true);

    // Oculta imediatamente o mini player (despawn visual instantâneo)
    setVisible(false);

    // 1ª tentativa: stopTrack (se existir)
    try {
      if (typeof stopTrack === 'function') {
        await stopTrack();
      } else if (typeof pauseTrack === 'function') {
        // fallback se stopTrack não existir
        await pauseTrack();
      }
      // garante que o contexto seja limpo
      if (typeof setCurrentTrack === 'function') setCurrentTrack(null);
      setIsStopping(false);
      return;
    } catch {
      // swallow, sem log
    }

    // Fallback imediato: pause + limpar contexto
    try {
      if (typeof pauseTrack === 'function') {
        await pauseTrack();
      }
    } catch {
      // swallow
    }

    try {
      if (typeof setCurrentTrack === 'function') setCurrentTrack(null);
    } catch {
      // swallow
    }

    // Tentativa adicional: aguarda um pouco e tenta stop novamente (opcional)
    try {
      await wait(80);
      if (typeof stopTrack === 'function') {
        await stopTrack().catch(() => {
          // swallow final
        });
      }
    } catch {
      // swallow
    }

    setIsStopping(false);
  };

  return (
    <Pressable
      android_ripple={{ color: '#00000010' }}
      style={styles.outerContainer}
      onPress={handleOpenPlayer}
    >
      <BlurView intensity={90} tint="dark" style={styles.blurContainer}>
        <View style={styles.contentContainer}>
          {currentTrack.image_url ? (
            <ExpoImage
              source={{ uri: currentTrack.image_url }}
              style={styles.thumbnail}
              contentFit="cover"
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Text style={styles.thumbnailPlaceholderText}>🎵</Text>
            </View>
          )}

          <View style={styles.trackInfoContainer}>
            <Text style={styles.titleText} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artistText} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>

          <View style={styles.controlsContainer}>
            <TouchableOpacity
              onPress={(e) => handleToggle(e)}
              style={styles.controlButton}
              activeOpacity={0.7}
            >
              {isPlaying ? (
                <Pause size={ICON_MED} color={COLORS.textNeutralLight} weight="fill" />
              ) : (
                <Play size={ICON_MED} color={COLORS.textNeutralLight} weight="fill" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={(e) => handleStop(e)}
              style={[styles.controlButton, styles.closeButton]}
              activeOpacity={0.7}
            >
              <X size={ICON_SMALL} color={COLORS.textNeutralLight} weight="bold" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  blurContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  thumbnail: {
    width: 45,
    height: 45,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: COLORS.backgroundSecondary,
  },
  thumbnailPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholderText: {
    fontSize: 24,
    color: COLORS.textNeutralLight,
  },
  trackInfoContainer: {
    flex: 1,
    marginRight: 10,
  },
  titleText: {
    fontSize: TYPO.titleSize,
    fontFamily: TYPO.fontMedium,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  artistText: {
    fontSize: TYPO.artistSize,
    fontFamily: TYPO.fontRegular,
    color: COLORS.textNeutralLight,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
    marginLeft: 8,
  },
  closeButton: {},
});

export default MiniPlayer;
