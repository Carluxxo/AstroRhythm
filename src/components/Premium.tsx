import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Linking,
  Animated,
  Easing,
  ScrollView,
  Platform,
  UIManager,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  backgroundPrimary: "#050810",
  backgroundSecondary: "#111528",
  backgroundTertiary: "#1E2245",
  accentPrimary: "#8A4FFF",
  accentSecondary: "#4ECDC4",
  accentTertiary: "#FF6B6B",
  accentQuaternary: "#F7B801",
  textPrimary: "#FFFFFF",
  textSecondary: "#E0E0E0",
  textTertiary: "#A0A0B0",
  borderSubtle: "#606075",
  error: "#FF6B6B",
};

const FONTS = {
  title: "SpaceGrotesk-Bold",
  titleMedium: "SpaceGrotesk-Medium",
  body: "Inter-Regular",
  bodyMedium: "Inter-Medium",
  bodySemiBold: "Inter-SemiBold",
};

interface PremiumProps {
  visible: boolean;
  onClose: () => void;
}

interface Plan {
  id: string;
  title: string;
  price: string;
  period: string;
  description: string;
  tag: string;
  url: string;
  buttonColor: string;
  priceColor: string;
}

const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_SPACING = 20;
const ITEM_SIZE = CARD_WIDTH + CARD_SPACING;
const START_INDEX = 1; // 0 = mensal, 1 = trimestral, 2 = anual

const plans: Plan[] = [
  { id: 'monthly', title: 'Mensal', price: 'R$ 9,99', period: 'por mês', description: 'Ideal para novatos', tag: '10% OFF', url: 'https://exemplo.com/premium/mensal', buttonColor: COLORS.accentPrimary, priceColor: COLORS.accentPrimary },
  { id: 'quarterly', title: 'Trimestral', price: 'R$ 26,99', period: 'a cada 3 meses', description: 'Mais econômico', tag: 'MAIS POPULAR', url: 'https://exemplo.com/premium/trimestral', buttonColor: COLORS.accentSecondary, priceColor: COLORS.accentSecondary },
  { id: 'yearly', title: 'Anual', price: 'R$ 89,99', period: 'por ano', description: 'Melhor custo-benefício', tag: '40% OFF', url: 'https://exemplo.com/premium/anual', buttonColor: COLORS.accentQuaternary, priceColor: COLORS.accentQuaternary },
];

