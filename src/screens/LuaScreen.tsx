import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, FlatList, TouchableOpacity } from 'react-native';
import SunCalc from 'suncalc';
import MoonPhaseModal from '../components/MoonPhaseModal';
import moonPhasesData from '../data/moon_phases.json';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';

const COLORS = {
  backgroundPrimary: '#050810',
  backgroundSecondary: '#111528',
  accentPrimary: '#8A4FFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#E0E0E0',
  textTertiary: '#A0A0B0',
  accentSecondary: '#4ECDC4',
};

const FONTS = {
  title: 'SpaceGrotesk-Bold',
  titleMedium: 'SpaceGrotesk-Medium',
  body: 'Inter-Regular',
  bodySemiBold: 'Inter-SemiBold',
  bodyMedium: 'Inter-Medium',
};

export interface MoonPhase {
  name: string;
  icon: string;
  briefDescription: string;
  longDescription: string;
}

interface UpcomingMoonPhase extends MoonPhase {
  date: Date;
}

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  phaseIcon: string;
}

const moonImages: { [key: string]: any } = {
  new_moon: require('../../assets/moon_phases/blue_moon/new_moon.png'),
  waxing_crescent: require('../../assets/moon_phases/blue_moon/waxing_crescent.png'),
  first_quarter: require('../../assets/moon_phases/blue_moon/first_quarter.png'),
  waxing_gibbous: require('../../assets/moon_phases/blue_moon/waxing_gibbous.png'),
  full_moon: require('../../assets/moon_phases/blue_moon/full_moon.png'),
  waning_gibbous: require('../../assets/moon_phases/blue_moon/waning_gibbous.png'),
  third_quarter: require('../../assets/moon_phases/blue_moon/third_quarter.png'),
  waning_crescent: require('../../assets/moon_phases/blue_moon/waning_crescent.png'),
};

