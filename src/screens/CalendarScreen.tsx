import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Platform, Pressable } from 'react-native'; // Added Platform, Pressable
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { BlurView } from 'expo-blur'; // Import BlurView for glassmorphism
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons

// Importar dados das meditações e eventos
import meditationJsonData from '../data/meditations.json';
import eventJsonData from '../data/astronomical_events.json';

// --- Cores (Reutilizando as definidas no Dashboard) ---
const COLORS = {
  backgroundPrimary: '#050810',
  backgroundSecondary: '#111528',
  backgroundTertiary: '#1E2245',
  accentPrimary: '#8A4FFF',
  accentSecondary: '#4ECDC4',
  accentTertiary: '#FF6B6B',
  accentQuaternary: '#F7B801',
  textPrimary: '#FFFFFF',
  textSecondary: '#E0E0E0',
  textTertiary: '#A0A0B0',
  borderSubtle: '#606075',
};

// --- Fontes (Reutilizando as definidas no Dashboard) ---
const FONTS = {
  title: 'SpaceGrotesk-Bold',
  titleMedium: 'SpaceGrotesk-Medium',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
};

// Interfaces
interface AstronomicalEvent {
  id: string;
  day: number;
  month: number;
  year: number;
  title: string;
  description: string;
  color: string;
  viewing_tips: string[];
}

interface Meditation {
  id: string;
  title: string;
  description: string;
  duration_seconds: number;
  category: string;
  audio_url: string;
  image_url?: string;
  is_premium: boolean;
  related_event_id?: string | null;
  related_event_type?: string | null;
}

// Função para formatar segundos
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
};

type CalendarScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Calendar'>;

const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

