import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { House, Books, CalendarBlank, Moon, User } from 'phosphor-react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useNavbar } from '../contexts/NavbarContext'; // Importar o hook do contexto

// Colors from design_guidelines/color_palette.md
const COLORS = {
  primaryHighlight: '#8A4FFF', // Roxo Elétrico
  secondaryHighlight: '#4ECDC4', // Turquesa Brilhante
  baseSecondaryDark: '#111528', // Azul Marinho Escuro (for blur tint)
  textNeutralLight: '#E0E0E0', // Branco Gelo
  textNeutralMedium: '#A0A0B0', // Cinza Claro Azulado
  white: '#FFFFFF',
};

// Typography from design_guidelines/typography.md
const TYPOGRAPHY = {
  labelFontFamily: 'Inter-Regular',
  labelFontSize: 11,
  labelFontFamilyMedium: 'Inter-Medium',
};

const ICON_SIZE = 24;
const NAVBAR_HEIGHT = 65;

const CustomBottomNavbar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { navbarVisible, navbarAnim } = useNavbar(); // Usar o hook do contexto
  
  // Interpolação para mover a navbar para baixo
  const translateY = navbarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, NAVBAR_HEIGHT + 20], // Move a navbar para baixo (altura + margem)
  });
  
  // Se a navbar não estiver visível, não renderizar nada
  if (!navbarVisible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <BlurView intensity={80} tint="dark" style={styles.blurViewContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? typeof options.tabBarLabel === 'function'
              ? options.tabBarLabel({
                  focused: state.index === index,
                  color: '',
                  children: '',
                  position: 'below-icon',
                })
              : options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;

          const pillAnim = useRef(new Animated.Value(10)).current;
          const pillOpacity = useRef(new Animated.Value(0)).current;

          useEffect(() => {
            if (isFocused) {
              Animated.parallel([
                Animated.timing(pillAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.timing(pillOpacity, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]).start();
            } else {
              pillAnim.setValue(10);
              pillOpacity.setValue(0);
            }
          }, [isFocused]);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const renderIcon = () => {
            const color = isFocused ? COLORS.primaryHighlight : COLORS.textNeutralMedium;
            switch (route.name) {
              case 'Início':
                return <House size={ICON_SIZE} color={color} weight={isFocused ? 'fill' : 'regular'} />;
              case 'Coleção':
                return <Books size={ICON_SIZE} color={color} weight={isFocused ? 'fill' : 'regular'} />;
              case 'Agenda':
                return <CalendarBlank size={ICON_SIZE} color={color} weight={isFocused ? 'fill' : 'regular'} />;
              case 'Lua':
                return <Moon size={ICON_SIZE} color={color} weight={isFocused ? 'fill' : 'regular'} />;
              case 'Perfil':
                return <User size={ICON_SIZE} color={color} weight={isFocused ? 'fill' : 'regular'} />;
              default:
                return null;
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabButton,
                isFocused && { bottom: 5 }
              ]}
            >
              {renderIcon()}
              <Text style={[
                styles.labelText,
                { color: isFocused ? COLORS.primaryHighlight : COLORS.textNeutralMedium },
                isFocused && styles.labelTextFocused
              ]}>
                {typeof label === 'string' ? label : route.name}
              </Text>
              {isFocused && (
                <Animated.View
                  style={[
                    styles.activeIndicatorPill,
                    {
                      transform: [{ translateY: pillAnim }],
                      opacity: pillOpacity,
                    },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20, // Floating effect - distance from bottom
    left: 20,   // Floating effect - distance from sides
    right: 20,  // Floating effect - distance from sides
    borderRadius: 30, // Well-rounded corners
    overflow: 'hidden', // Important for BlurView and borderRadius
    elevation: 5, // Shadow for Android (optional, might conflict with glassmorphism)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  blurViewContainer: {
    flexDirection: 'row',
    height: NAVBAR_HEIGHT, // Use constant for height
    alignItems: 'center',
    justifyContent: 'space-around',
    // backgroundColor: 'rgba(17, 21, 40, 0.7)', // Fallback or tint for BlurView (#111528 with opacity)
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  labelText: {
    fontSize: TYPOGRAPHY.labelFontSize,
    fontFamily: TYPOGRAPHY.labelFontFamily,
    marginTop: 4,
  },
  labelTextFocused: {
    fontFamily: TYPOGRAPHY.labelFontFamilyMedium, // Or Inter-Medium
  },
  activeIndicatorPill: {
    position: 'absolute',
    bottom: 0,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primaryHighlight,
  },
});

export default CustomBottomNavbar;