const phaseAbbreviations: { [key: string]: string } = {
  new_moon: 'Lua Nova',
  waxing_crescent: 'Cresc. Côncava',
  first_quarter: 'Quarto Crescente',
  waxing_gibbous: 'Cresc. Gibosa',
  full_moon: 'Lua Cheia',
  waning_gibbous: 'Ming. Gibosa',
  third_quarter: 'Quarto Minguante',
  waning_crescent: 'Ming. Côncava',
};

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const LuaScreen = () => {
  const [currentMoonPhaseData, setCurrentMoonPhaseData] = useState<MoonPhase | null>(null);
  const [nextPhases, setNextPhases] = useState<UpcomingMoonPhase[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMoonPhaseForModal, setSelectedMoonPhaseForModal] = useState<(MoonPhase & { date: Date | null; customMessage?: string }) | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const getMoonPhaseDetails = useCallback((iconName: string): MoonPhase | undefined => {
    return moonPhasesData.find(p => p.icon === iconName);
  }, []);

  const getPhaseNameFromIllumination = useCallback((phaseValue: number): string => {
    if (phaseValue < 0.0625) return 'new_moon';
    if (phaseValue < 0.1875) return 'waxing_crescent';
    if (phaseValue < 0.3125) return 'first_quarter';
    if (phaseValue < 0.4375) return 'waxing_gibbous';
    if (phaseValue < 0.5625) return 'full_moon';
    if (phaseValue < 0.6875) return 'waning_gibbous';
    if (phaseValue < 0.8125) return 'third_quarter';
    if (phaseValue < 0.9375) return 'waning_crescent';
    return 'new_moon';
  }, []);

  const calculateNextPhasesWithDates = useCallback((startDate: Date) => {
    const upcomingPhases: UpcomingMoonPhase[] = [];
    const foundPhases = new Set<string>();

    const todayIllum = SunCalc.getMoonIllumination(startDate);
    const currentPhase = getPhaseNameFromIllumination(todayIllum.phase);
    foundPhases.add(currentPhase);

    let dateCursor = new Date(startDate);
    dateCursor.setHours(0, 0, 0, 0);
    let daysChecked = 0;

    while (upcomingPhases.length < 8 && daysChecked < 180) {
      dateCursor.setDate(dateCursor.getDate() + 1);
      const illumination = SunCalc.getMoonIllumination(dateCursor);
      const phaseIcon = getPhaseNameFromIllumination(illumination.phase);

      if (!foundPhases.has(phaseIcon)) {
        const phaseDetails = getMoonPhaseDetails(phaseIcon);
        if (phaseDetails) {
          upcomingPhases.push({ ...phaseDetails, date: new Date(dateCursor) });
          foundPhases.add(phaseIcon);
        }
      }

      daysChecked++;
    }

    return upcomingPhases;
  }, [getMoonPhaseDetails, getPhaseNameFromIllumination]);

  const findPhaseStartDate = useCallback((targetDate: Date): Date => {
    const targetPhaseName = getPhaseNameFromIllumination(SunCalc.getMoonIllumination(targetDate).phase);
    let startDate = new Date(targetDate);

    for (let i = 0; i < 8; i++) {
      const tempDate = new Date(targetDate);
      tempDate.setDate(targetDate.getDate() - i);
      const tempPhaseName = getPhaseNameFromIllumination(SunCalc.getMoonIllumination(tempDate).phase);

      if (tempPhaseName === targetPhaseName) {
        startDate = tempDate;
      } else {
        break;
      }
    }
    return startDate;
  }, [getPhaseNameFromIllumination]);

  const generateCalendarDays = useCallback((year: number, month: number): (CalendarDay | null)[] => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysArray: (CalendarDay | null)[] = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const phaseIcon = getPhaseNameFromIllumination(SunCalc.getMoonIllumination(date).phase);
      daysArray.push({ date, dayOfMonth: i, isCurrentMonth: true, phaseIcon });
    }
    
    return daysArray;
  }, [getPhaseNameFromIllumination]);

  const calendarDays = useMemo(() =>
    generateCalendarDays(calendarDate.getFullYear(), calendarDate.getMonth()),
    [calendarDate, generateCalendarDays]
  );

  const updateMoonData = useCallback(() => {
    const today = new Date();
    const illumination = SunCalc.getMoonIllumination(today);
    const currentPhase = getPhaseNameFromIllumination(illumination.phase);
    const details = getMoonPhaseDetails(currentPhase);

    if (details) setCurrentMoonPhaseData(details);
    setNextPhases(calculateNextPhasesWithDates(today));
  }, [getPhaseNameFromIllumination, getMoonPhaseDetails, calculateNextPhasesWithDates]);

  useEffect(() => {
    const prefetchImages = async () => {
      const promises = Object.values(moonImages).map(source => {
        return ExpoImage.prefetch(source);
      });
      await Promise.all(promises);
    };
    prefetchImages();

    let timeoutId: NodeJS.Timeout;

    const scheduleNextUpdate = () => {
      const now = new Date();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1, 0);
      const msUntilMidnight = endOfDay.getTime() - now.getTime();

      timeoutId = setTimeout(() => {
        updateMoonData();
        scheduleNextUpdate();
      }, msUntilMidnight);
    };

    updateMoonData();
    scheduleNextUpdate();

    return () => clearTimeout(timeoutId);
  }, [updateMoonData]);

  const handleMoonPress = (moonData: MoonPhase, date: Date | null, customMessage?: string) => {
    const todayPhaseName = getPhaseNameFromIllumination(SunCalc.getMoonIllumination(new Date()).phase);

    if (date && moonData.icon === todayPhaseName) {
      setSelectedMoonPhaseForModal({ ...moonData, date: null, customMessage });
      setIsModalVisible(true);
      return;
    }
    
    let targetDate = date;
    if (date && new Date(date).toDateString() === new Date().toDateString()) {
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        targetDate = endOfToday;
    }

    setSelectedMoonPhaseForModal({ ...moonData, date: targetDate, customMessage });
    setIsModalVisible(true);
  };

  const handleDayPress = (day: CalendarDay | null) => {
    if (!day) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(day.date);
    clickedDate.setHours(0, 0, 0, 0);

    if (clickedDate < today) {
      return;
    }

    const phaseDetails = getMoonPhaseDetails(day.phaseIcon);
    if (!phaseDetails) return;

    const phaseStartDate = findPhaseStartDate(day.date);
    handleMoonPress(phaseDetails, phaseStartDate);
  };

  const changeMonth = (increment: number) => {
    setCalendarDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + increment, 1);
      return newDate;
    });
  };

  const handleCountdownEnd = useCallback(() => {
    setIsModalVisible(false);
    setSelectedMoonPhaseForModal(null);
    updateMoonData();
  }, [updateMoonData]);

  if (!currentMoonPhaseData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando dados da lua...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Fases da Lua</Text>
        <Text style={styles.leadText}>Acompanhe o ciclo lunar e seus mistérios.</Text>
      </View>

      <Pressable
        style={styles.moonContainer}
        onPress={() => handleMoonPress(currentMoonPhaseData, new Date())}
      >
        <View style={styles.moonGlow} />
        <ExpoImage
          source={moonImages[currentMoonPhaseData.icon]}
          style={styles.mainMoonImage}
          contentFit="contain" // Corrected
        />
        <Text style={styles.moonPhaseTitle}>{phaseAbbreviations[currentMoonPhaseData.icon]}</Text>
        <Text style={styles.phaseDescription}>{currentMoonPhaseData.briefDescription}</Text>
      </Pressable>

      <View style={styles.nextPhasesSection}>
        <Text style={styles.sectionTitle}>Próximas Fases</Text>
        <FlatList
          data={nextPhases}
          keyExtractor={(item) => item.icon}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainerStyle}
          renderItem={({ item }) => (
            <Pressable
              style={styles.phaseCard}
              onPress={() => handleMoonPress(item, item.date)}
            >
              <ExpoImage
                source={moonImages[item.icon]}
                style={styles.carouselMoonImage}
                contentFit="contain" // Corrected
              />
              <Text style={styles.phaseName}>{phaseAbbreviations[item.icon]}</Text>
              <Text style={styles.phaseDate}>{item.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</Text>
            </Pressable>
          )}
        />
      </View>

      <View style={styles.calendarWrapper}>
        <View style={styles.calendarHeader}>
            <Text style={styles.calendarMonthYear}>{`${monthNames[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`}</Text>
        </View>
        
        <View style={styles.calendarBody}>
          <View style={styles.weekdaysContainer}>
              {daysOfWeek.map((day, index) => (
                  <Text key={index} style={styles.weekdayText}>{day}</Text>
              ))}
          </View>
          <FlatList
              data={calendarDays}
              keyExtractor={(item, index) => item?.date.toISOString() ?? `empty-${index}`}
              numColumns={7}
              scrollEnabled={false}
              renderItem={({ item }) => {
                  if (!item) {
                      return <View style={styles.dayCellContainer} />;
                  }
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const itemDate = new Date(item.date);
                  itemDate.setHours(0, 0, 0, 0);

                  const isToday = itemDate.getTime() === today.getTime();
                  const isPast = itemDate < today;

                  return (
                    <Pressable
                      style={[styles.dayCellContainer, isPast && styles.pastDayContainer]}
                      onPress={() => handleDayPress(item)}
                      disabled={isPast}
                    >
                      <View style={[styles.dayCell, isToday && styles.todayCell]}>
                        <ExpoImage 
                            source={moonImages[item.phaseIcon]} 
                            style={styles.dayMoonIcon}
                            contentFit="contain" // Corrected
                        />
                        <Text style={[styles.dayText, isToday && styles.todayText]}>
                          {item.dayOfMonth}
                        </Text>
                      </View>
                    </Pressable>
                  );
              }}
          />
        </View>
      </View>

      <MoonPhaseModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        moonData={selectedMoonPhaseForModal}
        onCountdownEnd={handleCountdownEnd}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundPrimary },
  scrollContentContainer: { paddingBottom: 120 },
  header: { marginTop: Platform.OS === 'ios' ? 60 : 50, marginBottom: 20, paddingHorizontal: 20, },
  title: { fontFamily: FONTS.title, fontSize: 28, color: COLORS.textPrimary, marginBottom: 4 },
  leadText: { fontFamily: FONTS.body, fontSize: 16, color: COLORS.textTertiary },
  moonContainer: { alignItems: 'center', backgroundColor: COLORS.backgroundSecondary, borderRadius: 20, padding: 20, marginBottom: 35, marginHorizontal: 20 },
  mainMoonImage: { width: 120, height: 120, zIndex: 1 }, // `resizeMode` removed
  moonGlow: {
    width: 115,
    height: 115,
    borderRadius: 115 / 2,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 22.5,
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    zIndex: 0,
  },
  moonPhaseTitle: { fontFamily: FONTS.titleMedium, fontSize: 22, color: COLORS.textPrimary, marginTop: 15, marginBottom: 10 },
  phaseDescription: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.textSecondary, lineHeight: 24, textAlign: 'center' },
  nextPhasesSection: { marginBottom: 35 },
  sectionTitle: { fontFamily: FONTS.titleMedium, fontSize: 22, color: COLORS.textPrimary, marginBottom: 20, paddingHorizontal: 20 },
  carouselContainerStyle: {
    paddingHorizontal: 20,
    gap: 15,
  },
  phaseCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 16,
    padding: 18,
    width: 170,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselMoonImage: { width: 60, height: 60, marginBottom: 12 }, // `resizeMode` removed
  phaseDate: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textTertiary, marginTop: 5 },
  phaseName: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.textSecondary, marginTop: 10, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundPrimary },
  loadingText: { fontFamily: FONTS.body, fontSize: 16, color: COLORS.textSecondary },

  calendarWrapper: {
    marginHorizontal: 20,
    marginBottom: 35,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  calendarBody: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 20,
    padding: 15,
  },
  calendarMonthYear: {
    fontFamily: FONTS.titleMedium,
    fontSize: 20,
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
    width: `${100 / 7}%`,
    textAlign: 'center',
  },
  dayCellContainer: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  dayCell: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  todayCell: {
    borderColor: COLORS.accentPrimary,
    borderWidth: 1.5,
  },
  dayMoonIcon: {
    width: '65%',
    height: '65%',
    position: 'absolute',
    opacity: 0.7,
  }, // `resizeMode` removed
  dayText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.textSecondary,
    position: 'absolute',
    bottom: 4,
    right: 6,
    backgroundColor: 'rgba(17, 21, 40, 0.5)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  todayText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  inactiveDayText: {
    color: COLORS.textTertiary + '60',
  },
  pastDayContainer: {
    opacity: 0.4,
  },
});

export default LuaScreen;