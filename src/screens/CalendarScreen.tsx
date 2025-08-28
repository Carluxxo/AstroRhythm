import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, RefreshControl, FlatList, Image, Animated, PanResponder, Dimensions, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Data
import eventJsonData from '../data/astronomical_events.json';

// Components
import EventModal, { AstronomicalEvent as ModalEventType } from '../components/EventModal'; // Renamed to avoid conflict

// --- Cores ---
const COLORS = {
  backgroundPrimary: '#050810',
  backgroundSecondary: '#111528',
  backgroundTertiary: '#1E2245',
  accentPrimary: '#8A4FFF',
  accentSecondary: '#4ECDC4',
  textPrimary: '#FFFFFF',
  textSecondary: '#E0E0E0',
  textTertiary: '#A0A0B0',
  error: '#FF6B6B',
};

// --- Fontes ---
const FONTS = {
  title: 'SpaceGrotesk-Bold',
  titleMedium: 'SpaceGrotesk-Medium',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
};

// Interface for events from JSON (original structure)
interface JsonEvent {
  id: string;
  day: number;
  month: number; // 1-indexed
  year: number;
  title: string;
  description: string;
  color: string;
  viewing_tips: string[];
  image_url?: string; // Added for consistency with modal if available in future
  type?: string; // Added for consistency with modal if available in future
}

type CalendarScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Calendar'>;

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const SCREEN_WIDTH = Dimensions.get('window').width;