const CalendarScreen = () => {
  const navigation = useNavigation<CalendarScreenNavigationProp>();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 3, 1)); // Abril 2025
  const [events, setEvents] = useState<AstronomicalEvent[]>([]);
  const [allMeditations, setAllMeditations] = useState<Meditation[]>([]);
  const [specialMeditationsForMonth, setSpecialMeditationsForMonth] = useState<Meditation[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingMeditations, setLoadingMeditations] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AstronomicalEvent | null>(null);

  const currentMonthNumber = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Carregar eventos
  useEffect(() => {
    setLoadingEvents(true);
    try {
      setEvents(eventJsonData as AstronomicalEvent[]);
    } catch (e) {
      console.error("Failed to load local events:", e);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  // Carregar meditações
  useEffect(() => {
    setLoadingMeditations(true);
    try {
      setAllMeditations(meditationJsonData as Meditation[]);
    } catch (e) {
      console.error("Failed to load meditations:", e);
    } finally {
      setLoadingMeditations(false);
    }
  }, []);

  // Filtrar meditações especiais
  useEffect(() => {
    if (!loadingEvents && !loadingMeditations) {
      const eventsThisMonth = events.filter(event => event.month === currentMonthNumber && event.year === currentYear);
      const eventTypesThisMonth = new Set(eventsThisMonth.map(event => event.title));

      const relevantMeditations = allMeditations.filter(meditation =>
        meditation.related_event_type &&
        Array.from(eventTypesThisMonth).some(eventType =>
            eventType.includes(meditation.related_event_type!)
        )
      );
      setSpecialMeditationsForMonth(relevantMeditations);
    }
  }, [events, allMeditations, loadingEvents, loadingMeditations, currentMonthNumber, currentYear]);

  // --- Geração do Calendário --- 
  const generateCalendarDays = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 = Domingo, 1 = Segunda...
    const daysArray = [];

    // Dias do mês anterior (para preencher o início)
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push({ day: daysInPrevMonth - firstDayOfMonth + 1 + i, isCurrentMonth: false });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push({ day: i, isCurrentMonth: true });
    }

    // Dias do próximo mês (para preencher o final)
    const remainingCells = 42 - daysArray.length; // 6 linhas * 7 dias
    for (let i = 1; i <= remainingCells; i++) {
      daysArray.push({ day: i, isCurrentMonth: false });
    }

    return daysArray;
  };

  const calendarDays = generateCalendarDays(currentYear, currentMonthNumber);

  const handleEventClick = (event: AstronomicalEvent) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const handleMeditationClick = (meditation: Meditation) => {
     navigation.navigate('Player', {
        title: meditation.title,
        duration: formatDuration(meditation.duration_seconds),
        audio_url: meditation.audio_url,
     });
  };

  const changeMonth = (increment: number) => {
      setCurrentDate(prevDate => {
          const newDate = new Date(prevDate);
          newDate.setMonth(prevDate.getMonth() + increment);
          return newDate;
      });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Calendário Cósmico</Text>
          <Text style={styles.subtitle}>Eventos e meditações especiais</Text>
        </View>

        {/* Calendário mensal */}
        <View style={styles.calendarContainer}>
           <View style={styles.calendarHeader}>
            <TouchableOpacity style={styles.calendarNavButton} onPress={() => changeMonth(-1)}>
              <Ionicons name="chevron-back" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>{`${monthNames[currentDate.getMonth()]} ${currentYear}`}</Text>
            <TouchableOpacity style={styles.calendarNavButton} onPress={() => changeMonth(1)}>
              <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdaysContainer}>
            {daysOfWeek.map((day, index) => (
              <Text key={index} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>

          <View style={styles.daysContainer}>
            {calendarDays.map(({ day, isCurrentMonth }, index) => {
              const today = new Date();
              const isToday = isCurrentMonth && day === today.getDate() && currentMonthNumber === today.getMonth() + 1 && currentYear === today.getFullYear();
              const eventOnDay = isCurrentMonth ? events.find(event => event.day === day && event.month === currentMonthNumber && event.year === currentYear) : undefined;
              const hasEvent = !!eventOnDay;
              const eventColor = eventOnDay?.color || COLORS.accentPrimary; // Cor padrão se não definida

              return (
                <View key={index} style={styles.dayCell}>
                  {isCurrentMonth ? (
                    <TouchableOpacity
                      style={styles.dayButton}
                      onPress={() => eventOnDay && handleEventClick(eventOnDay)}
                      disabled={!hasEvent}
                    >
                      <View style={[styles.dayInnerContainer, isToday && styles.todayIndicator]}>
                        <Text style={[styles.dayText, isToday && styles.todayText]}>
                          {day}
                        </Text>
                        {hasEvent && <View style={[styles.eventDot, { backgroundColor: eventColor }]} />} 
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.dayInnerContainer}>
                       <Text style={styles.inactiveDayText}>{day}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Eventos astronômicos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eventos Astronômicos ({monthNames[currentDate.getMonth()]})</Text>
          {loadingEvents ? (
            <ActivityIndicator size="large" color={COLORS.textPrimary} />
          ) : (
            events.filter(event => event.month === currentMonthNumber && event.year === currentYear).map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard} // Fundo sólido agora
                onPress={() => handleEventClick(event)}
              >
                <View style={[styles.eventDateIndicator, { backgroundColor: event.color || COLORS.accentPrimary }]} />
                <View style={styles.eventDate}>
                  <Text style={styles.eventDay}>{event.day}</Text>
                  <Text style={styles.eventMonth}>{monthNames[event.month - 1]}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDescription} numberOfLines={2}>{event.description}</Text>
                </View>
                {/* Ícone de sino (opcional, funcionalidade futura) */}
                {/* <TouchableOpacity style={styles.notificationButton} disabled>
                  <Ionicons name="notifications-outline" size={22} color={COLORS.textTertiary} />
                </TouchableOpacity> */}
                <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} style={styles.eventArrow} />
              </TouchableOpacity>
            ))
          )}
          {events.filter(event => event.month === currentMonthNumber && event.year === currentYear).length === 0 && !loadingEvents && (
             <Text style={styles.noItemsText}>Nenhum evento astronômico para este mês.</Text>
          )}
        </View>

        {/* Meditações especiais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meditações Especiais (Relacionadas)</Text>
          {loadingMeditations || loadingEvents ? (
             <ActivityIndicator size="small" color={COLORS.textPrimary} />
          ) : specialMeditationsForMonth.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.meditationScrollContainer}>
              {specialMeditationsForMonth.map((meditation) => (
                <TouchableOpacity
                  key={meditation.id}
                  style={styles.meditationCard}
                  onPress={() => handleMeditationClick(meditation)}
                >
                   <View style={styles.meditationImageContainer}>
                     {/* Imagem ou Placeholder */}
                     <View style={[styles.meditationImage, {backgroundColor: COLORS.accentSecondary}]}>
                       <MaterialCommunityIcons name="meditation" size={40} color={`${COLORS.backgroundPrimary}99`} />
                     </View>
                     {meditation.is_premium && (
                        <View style={styles.premiumBadge}>
                            <Ionicons name="star" size={12} color={COLORS.accentQuaternary} />
                        </View>
                     )}
                  </View>
                  <View style={styles.meditationInfo}>
                    <Text style={styles.meditationTitle} numberOfLines={1}>{meditation.title}</Text>
                    <Text style={styles.meditationDuration}>{formatDuration(meditation.duration_seconds)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noItemsText}>Nenhuma meditação especial para os eventos deste mês.</Text>
          )}
        </View>

      </ScrollView>

      {/* Modal com Glassmorphism */}
       <Modal
        animationType="fade" // Fade fica melhor com blur
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          setSelectedEvent(null);
        }}
      >
        <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{selectedEvent?.title}</Text>
            <Text style={styles.modalDescription}>{selectedEvent?.description}</Text>
            <Text style={styles.modalSectionTitle}>Dicas de Visualização:</Text>
            <ScrollView style={styles.tipsScrollView}>
              {selectedEvent?.viewing_tips.map((tip, index) => (
                <Text key={index} style={styles.modalText}>• {tip.replace(/\*\*/g, '')}</Text>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(!modalVisible)}>
                <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>

      {/* Navegação inferior (Reutilizar do Dashboard) */}
       <BlurView intensity={90} tint="dark" style={styles.navbarContainer}>
         <View style={styles.navbar}>
           <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}> 
             <Ionicons name="home-outline" size={24} color={COLORS.textTertiary} />
             <Text style={styles.navText}>Início</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Library')}> 
             <Ionicons name="library-outline" size={24} color={COLORS.textTertiary} />
             <Text style={styles.navText}>Biblioteca</Text>
           </TouchableOpacity>
           {/* Item Ativo */}
           <TouchableOpacity style={styles.navItem}>
             <View style={styles.navItemActiveIndicator} />
             <Ionicons name="calendar" size={24} color={COLORS.accentPrimary} />
             <Text style={[styles.navText, styles.navTextActive]}>Eventos</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.navItem} disabled> 
             <Ionicons name="person-outline" size={24} color={COLORS.textTertiary} />
             <Text style={styles.navText}>Perfil</Text>
           </TouchableOpacity>
         </View>
       </BlurView>
    </View>
  );
};

