import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type LibraryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Library'>;

// Dados de exemplo para as meditações
const meditationData = [
  { id: '1', title: 'Viagem a Júpiter', duration: '10 min', category: 'Sistema Solar', color: '#1e3b70' },
  { id: '2', title: 'Galáxia de Andrômeda', duration: '15 min', category: 'Galáxias', color: '#6b3fa0' },
  { id: '3', title: 'Nebulosa de Órion', duration: '15 min', category: 'Nebulosas', color: '#d44f9a' },
  { id: '4', title: 'Anéis de Saturno', duration: '12 min', category: 'Sistema Solar', color: '#1e3b70' },
  { id: '5', title: 'Horizonte de Eventos', duration: '20 min', category: 'Buracos Negros', color: '#6b3fa0' },
  { id: '6', title: 'Paisagens Marcianas', duration: '10 min', category: 'Sistema Solar', color: '#47d6a0' },
];

// Categorias disponíveis
const categories = ['Todos', 'Sistema Solar', 'Galáxias', 'Nebulosas', 'Buracos Negros'];

const LibraryScreen = () => {
  const navigation = useNavigation<LibraryScreenNavigationProp>();
  const [selectedCategory, setSelectedCategory] = React.useState('Todos');

  // Filtra as meditações com base na categoria selecionada
  const filteredMeditations = selectedCategory === 'Todos' 
    ? meditationData 
    : meditationData.filter(item => item.category === selectedCategory);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Biblioteca Cósmica</Text>
          <Text style={styles.subtitle}>Explore meditações inspiradas no universo</Text>
        </View>

        {/* Categorias */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity 
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category ? styles.categoryButtonActive : styles.categoryButtonInactive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === category ? styles.categoryTextActive : styles.categoryTextInactive
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Meditação em destaque */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Em Destaque</Text>
          <TouchableOpacity 
            style={styles.featuredCard}
            onPress={() => navigation.navigate('Player', { 
              title: 'Jornada pela Via Láctea',
              duration: '20 min'
            })}
          >
            <View style={styles.featuredImage}>
              <Text style={styles.placeholderText}>Via Láctea</Text>
            </View>
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>Jornada pela Via Láctea</Text>
              <Text style={styles.featuredDescription}>
                Uma meditação guiada através da nossa galáxia, explorando seus braços espirais e o centro galáctico.
              </Text>
              <View style={styles.featuredFooter}>
                <Text style={styles.featuredDuration}>20 min</Text>
                <TouchableOpacity style={styles.playButton}>
                  <Text style={styles.playButtonText}>▶ Iniciar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Todas as meditações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Todas as Meditações</Text>
          <View style={styles.meditationGrid}>
            {filteredMeditations.map((item) => (
              <TouchableOpacity 
                key={item.id}
                style={styles.meditationCard}
                onPress={() => navigation.navigate('Player', { 
                  title: item.title,
                  duration: item.duration
                })}
              >
                <View style={[styles.meditationImage, {backgroundColor: item.color}]}>
                  <Text style={styles.placeholderText}>{item.title.split(' ').pop()}</Text>
                </View>
                <View style={styles.meditationOverlay}>
                  <Text style={styles.meditationTitle}>{item.title}</Text>
                  <Text style={styles.meditationDuration}>{item.duration}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Espaço para a barra de navegação */}
        <View style={styles.navbarSpace} />
      </ScrollView>

      {/* Navegação inferior */}
      <View style={styles.navbar}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesContent: {
    paddingRight: 20,
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#6b3fa0',
  },
  categoryButtonInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6b3fa0',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  categoryTextInactive: {
    color: '#FFFFFF',
    opacity: 0.7,
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
  featuredCard: {
    backgroundColor: '#121330',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  featuredImage: {
    height: 200,
    backgroundColor: '#d44f9a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredDuration: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  playButton: {
    backgroundColor: '#6b3fa0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  meditationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  meditationCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  meditationImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  meditationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(10, 10, 15, 0.7)',
  },
  meditationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  meditationDuration: {
    fontSize: 12,
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

export default LibraryScreen;
