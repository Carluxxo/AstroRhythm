import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { X } from 'phosphor-react-native';

// Interface for AstronomicalEvent (deve ser consistente com a usada na tela de eventos/dashboard)
export interface AstronomicalEvent {
  id: string;
  title: string;
  date: string; // Formato YYYY-MM-DD
  description: string;
  type: string;
  image_url?: string;
}

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
  titleFontFamily: 'SpaceGrotesk-Bold', // Placeholder - ensure loaded
  bodyFontFamily: 'Inter-Regular',       // Placeholder - ensure loaded
  modalTitleSize: 22,
  modalBodySize: 15,
  modalLineHeight: 1.5 * 15, // Approx 22.5
  dateTextSize: 14,
};

const ICON_SIZE_CLOSE = 28;
const screenHeight = Dimensions.get('window').height;

interface EventModalProps {
  visible: boolean;
  onClose: () => void;
  eventData: AstronomicalEvent | null;
}

const EventModal: React.FC<EventModalProps> = ({ visible, onClose, eventData }) => {
  if (!eventData) {
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      const dateObj = new Date(dateString + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário na formatação
      return dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString; // Retorna a string original em caso de erro
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <BlurView intensity={90} tint="dark" style={styles.blurOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={ICON_SIZE_CLOSE} color={COLORS.textSecondary} weight="bold" />
          </TouchableOpacity>

          {eventData.image_url && (
            <Image source={{ uri: eventData.image_url }} style={styles.image} resizeMode="cover" />
          )}

          <ScrollView style={styles.textContainer} contentContainerStyle={styles.scrollContentContainer}>
            <Text style={styles.titleText}>{eventData.title}</Text>
            <Text style={styles.dateText}>{formatDate(eventData.date)}</Text>
            <Text style={styles.descriptionText}>{eventData.description}</Text>
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
    maxHeight: screenHeight * 0.85,
    backgroundColor: 'rgba(30, 34, 69, 0.85)', // #1E2245 with opacity
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
    zIndex: 1,
    padding: 5,
  },
  image: {
    width: '100%',
    height: screenHeight * 0.25, // Adjust as needed for event images
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: COLORS.baseSecondaryDark, // Placeholder if image is missing
  },
  textContainer: {
    width: '100%',
    maxHeight: screenHeight * 0.45, // Max height for text content
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  titleText: {
    fontSize: TYPOGRAPHY.modalTitleSize,
    fontFamily: TYPOGRAPHY.titleFontFamily,
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  dateText: {
    fontSize: TYPOGRAPHY.dateTextSize,
    fontFamily: TYPOGRAPHY.bodyFontFamily,
    color: COLORS.accentSecondary, // Use a highlight color for the date
    marginBottom: 15,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: TYPOGRAPHY.modalBodySize,
    fontFamily: TYPOGRAPHY.bodyFontFamily,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.modalLineHeight,
    textAlign: 'left',
  },
});

export default EventModal;