// --- Estilos Refinados ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
      padding: 20,
      paddingBottom: 100, // Espaço para navbar
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 50 : 40,
    marginBottom: 30,
  },
  title: {
    fontFamily: FONTS.title,
    fontSize: 28,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.textTertiary,
  },
  // --- Calendário --- 
  calendarContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 35,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarNavButton: {
    padding: 8,
  },
  calendarTitle: {
    fontFamily: FONTS.titleMedium,
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekdayText: {
    flex: 1, // Distribuir igualmente
    textAlign: 'center',
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textTertiary,
    opacity: 0.8,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`, // 7 colunas
    aspectRatio: 1, // Manter quadrado
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2, // Pequeno espaço entre células
  },
  dayButton: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
  },
  dayInnerContainer: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8, // Leve arredondamento interno
      position: 'relative', // Para o ponto do evento
  },
  todayIndicator: {
      backgroundColor: `${COLORS.accentSecondary}30`, // Fundo sutil para hoje
      borderWidth: 1,
      borderColor: COLORS.accentSecondary,
  },
  dayText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  todayText: {
      color: COLORS.accentSecondary, // Cor de destaque para hoje
      fontWeight: 'bold',
  },
  inactiveDayText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textTertiary,
    opacity: 0.4,
  },
  eventDot: {
      position: 'absolute',
      bottom: 4,
      width: 6,
      height: 6,
      borderRadius: 3,
  },
  // --- Eventos --- 
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontFamily: FONTS.titleMedium,
    fontSize: 22,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 18,
    marginBottom: 12,
    alignItems: 'center',
    overflow: 'hidden', // Para o indicador lateral
    position: 'relative',
  },
  eventDateIndicator: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 5,
  },
  eventDate: {
    alignItems: 'center',
    marginRight: 18,
    marginLeft: 10, // Espaço após o indicador
    width: 45,
  },
  eventDay: {
    fontFamily: FONTS.titleMedium,
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  eventMonth: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  eventInfo: {
    flex: 1,
    marginRight: 10,
  },
  eventTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  eventDescription: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textTertiary,
    lineHeight: 20,
  },
  eventArrow: {
      marginLeft: 'auto', // Empurra para a direita
  },
  noItemsText: {
      fontFamily: FONTS.body,
      color: COLORS.textTertiary,
      opacity: 0.8,
      marginTop: 10,
      textAlign: 'center',
      width: '100%',
      fontSize: 15,
  },
  // --- Meditações Especiais --- 
  meditationScrollContainer: {
      paddingRight: 20, // Espaço no final do scroll horizontal
  },
  meditationCard: {
    width: 160, // Largura fixa para scroll horizontal
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundSecondary,
  },
  meditationImageContainer: {
      aspectRatio: 1,
      position: 'relative',
  },
  meditationImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: `${COLORS.backgroundPrimary}99`,
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
  },
  meditationInfo: {
    padding: 12,
  },
  meditationTitle: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  meditationDuration: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  // --- Modal --- 
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalView: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: COLORS.backgroundSecondary, // Fundo sólido dentro do blur
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: FONTS.titleMedium,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textTertiary,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalSectionTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  tipsScrollView: {
    width: '100%',
    marginBottom: 20,
    maxHeight: 200, // Limitar altura do scroll
  },
  modalText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textTertiary,
    marginBottom: 8,
    lineHeight: 22,
  },
  closeButton: {
      backgroundColor: COLORS.accentPrimary,
      borderRadius: 25,
      paddingVertical: 12,
      paddingHorizontal: 30,
      marginTop: 10,
  },
  closeButtonText: {
      fontFamily: FONTS.bodySemiBold,
      color: COLORS.textPrimary,
      fontSize: 16,
  },
  // --- Navbar (Reutilizado do Dashboard) --- 
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 75,
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
    borderTopWidth: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  navItemActiveIndicator: {
      position: 'absolute',
      top: 8,
      width: 24,
      height: 3,
      backgroundColor: COLORS.accentPrimary,
      borderRadius: 2,
  },
  navIcon: {
    // Usar Ionicons agora
    marginBottom: 5,
  },
  navText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  navTextActive: {
    color: COLORS.accentPrimary,
  },
});

export default CalendarScreen;

