    // contexts/NavbarContext.tsx
import React, { createContext, useContext, useState, useRef } from 'react';
import { Animated } from 'react-native';

interface NavbarContextType {
  navbarVisible: boolean;
  navbarAnim: Animated.Value;
  hideNavbar: () => void;
  showNavbar: () => void;
}

const NavbarContext = createContext<NavbarContextType>({
  navbarVisible: true,
  navbarAnim: new Animated.Value(0),
  hideNavbar: () => {},
  showNavbar: () => {},
});

export const useNavbar = () => useContext(NavbarContext);

export const NavbarProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [navbarVisible, setNavbarVisible] = useState(true);
  const navbarAnim = useRef(new Animated.Value(0)).current;

  const hideNavbar = () => {
    Animated.timing(navbarAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setNavbarVisible(false);
    });
  };

  const showNavbar = () => {
    setNavbarVisible(true);
    Animated.timing(navbarAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <NavbarContext.Provider value={{
      navbarVisible,
      navbarAnim,
      hideNavbar,
      showNavbar,
    }}>
      {children}
    </NavbarContext.Provider>
  );
};