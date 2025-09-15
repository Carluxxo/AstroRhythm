import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Image as ExpoImage } from 'expo-image';
import { ApodData } from '../services/apodService'; // Assuming ApodData interface is exported

// Colors from design_guidelines/color_palette.md
const COLORS = {
  baseSecondaryDark: '#111528',
  textPrimary: '#FFFFFF',
  textSecondary: '#E0E0E0',
  textTertiary: '#A0A0B0',
  accentPrimary: '#8A4FFF',
};

// Typography from design_guidelines/typography.md
const TYPOGRAPHY = {
  titleFontFamily: 'SpaceGrotesk-Bold',
  bodyFontFamily: 'Inter-Regular',
  modalTitleSize: 22,
  modalBodySize: 15,
  modalLineHeight: 1.5 * 15,
};

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

interface ApodModalProps {
  visible: boolean;
  onClose: () => void;
  apodData: ApodData | null;
}

const ApodModal: React.FC<ApodModalProps> = ({ visible, onClose, apodData }) => {
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);

  if (!apodData) {
    return null;
  }

  const displayTitle = apodData.translated_title || apodData.title;
  const displayExplanation = apodData.translated_explanation || apodData.explanation;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <BlurView intensity={90} tint="dark" style={styles.blurOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.titleText}>{displayTitle}</Text>

          {apodData.media_type === 'image' && (
            <ExpoImage
              source={{ uri: apodData.hdurl || apodData.url }}
              style={[
                styles.image,
                aspectRatio ? { aspectRatio } : { height: screenHeight * 0.35 },
              ]}
              contentFit="cover"
              onLoad={({ source }) => {
                if (source?.width && source?.height) {
                  setAspectRatio(source.width / source.height);
                }
              }}
            />
          )}

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

          {/* Botão fechar centralizado no rodapé */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  image: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#000',
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
    maxHeight: screenHeight * 0.35,
    marginBottom: 20,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  titleText: {
    fontSize: TYPOGRAPHY.modalTitleSize,
    fontFamily: TYPOGRAPHY.titleFontFamily,
    color: COLORS.textPrimary,
    marginBottom: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  explanationText: {
    fontSize: TYPOGRAPHY.modalBodySize,
    fontFamily: TYPOGRAPHY.bodyFontFamily,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.modalLineHeight,
    textAlign: 'left',
  },
  closeButton: {
    marginTop: 0,
    backgroundColor: COLORS.accentPrimary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});

export default ApodModal;
