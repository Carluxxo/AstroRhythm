import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Slider } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type PlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Player'>;
type PlayerScreenRouteProp = RouteProp<RootStackParamList, 'Player'>;

const PlayerScreen = () => {
  const navigation = useNavigation<PlayerScreenNavigationProp>();
  const route = useRoute<PlayerScreenRouteProp>();
  
  // Extrair parâmetros da rota
  const { title = 'Nebulosa de Órion', duration = '15 min' } = route.params || {};
  
  // Estados para controle do player
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0.45);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Tempo calculado com base no progresso e duração
  const durationInMinutes = parseInt(duration.split(' ')[0]);
  const currentTime = Math.floor(durationInMinutes * 60 * progress);
  const currentMinutes = Math.floor(currentTime / 60);
  const currentSeconds = currentTime % 60;
  const formattedCurrentTime = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Cabeçalho com botão de voltar */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>↓</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agora Tocando</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Visualização principal */}
      <View style={styles.visualizationContainer}>
        <View style={styles.visualization}>
          <View style={styles.volumeIcon}>
            <Text style={styles.volumeIconText}>🔊</Text>
          </View>
          <Text style={styles.visualizationText}>Visualização de ondas sonoras</Text>
        </View>
      </View>

      {/* Informações da meditação */}
      <View style={styles.meditationInfo}>
        <Text style={styles.meditationTitle}>{title}</Text>
        <Text style={styles.meditationSubtitle}>Meditação guiada • {duration}</Text>
      </View>

      {/* Controles de reprodução */}
      <View style={styles.progressContainer}>
        <View style={styles.progressSlider}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
        <View style={styles.timeInfo}>
          <Text style={styles.timeText}>{formattedCurrentTime}</Text>
          <Text style={styles.timeText}>{duration}</Text>
        </View>
      </View>

      {/* Botões de controle */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlButtonText}>🔀</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlButtonText}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.playPauseButton}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Text style={styles.playPauseButtonText}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlButtonText}>⏭</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlButtonText}>🔁</Text>
        </TouchableOpacity>
      </View>

      {/* Controles adicionais */}
      <View style={styles.additionalControls}>
        <TouchableOpacity 
          style={styles.additionalButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Text style={[styles.additionalButtonIcon, isFavorite && styles.favoriteActive]}>❤</Text>
          <Text style={styles.additionalButtonText}>Favorito</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.additionalButton}>
          <Text style={styles.additionalButtonIcon}>⬇️</Text>
          <Text style={styles.additionalButtonText}>Download</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.additionalButton}>
          <Text style={styles.additionalButtonIcon}>📤</Text>
          <Text style={styles.additionalButtonText}>Compartilhar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.additionalButton}>
          <Text style={styles.additionalButtonIcon}>ℹ️</Text>
          <Text style={styles.additionalButtonText}>Detalhes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  menuButton: {
    padding: 10,
  },
  menuButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  visualizationContainer: {
    marginBottom: 30,
  },
  visualization: {
    height: 300,
    backgroundColor: '#121330',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  volumeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(248, 248, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  volumeIconText: {
    fontSize: 30,
    color: '#FFFFFF',
  },
  visualizationText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  meditationInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  meditationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  meditationSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressSlider: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#47d6a0',
    borderRadius: 2,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  controlButton: {
    padding: 10,
  },
  controlButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  playPauseButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#6b3fa0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButtonText: {
    fontSize: 30,
    color: '#FFFFFF',
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  additionalButton: {
    alignItems: 'center',
  },
  additionalButtonIcon: {
    fontSize: 24,
    marginBottom: 5,
    color: '#FFFFFF',
  },
  additionalButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  favoriteActive: {
    color: '#d44f9a',
  },
});

export default PlayerScreen;
