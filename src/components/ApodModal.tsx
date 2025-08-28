import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { X } from 'phosphor-react-native';
import { Image as ExpoImage } from 'expo-image';
import { ApodData } from '../services/apodService'; // Assuming ApodData interface is exported

// Colors from design_guidelines/color_palette.md
const COLORS = {
  baseSecondaryDark: '#111528',
  textPrimary: '#FFFFFF',
  textSecondary: '#E0E0E0',
  textTertiary: '#A0A0B0', // For the X icon or subtle text
  accentPrimary: '#8A4FFF',
};

// Typography from design_guidelines/typography.md
const TYPOGRAPHY = {
  titleFontFamily: 'SpaceGrotesk-Bold', // Placeholder - ensure loaded
  bodyFontFamily: 'Inter-Regular',      // Placeholder - ensure loaded
  modalTitleSize: 22,
  modalBodySize: 15,
  modalLineHeight: 1.5 * 15, // Approx 22.5
};

const ICON_SIZE_CLOSE = 28;
const screenHeight = Dimensions.get('window').height;

interface ApodModalProps {
  visible: boolean;
  onClose: () => void;
  apodData: ApodData | null;
}

const ApodModal: React.FC<ApodModalProps> = ({ visible, onClose, apodData }) => {
  if (!apodData) {
    return null;
  }

  const displayTitle = apodData.translated_title || apodData.title;
  const displayExplanation = apodData.translated_explanation || apodData.explanation;

  return (
    <Modal
      animationType="fade" // Or "slide" as per original design_guidelines for modals
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <BlurView intensity={90} tint="dark" style={styles.blurOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={ICON_SIZE_CLOSE} color={COLORS.textSecondary} weight="bold" />
          </TouchableOpacity>
          <Text style={styles.titleText}>{displayTitle}</Text>

          {apodData.media_type === 'image' && (
            <ExpoImage 
              source={{ uri: apodData.hdurl || apodData.url }} 
              style={styles.image} 
              contentFit="contain" // Corrected
            />
          )}
          {/* Add video support here if needed, e.g., using Expo's Video component */}
          {apodData.media_type === 'video' && (
            <View style={styles.videoPlaceholder}>
                <Text style={styles.videoPlaceholderText}>Vídeo: {apodData.title}</Text>
                <Text style={styles.videoPlaceholderLink}>URL: {apodData.url}</Text>
                <Text style={styles.videoPlaceholderInfo}>(Visualização de vídeo no modal a ser implementada)</Text>
            </View>
          )}

          <ScrollView style={styles.textContainer} contentContainerStyle={styles.scrollContentContainer}>
            <Text style={styles.explanationText}>{displayExplanation}</Text>
          </ScrollView>
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
    maxHeight: screenHeight * 0.85, // Max 85% of screen height
    backgroundColor: 'rgba(30, 34, 69, 0.85)', // #1E2245 with opacity for glassmorphism base
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1, // Ensure it's above other content
    padding: 5, // Increase tap area
  },
  image: {
    width: '100%',
    height: screenHeight * 0.35, // Adjust as needed
    borderRadius: 15,
    marginBottom: 15,
  },
  videoPlaceholder: {
    width: '100%',
    height: screenHeight * 0.35,
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: COLORS.baseSecondaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  videoPlaceholderText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.titleFontFamily,
  },
  videoPlaceholderLink: {
    color: COLORS.accentPrimary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    fontFamily: TYPOGRAPHY.bodyFontFamily,
  },
  videoPlaceholderInfo: {
    color: COLORS.textTertiary,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 10,
    fontFamily: TYPOGRAPHY.bodyFontFamily,
  },
  textContainer: {
    width: '100%',
    maxHeight: screenHeight * 0.3, // Max height for text content
  },
  scrollContentContainer: {
    paddingBottom: 20, // Ensure last bit of text is scrollable and visible
  },
  titleText: {
    fontSize: TYPOGRAPHY.modalTitleSize,
    fontFamily: TYPOGRAPHY.titleFontFamily,
    color: COLORS.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  explanationText: {
    fontSize: TYPOGRAPHY.modalBodySize,
    fontFamily: TYPOGRAPHY.bodyFontFamily,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.modalLineHeight,
    textAlign: 'left',
  },
});

export default ApodModal;