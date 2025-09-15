// src/components/EventModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
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
  accentSecondary: '#4ECDC4',
};

// Typography from design_guidelines/typography.md
const TYPOGRAPHY = {
  titleFontFamily: 'SpaceGrotesk-Bold', // Placeholder - ensure loaded
  bodyFontFamily: 'Inter-Regular', // Placeholder - ensure loaded
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
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <BlurView intensity={90} tint="dark" style={styles.blurOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityLabel="Fechar">
            <X size={ICON_SIZE_CLOSE} color={COLORS.textSecondary} weight="bold" />
          </TouchableOpacity>

          {eventData.image_url && (
            <Image source={{ uri: eventData.image_url }} style={styles.image} resizeMode="cover" />
          )}

          <View style={styles.contentWrapper}>
            <Text style={styles.titleText}>{eventData.title}</Text>

            <ScrollView
              style={styles.textContainer}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.descriptionText}>{eventData.description}</Text>
            </ScrollView>

            {/* Footer com data (fixa no rodapé do modal) */}
            <View style={styles.footer}>
              <Text style={styles.dateTextFooter}>{formatDate(eventData.date)}</Text>
            </View>
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
    backgroundColor: 'rgba(30, 34, 69, 0.95)', // slightly less transparent to avoid bleed through
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,   // reduzido
    paddingBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 8, // reduzido
    right: 12,
    zIndex: 2,
    padding: 6,
  },
  image: {
    width: '100%',
    height: screenHeight * 0.24, // Adjust as needed for event images
    borderRadius: 14,
    marginBottom: 10, // reduzido
    backgroundColor: COLORS.baseSecondaryDark, // Placeholder if image is missing
  },
  contentWrapper: {
    width: '100%',
    // reduzir a subtração para não empurrar conteúdo pra baixo demais
    maxHeight: screenHeight * 0.85 - (screenHeight * 0.24 + 110),
    alignItems: 'center',
  },
  titleText: {
    fontSize: TYPOGRAPHY.modalTitleSize,
    fontFamily: TYPOGRAPHY.titleFontFamily,
    color: COLORS.textPrimary,
    marginBottom: 8, // ligeiramente reduzido
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  textContainer: {
    width: '100%',
    // give scroll area free space but allow footer below
    maxHeight: screenHeight * 0.36,
  },
  scrollContentContainer: {
    paddingBottom: 8,
  },
  descriptionText: {
    fontSize: TYPOGRAPHY.modalBodySize,
    fontFamily: TYPOGRAPHY.bodyFontFamily,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.modalLineHeight,
    textAlign: 'left',
  },
  footer: {
    width: '100%',
    paddingTop: 8, // reduzido
    marginTop: 8,  // reduzido
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTextFooter: {
    fontSize: TYPOGRAPHY.dateTextSize,
    fontFamily: TYPOGRAPHY.bodyFontFamily,
    color: COLORS.accentSecondary, // accent as requested
    marginTop: 2,
    textAlign: 'center',
  },
});

export default EventModal;