const CalendarScreen = () => {
  const navigation = useNavigation<CalendarScreenNavigationProp>();
  const [currentDate, setCurrentDate] = useState(new Date()); // Start with current month
  const [events, setEvents] = useState<JsonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedEventForModal, setSelectedEventForModal] = useState<ModalEventType | null>(null);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);

  const currentDisplayMonth = currentDate.getMonth(); // 0-indexed
  const currentDisplayYear = currentDate.getFullYear();

  const translateX = React.useRef(new Animated.Value(0)).current;
  const [animatingMonth, setAnimatingMonth] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const loadEvents = useCallback(() => {
    setLoading(true);
    try {
      // Simulate API call or data processing
      const typedEvents = eventJsonData as JsonEvent[];
      setEvents(typedEvents);
    } catch (e) {
      console.error("Failed to load events:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  const generateCalendarDays = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysArray = [];
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push({ day: daysInPrevMonth - firstDayOfMonth + 1 + i, isCurrentMonth: false, key: `prev-${i}` });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push({ day: i, isCurrentMonth: true, key: `curr-${i}` });
    }
    const remainingCells = 42 - daysArray.length;
    for (let i = 1; i <= remainingCells; i++) {
      daysArray.push({ day: i, isCurrentMonth: false, key: `next-${i}` });
    }
    return daysArray;
  };

  const calendarDays = generateCalendarDays(currentDisplayYear, currentDisplayMonth);

  const handleEventPress = (event: JsonEvent) => {
    const modalEventData: ModalEventType = {
      id: event.id,
      title: event.title,
      // Ensure month is 0-indexed for Date constructor, then format
      date: `${event.year}-${String(event.month).padStart(2, '0')}-${String(event.day).padStart(2, '0')}`,
      description: event.description,
      type: event.type || "Evento Astronômico", // Use event.type or default
      image_url: event.image_url, // Pass image_url if it exists
    };
    setSelectedEventForModal(modalEventData);
    setIsEventModalVisible(true);
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + increment, 1); // Set day to 1 to avoid month skipping issues
      
      // Implement month/year limits as per todo.md
      const today = new Date();
      const currentYear = today.getFullYear();
      const minDate = new Date(currentYear, 0, 1); // Jan 1st of current year
      const maxDate = new Date(currentYear, 11, 31); // Dec 31st of current year

      if (newDate < minDate && increment < 0) return minDate;
      if (newDate > maxDate && increment > 0) return maxDate;
      
      translateX.setValue(0);
      return newDate;
    });
  };
  
  // Determine if nav buttons should be disabled
  const todayForLimits = new Date();
  const currentYearForLimits = todayForLimits.getFullYear();
  const isMinMonth = currentDisplayYear === currentYearForLimits && currentDisplayMonth === 0;
  const isMaxMonth = currentDisplayYear === currentYearForLimits && currentDisplayMonth === 11;

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => (
        Math.abs(gestureState.dx) > 10 &&
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2
      ),
      onPanResponderGrant: () => setIsSwiping(true),
      onPanResponderMove: (_, gestureState) => {
        if (!animatingMonth) {
          // Trava Y completamente
          translateX.setValue(Math.max(Math.min(gestureState.dx, SCREEN_WIDTH), -SCREEN_WIDTH));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (animatingMonth) { setIsSwiping(false); return; }
        const velocity = gestureState.vx;
        if ((gestureState.dx < -SCREEN_WIDTH / 6 || velocity < -0.3) && !isMaxMonth) {
          setAnimatingMonth(true);
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -SCREEN_WIDTH,
              duration: 250,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start(() => {
            translateX.setValue(SCREEN_WIDTH);
            changeMonth(1);
            Animated.parallel([
              Animated.timing(translateX, {
                toValue: 0,
                duration: 250,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
              }),
            ]).start(() => {
              setAnimatingMonth(false);
              setIsSwiping(false);
            });
          });
        } else if ((gestureState.dx > SCREEN_WIDTH / 6 || velocity > 0.3) && !isMinMonth) {
          setAnimatingMonth(true);
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: SCREEN_WIDTH,
              duration: 250,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start(() => {
            translateX.setValue(-SCREEN_WIDTH);
            changeMonth(-1);
            Animated.parallel([
              Animated.timing(translateX, {
                toValue: 0,
                duration: 250,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
              }),
            ]).start(() => {
              setAnimatingMonth(false);
              setIsSwiping(false);
            });
          });
        } else {
          Animated.timing(translateX, {
            toValue: 0,
            duration: 200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start(() => setIsSwiping(false));
        }
      },
      onPanResponderTerminate: () => {
        Animated.timing(translateX, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => setIsSwiping(false));
      },
    })
  ).current;

  const renderEventItem = ({ item }: { item: JsonEvent }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(item)}
    >
      {item.image_url && 
        <Image source={{uri: item.image_url}} style={styles.eventCardImage} />
      }
      <View style={styles.eventCardContent}>
        <View style={styles.eventDate}>
            <Text style={styles.eventDay}>{item.day}</Text>
            <Text style={styles.eventMonth}>{monthNames[item.month -1].substring(0,3).toUpperCase()}</Text>
        </View>
        <View style={styles.eventInfo}>
            <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.eventDescription} numberOfLines={2}>{item.description}</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={22} color={COLORS.textTertiary} />
      </View>
    </TouchableOpacity>
  );
  
  const eventsForCurrentMonth = events.filter(event => event.month === (currentDisplayMonth + 1) && event.year === currentDisplayYear);

  if (loading && !refreshing) {
    return (
        <View style={[styles.container, styles.centeredLoading]}>
            <ActivityIndicator size="large" color={COLORS.accentPrimary} />
            <Text style={{color: COLORS.textSecondary, marginTop: 10}}>Carregando Calendário...</Text>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.textSecondary} />}
        scrollEnabled={!isSwiping}
      >
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Calendário Cósmico</Text>
          <Text style={styles.pageSubtitle}>Eventos e datas importantes</Text>
        </View>

        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity style={styles.calendarNavButton} onPress={() => changeMonth(-1)} disabled={isMinMonth}>
              <Ionicons name="chevron-back" size={26} color={isMinMonth ? COLORS.textTertiary + '80' : COLORS.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.calendarMonthYear}>{`${monthNames[currentDisplayMonth]} ${currentDisplayYear}`}</Text>
            <TouchableOpacity style={styles.calendarNavButton} onPress={() => changeMonth(1)} disabled={isMaxMonth}>
              <Ionicons name="chevron-forward" size={26} color={isMaxMonth ? COLORS.textTertiary + '80' : COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.weekdaysContainer}>
            {daysOfWeek.map((day, index) => (
              <Text key={index} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>
          <Animated.View
            style={[
              styles.daysGridContainer,
              { transform: [{ translateX }], opacity: fadeAnim }
            ]}
            {...panResponder.panHandlers}
          >
            {calendarDays.map((dayObj) => {
              const isToday = dayObj.isCurrentMonth && dayObj.day === new Date().getDate() && currentDisplayMonth === new Date().getMonth() && currentDisplayYear === new Date().getFullYear();
              const eventOnDay = dayObj.isCurrentMonth ? events.find(e => e.day === dayObj.day && e.month === (currentDisplayMonth + 1) && e.year === currentDisplayYear) : undefined;
              return (
                <View key={dayObj.key} style={styles.dayCellContainer}>
                  {dayObj.isCurrentMonth ? (
                    <TouchableOpacity 
                        style={[styles.dayCell, isToday && styles.todayCell, eventOnDay && styles.eventDayCell]} 
                        onPress={() => eventOnDay && handleEventPress(eventOnDay)}
                        disabled={!eventOnDay}
                    >
                      <Text style={[styles.dayText, isToday && styles.todayText, !eventOnDay && styles.noEventDayText]}>
                        {dayObj.day}
                      </Text>
                      {eventOnDay && <View style={[styles.eventDot, {backgroundColor: eventOnDay.color || COLORS.accentPrimary}]} />}
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.dayCell}><Text style={styles.inactiveDayText}>{dayObj.day}</Text></View>
                  )}
                </View>
              );
            })}
          </Animated.View>
        </View>

        <View style={styles.sectionEventsList}>
          <Text style={styles.sectionTitle}>Eventos em {monthNames[currentDisplayMonth]}</Text>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.textPrimary} style={{marginTop: 20}}/>
          ) : eventsForCurrentMonth.length > 0 ? (
            <FlatList
              data={eventsForCurrentMonth}
              renderItem={renderEventItem}
              keyExtractor={item => item.id}
              scrollEnabled={false} // Disable FlatList scrolling, parent ScrollView handles it
            />
          ) : (
            <Text style={styles.noItemsText}>Nenhum evento astronômico para este mês.</Text>
          )}
        </View>

      </ScrollView>

      <EventModal
        visible={isEventModalVisible}
        onClose={() => setIsEventModalVisible(false)}
        eventData={selectedEventForModal}
      />
      {/* CustomBottomNavbar is rendered by AppNavigator */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
  },
  centeredLoading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 100, // Space for navbar
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 50 : 40,
    marginBottom: 25,
  },
  pageTitle: {
    fontFamily: FONTS.title,
    fontSize: 28,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.textTertiary,
  },
  calendarContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 20,
    padding: 15,
    marginBottom: 30,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  calendarNavButton: {
    padding: 8,
  },
  calendarMonthYear: {
    fontFamily: FONTS.titleMedium,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textTertiary,
    width: '14.28%',
    textAlign: 'center',
  },
  daysGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellContainer: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1, // Make cells square
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2, // Small padding for cell content
  },
  dayCell: {
    width: '90%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8, // Rounded corners for cells
  },
  todayCell: {
    backgroundColor: COLORS.accentSecondary + '40', // Highlight for today
    borderColor: COLORS.accentSecondary,
    borderWidth: 1.5,
  },
  eventDayCell: {
    // backgroundColor: COLORS.accentPrimary + '20', // Subtle highlight for event days
  },
  dayText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  todayText: {
    color: COLORS.accentSecondary,
    fontWeight: 'bold',
  },
  noEventDayText: {
    color: COLORS.textTertiary, // Dimmer for days without events but in current month
  },
  inactiveDayText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textTertiary + '60', // Very dim for days not in current month
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 5,
  },
  sectionEventsList: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FONTS.titleMedium,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  eventCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventCardImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: COLORS.backgroundTertiary, // Placeholder bg
  },
  eventCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDate: {
    alignItems: 'center',
    marginRight: 15,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: COLORS.backgroundTertiary, // Background for date
    borderRadius: 8,
  },
  eventDay: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  eventMonth: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  eventDescription: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  noItemsText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
});

export default CalendarScreen;

