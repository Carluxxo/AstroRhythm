import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type CalendarScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Calendar'>;

// Dados de exemplo para os eventos astronômicos
const astronomicalEvents = [
  { id: '1', day: 23, month: 'ABR', title: 'Conjunção Lua-Vênus', description: 'A Lua e Vênus aparecerão próximos no céu noturno', color: '#6b3fa0' },
  { id: '2', day: 25, month: 'ABR', title: 'Chuva de Meteoros Líridas', description: 'Meditação especial disponível', color: '#d44f9a' },
  { id: '3', day: 30, month: 'ABR', title: 'Lua Nova', description: 'Perfeito para meditação profunda', color: '#47d6a0' },
];

// Dados de exemplo para meditações especiais
const specialMeditations = [
  { id: '1', title: 'Chuva de Líridas', duration: '15 min', date: '25 Abr', color: '#d44f9a' },
  { id: '2', title: 'Energia da Lua Nova', duration: '20 min', date: '30 Abr', color: '#47d6a0' },
];

// Dias da semana para o calendário
const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const CalendarScreen = () => {
  const navigation = useNavigation<CalendarScreenNavigationProp>();
  const [currentMonth, setCurrentMonth] = useState('Abril 2025');

  // Gera os dias do mês para o calendário
  const generateDays = () => {
    const days = [];
    // Dias do mês anterior
    days.push(30, 31);
    
    // Dias do mês atual
    for (let i = 1; i <= 30; i++) {
      days.push(i);
    }
    
    // Dias do próximo mês
    days.push(1, 2, 3);
    
    return days;
  };

  const days = generateDays();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Calendário Cósmico</Text>
          <Text style={styles.subtitle}>Eventos astronômicos e meditações especiais</Text>
        </View>

        {/* Calendário mensal */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity style={styles.calendarNavButton}>
              <Text style={styles.calendarNavButtonText}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>{currentMonth}</Text>
            <TouchableOpacity style={styles.calendarNavButton}>
              <Text style={styles.calendarNavButtonText}>▶</Text>
            </TouchableOpacity>
          </View>

          {/* Dias da semana */}
          <View style={styles.weekdaysContainer}>
            {daysOfWeek.map((day) => (
              <Text key={day} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>

          {/* Dias do mês */}
          <View style={styles.daysContainer}>
            {days.map((day, index) => {
              const isCurrentMonth = index >= 2 && index < 32;
              const isToday = isCurrentMonth && day === 23;
              const hasEvent = astronomicalEvents.some(event => event.day === day);
              const eventColor = astronomicalEvents.find(event => event.day === day)?.color;
              
              return (
                <View key={index} style={styles.dayContainer}>
                  {isCurrentMonth ? (
                    <View 
                      style={[
                        styles.dayCircle,
                        isToday && styles.todayCircle,
                        hasEvent && { backgroundColor: eventColor }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.dayText,
                          (isToday || hasEvent) && styles.activeDayText
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.inactiveDayText}>{day}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Eventos astronômicos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eventos Astronômicos</Text>
          
          {astronomicalEvents.map((event) => (
            <TouchableOpacity 
              key={event.id}
              style={[styles.eventCard, { backgroundColor: `${event.color}30` }]}
            >
              <View style={styles.eventDate}>
                <Text style={styles.eventDay}>{event.day}</Text>
                <Text style={styles.eventMonth}>{event.month}</Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDescription}>{event.description}</Text>
              </View>
              <TouchableOpacity style={styles.notificationButton}>
                <Text style={[styles.notificationIcon, { color: event.color }]}>🔔</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Meditações especiais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meditações Especiais</Text>
          
          <View style={styles.meditationGrid}>
            {specialMeditations.map((meditation) => (
              <TouchableOpacity 
                key={meditation.id}
                style={styles.meditationCard}
                onPress={() => navigation.navigate('Player', { 
                  title: meditation.title,
                  duration: meditation.duration
                })}
              >
                <View style={[styles.meditationImage, {backgroundColor: meditation.color}]}>
                  <Text style={styles.placeholderText}>{meditation.title.split(' ').pop()}</Text>
                </View>
                <View style={styles.meditationOverlay}>
                  <Text style={styles.meditationTitle}>{meditation.title}</Text>
                  <Text style={styles.meditationDuration}>{meditation.duration} • {meditation.date}</Text>
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
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Library')}
        >
          <Text style={styles.navIcon}>📚</Text>
          <Text style={styles.navText}>Biblioteca</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
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
  calendarContainer: {
    backgroundColor: '#121330',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarNavButton: {
    padding: 8,
  },
  calendarNavButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCircle: {
    backgroundColor: '#6b3fa0',
  },
  dayText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  activeDayText: {
    fontWeight: 'bold',
  },
  inactiveDayText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.3,
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
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
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
  notificationButton: {
    padding: 8,
  },
  notificationIcon: {
    fontSize: 20,
  },
  meditationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meditationCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  meditationImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
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

export default CalendarScreen;
