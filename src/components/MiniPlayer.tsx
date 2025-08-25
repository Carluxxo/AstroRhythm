import React from 'react';
import {
  View,
  Text,
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

const COLORS = {
  primaryHighlight: '#8A4FFF',
  textNeutralLight: '#E0E0E0',
  white: '#FFFFFF',
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

  if (!currentTrack || currentRouteName === 'Player' || currentRouteName === 'Onboarding' || !currentRouteName) return null;

  const handleOpenPlayer = (e: GestureResponderEvent) => {
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

  const handleToggle = () => {
    if (isPlaying) {
      void pauseTrack();
    } else {
      void resumeTrack();
    }
  };

  const handleStop = async () => {
    await stopTrack();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.outerContainer}
      onPress={handleOpenPlayer}
    >
      <BlurView intensity={90} tint="dark" style={styles.blurContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.trackInfoContainer}>
            <Text style={styles.titleText} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artistText} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>

          <View style={styles.controlsContainer}>
            <TouchableOpacity onPress={handleToggle} style={styles.controlButton}>
              {isPlaying ? (
                <Pause size={ICON_MED} color={COLORS.textNeutralLight} weight="fill" />
              ) : (
                <Play size={ICON_MED} color={COLORS.textNeutralLight} weight="fill" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleStop}
              style={[styles.controlButton, styles.closeButton]}
            >
              <X size={ICON_SMALL} color={COLORS.textNeutralLight} weight="bold" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
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