const Premium: React.FC<PremiumProps> = ({ visible, onClose }) => {
  const [activePlanIndex, setActivePlanIndex] = useState(START_INDEX);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const benefitAnimations = useRef(Array(7).fill(0).map(() => new Animated.Value(0))).current;

  const benefits = [
    { icon: 'chart-line', text: 'Estatísticas detalhadas de progresso' },
    { icon: 'clock', text: 'Acompanhamento do tempo de meditação' },
    { icon: 'star', text: 'Meditações premium exclusivas' },
    { icon: 'newspaper', text: 'Notícias astronômicas do mês' },
    { icon: 'calendar-star', text: 'Eventos astronômicos exclusivos' },
    { icon: 'headset', text: 'Suporte prioritário' },
    { icon: 'image', text: 'APOD da semana traduzido' },
  ];

  const horizontalPadding = (SCREEN_WIDTH - CARD_WIDTH) / 2;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        const animations = benefitAnimations.map((anim, i) =>
          Animated.timing(anim, { toValue: 1, duration: 200, delay: i * 30, useNativeDriver: true })
        );
        Animated.stagger(30, animations).start();
      });

      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: ITEM_SIZE * START_INDEX, animated: false });
      }
    }
  }, [visible]);

  const handleClose = (duration = 400) => {
    benefitAnimations.forEach(anim => anim.setValue(0));
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: duration - 100, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const handlePurchase = (url: string) => Linking.openURL(url);
  const onButtonPressIn = () => Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
  const onButtonPressOut = () => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const newIndex = Math.round(event.nativeEvent.contentOffset.x / ITEM_SIZE);
        setActivePlanIndex(newIndex);
      }
    }
  );

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* fundo */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity }]}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* container */}
      <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
        <View style={styles.dragIndicator} />
        <View style={styles.header}>
          <Text style={styles.title}>AstroRhythm Premium</Text>
          <Text style={styles.subtitle}>
            Desbloqueie o universo completo de meditações e recursos exclusivos
          </Text>
        </View>

        {/* carrossel */}
        <View style={styles.carouselWrapper}>
          <Animated.ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            snapToInterval={ITEM_SIZE}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContainer}
          >
            {plans.map((plan, i) => {
              const isFirst = i === 0;
              const isLast = i === plans.length - 1;
              
              const scale = scrollX.interpolate({
                inputRange: [(i - 1) * ITEM_SIZE, i * ITEM_SIZE, (i + 1) * ITEM_SIZE],
                outputRange: [0.9, 1, 0.9],
                extrapolate: 'clamp',
              });

              const shadowOpacity = scrollX.interpolate({
                inputRange: [(i - 1) * ITEM_SIZE, i * ITEM_SIZE, (i + 1) * ITEM_SIZE],
                outputRange: [0, 0.5, 0],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={plan.id}
                  style={[
                    styles.planCard,
                    {
                      shadowColor: plan.buttonColor,
                      shadowOpacity: shadowOpacity,
                      transform: [{ scale }],
                      // Lógica de margem corrigida para centralização universal
                      marginLeft: isFirst ? (SCREEN_WIDTH - CARD_WIDTH) / 2 : CARD_SPACING / 2,
                      marginRight: isLast ? (SCREEN_WIDTH - CARD_WIDTH) / 2 : CARD_SPACING / 2,
                    }
                  ]}
                >
                  <View style={[styles.planTag, { backgroundColor: plan.buttonColor }]}>
                    <Text style={styles.planTagText}>{plan.tag}</Text>
                  </View>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={[styles.planPrice, { color: plan.priceColor }]}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                  <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <TouchableOpacity
                      style={[styles.purchaseButton, { backgroundColor: plan.buttonColor }]}
                      onPressIn={onButtonPressIn}
                      onPressOut={onButtonPressOut}
                      onPress={() => handlePurchase(plan.url)}
                      activeOpacity={0.9}
                    >
                      <Text style={styles.purchaseButtonText}>Assinar Agora</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </Animated.View>
              );
            })}
          </Animated.ScrollView>
        </View>

        {/* indicadores */}
        <View style={styles.carouselIndicators}>
          {plans.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => {
              if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ x: ITEM_SIZE * i, animated: true });
                setActivePlanIndex(i);
              }
            }}>
              <View style={[
                styles.carouselIndicator,
                activePlanIndex === i && [styles.carouselIndicatorActive, { backgroundColor: plans[i].buttonColor }]
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* benefícios */}
        <ScrollView style={styles.benefitsContainer} showsVerticalScrollIndicator={false} scrollEnabled={false}>
          <Text style={styles.benefitsTitle}>Todos os planos incluem:</Text>
          {benefits.map((benefit, index) => (
            <Animated.View
              key={index}
              style={[
                styles.benefitItem,
                {
                  opacity: benefitAnimations[index],
                  transform: [{ translateY: benefitAnimations[index].interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }]
                },
              ]}
            >
              <MaterialCommunityIcons
                name={benefit.icon as any}
                size={20}
                color={COLORS.accentSecondary}
                style={styles.benefitIcon}
              />
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  container: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.backgroundSecondary, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 30, maxHeight: SCREEN_HEIGHT * 0.9 },
  dragIndicator: { width: 60, height: 5, backgroundColor: COLORS.borderSubtle, borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontFamily: FONTS.title, fontSize: 26, color: COLORS.textPrimary, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontFamily: FONTS.body, fontSize: 16, color: COLORS.textTertiary, textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 },
  carouselWrapper: { height: 320, width: SCREEN_WIDTH },
  carouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planCard: {
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: CARD_WIDTH,
    minHeight: 280,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 8
  },
  planTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, position: 'absolute', top: -12 },
  planTagText: { fontFamily: FONTS.bodySemiBold, fontSize: 12, color: COLORS.textPrimary },
  planTitle: { fontFamily: FONTS.titleMedium, fontSize: 22, color: COLORS.textPrimary, marginBottom: 8, textAlign: 'center', marginTop: 10 },
  planPrice: { fontFamily: FONTS.title, fontSize: 32, marginBottom: 4, textAlign: 'center' },
  planPeriod: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textTertiary, marginBottom: 8, textAlign: 'center' },
  planDescription: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 20, marginTop: 10 },
  purchaseButton: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 25, width: '100%', alignItems: 'center' },
  purchaseButtonText: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.textPrimary },
  carouselIndicators: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  carouselIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.borderSubtle, marginHorizontal: 4 },
  carouselIndicatorActive: { width: 16 },
  benefitsContainer: { marginBottom: 10 },
  benefitsTitle: { fontFamily: FONTS.titleMedium, fontSize: 18, color: COLORS.textPrimary, marginBottom: 12, textAlign: 'center' },
  benefitItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingHorizontal: 5 },
  benefitIcon: { marginRight: 10 },
  benefitText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textSecondary, flex: 1, lineHeight: 20 },
});

export default Premium;