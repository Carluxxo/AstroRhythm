import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, Explorador</Text>
          <Text style={styles.date}>Quarta-feira, 23 de Abril</Text>
        </View>

        {/* Player em destaque */}
        <TouchableOpacity 
          style={styles.featuredPlayer}
          onPress={() => navigation.navigate('Player', { 
            title: 'Nebulosa de Órion',
            duration: '15 min'
          })}
        >
          <View style={styles.playerVisualization}></View>
          <Text style={styles.playerTitle}>Nebulosa de Órion</Text>
          <Text style={styles.playerSubtitle}>Meditação guiada • 15 min</Text>
          
          <View style={styles.progressBar}>
            <View style={styles.progressFill}></View>
          </View>
          
          <View style={styles.playerControls}>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlIcon}>⏮</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, styles.playButton]}>
              <Text style={styles.playIcon}>▶</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlIcon}>⏭</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Próximos eventos astronômicos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos Eventos Cósmicos</Text>
          
          <TouchableOpacity 
            style={styles.eventCard}
            onPress={() => navigation.navigate('Calendar')}
          >
            <View style={styles.eventDate}>
              <Text style={styles.eventDay}>25</Text>
              <Text style={styles.eventMonth}>ABR</Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>Chuva de Meteoros Líridas</Text>
              <Text style={styles.eventDescription}>Meditação especial disponível</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.eventCard}
            onPress={() => navigation.navigate('Calendar')}
          >
            <View style={styles.eventDate}>
              <Text style={styles.eventDay}>30</Text>
              <Text style={styles.eventMonth}>ABR</Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>Lua Nova</Text>
              <Text style={styles.eventDescription}>Perfeito para meditação profunda</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Meditações recomendadas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recomendado para Você</Text>
          
          <View style={styles.meditationGrid}>
            <TouchableOpacity 
              style={styles.meditationCard}
              onPress={() => navigation.navigate('Player', { 
                title: 'Viagem a Júpiter',
                duration: '10 min'
              })}
            >
              <View style={[styles.meditationImage, {backgroundColor: '#1e3b70'}]}>
                <Text style={styles.placeholderText}>Júpiter</Text>
              </View>
              <View style={styles.meditationInfo}>
                <Text style={styles.meditationTitle}>Viagem a Júpiter</Text>
                <Text style={styles.meditationDuration}>10 min</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.meditationCard}
              onPress={() => navigation.navigate('Player', { 
                title: 'Galáxia de Andrômeda',
                duration: '15 min'
              })}
            >
              <View style={[styles.meditationImage, {backgroundColor: '#6b3fa0'}]}>
                <Text style={styles.placeholderText}>Andrômeda</Text>
              </View>
              <View style={styles.meditationInfo}>
                <Text style={styles.meditationTitle}>Galáxia de Andrômeda</Text>
                <Text style={styles.meditationDuration}>15 min</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Espaço para a barra de navegação */}
        <View style={styles.navbarSpace} />
      </ScrollView>

      {/* Navegação inferior */}
      <View style={styles.navbar}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Library')}
        >
          <Text style={styles.navIcon}>📚</Text>
          <Text style={styles.navText}>Biblioteca</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Text style={styles.navIcon}>📅</Text>
          <Text style={styles.navText}>Eventos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  date: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  featuredPlayer: {
    backgroundColor: '#121330',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  playerVisualization: {
    height: 180,
    backgroundColor: '#1e3b70',
    borderRadius: 10,
    marginBottom: 15,
  },
  playerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  playerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 15,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 15,
  },
  progressFill: {
    width: '30%',
    height: '100%',
    backgroundColor: '#47d6a0',
    borderRadius: 2,
  },
  playerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    padding: 10,
  },
  controlIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  playButton: {
    backgroundColor: '#6b3fa0',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 59, 112, 0.3)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  eventDate: {
    alignItems: 'center',
    marginRight: 15,
  },
  eventDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  eventMonth: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  meditationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meditationCard: {
    width: '48%',
  },
  meditationImage: {
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  meditationInfo: {
    padding: 4,
  },
  meditationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  meditationDuration: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(10, 10, 15, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navItemActive: {
    opacity: 1,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
    color: '#FFFFFF',
  },
  navText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  navbarSpace: {
    height: 80,
  },
});

export default DashboardScreen;
