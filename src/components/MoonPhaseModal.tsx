import React, { useState, useEffect, useCallback } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { X } from 'phosphor-react-native';

// Assuming moon phase data structure
import { MoonPhase } from '../screens/LuaScreen'; // We will export this type from LuaScreen

// Colors and Typography from design guidelines
const COLORS = {
  baseSecondaryDark: '#111528',
  textPrimary: '#FFFFFF',
  textSecondary: '#E0E0E0',
  accentPrimary: '#8A4FFF',
};

const TYPOGRAPHY = {
  titleFontFamily: 'SpaceGrotesk-Bold',
  bodyFontFamily: 'Inter-Regular',
  modalTitleSize: 24,
  modalBodySize: 16,
  countdownTextSize: 18,
};

const ICON_SIZE_CLOSE = 28;
const screenHeight = Dimensions.get('window').height;

// Map icon names from JSON to actual image assets
const moonImages = {
  new_moon: require('../../assets/moon_phases/blue_moon/new_moon.png'),
  waxing_crescent: require('../../assets/moon_phases/blue_moon/waxing_crescent.png'),
  first_quarter: require('../../assets/moon_phases/blue_moon/first_quarter.png'),
  waxing_gibbous: require('../../assets/moon_phases/blue_moon/waxing_gibbous.png'),
  full_moon: require('../../assets/moon_phases/blue_moon/full_moon.png'),
  waning_gibbous: require('../../assets/moon_phases/blue_moon/waning_gibbous.png'),
  third_quarter: require('../../assets/moon_phases/blue_moon/third_quarter.png'),
  waning_crescent: require('../../assets/moon_phases/blue_moon/waning_crescent.png'),
};

interface MoonPhaseModalProps {
  visible: boolean;
  onClose: () => void;
  moonData: (MoonPhase & { date: Date | null }) | null; // Expect date object for countdown, or null
  onCountdownEnd: () => void;
}

const CountdownTimer: React.FC<{ targetDate: Date | null; onEnd: () => void }> = ({ targetDate, onEnd }) => {
  // If there is no date (current phase), show "Fase Atual"
  if (!targetDate) {
    return <Text style={styles.countdownText}>Fase Atual</Text>;
  }

  const calculateRemainingTime = useCallback(() => {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance < 0) {
      return null;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  }, [targetDate]);

  const [remainingTime, setRemainingTime] = useState(calculateRemainingTime);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = calculateRemainingTime();
      if (newTime) {
        setRemainingTime(newTime);
      } else {
        clearInterval(timer);
        onEnd();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateRemainingTime, onEnd]);

  if (!remainingTime) {
    return <Text style={styles.countdownText}>A fase da lua mudou!</Text>;
  }

  return (
    <Text style={styles.countdownText}>
      {`${remainingTime.days}d ${remainingTime.hours}h ${remainingTime.minutes}m ${remainingTime.seconds}s`}
    </Text>
  );
};

const MoonPhaseModal: React.FC<MoonPhaseModalProps> = ({ visible, onClose, moonData, onCountdownEnd }) => {
  if (!moonData) {
    return null;
  }

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <BlurView intensity={90} tint="dark" style={styles.blurOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={ICON_SIZE_CLOSE} color={COLORS.textSecondary} weight="bold" />
          </TouchableOpacity>

          <Text style={styles.titleText}>{moonData.name}</Text>
          <Image source={moonImages[moonData.icon as keyof typeof moonImages]} style={styles.image} resizeMode="contain" />

          <ScrollView style={styles.textContainer}>
            <Text style={styles.explanationText}>{moonData.longDescription}</Text>
          </ScrollView>

          {/* Countdown or "Fase Atual" */}
          <View style={styles.countdownContainer}>
            <CountdownTimer targetDate={moonData.date} onEnd={onCountdownEnd} />
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: screenHeight * 0.85,
    backgroundColor: 'rgba(30, 34, 69, 0.85)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    padding: 5,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  textContainer: {
    width: '100%',
    maxHeight: screenHeight * 0.4,
    marginTop: 10,
  },
  titleText: {
    fontSize: TYPOGRAPHY.modalTitleSize,
    fontFamily: TYPOGRAPHY.titleFontFamily,
    color: COLORS.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  explanationText: {
    fontSize: TYPOGRAPHY.modalBodySize,
    fontFamily: TYPOGRAPHY.bodyFontFamily,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.modalBodySize * 1.6,
    textAlign: 'left',
  },
  countdownContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
  },
  countdownText: {
    fontFamily: TYPOGRAPHY.titleFontFamily,
    fontSize: TYPOGRAPHY.countdownTextSize,
    color: COLORS.accentPrimary,
    textAlign: 'center',
  },
});

export default MoonPhaseModal;