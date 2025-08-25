import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Audio, AVPlaybackStatus } from 'expo-av';
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Track {
  id: string;
  title: string;
  artist?: string;
  audio_url: string;
  image_url?: string;
  duration?: number;
}

export interface PlayerContextData {
  currentTrack: Track | null;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  sound: Audio.Sound | null;
  playTrack: (track: Track) => Promise<void>;
  pauseTrack: () => Promise<void>;
  resumeTrack: () => Promise<void>;
  stopTrack: () => Promise<void>;
  seekTrack: (position: number) => Promise<void>;
  isFavorite: (trackId: string) => boolean;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (track: Track) => Promise<void>;
  setCurrentTrack: (track: Track | null) => void;
}

const PlayerContext = createContext<PlayerContextData | undefined>(undefined);
const FAVORITES_KEY = "astro_rhythm_favorites";

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [favorites, setFavorites] = useState<Track[]>([]);

  // Load favorites once
  useEffect(() => {
    (async () => {
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      if (data) setFavorites(JSON.parse(data));
    })();
  }, []);

  const saveFavorites = useCallback(async (list: Track[]) => {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
    setFavorites(list);
  }, []);

  const toggleFavorite = useCallback(async (track: Track) => {
    const updated = favorites.some(f => f.id === track.id)
      ? favorites.filter(f => f.id !== track.id)
      : [...favorites, track];
    await saveFavorites(updated);
  }, [favorites, saveFavorites]);

  const isFavorite = useCallback((id: string) => favorites.some(f => f.id === id), [favorites]);

  // Configure audio mode once
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  // Handle status updates throttled
  const onStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setPositionMillis(status.positionMillis || 0);
    setDurationMillis(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish && !status.isLooping) {
      stopTrack();
    }
  }, []);

  const playTrack = useCallback(async (track: Track) => {
    // reuse if same track paused
    if (currentTrack?.id === track.id && soundRef.current && !isPlaying) {
      await soundRef.current.playAsync();
      return;
    }
    // unload previous
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsPlaying(false);
      setPositionMillis(0);
      setDurationMillis(0);
    }
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: track.audio_url },
      { shouldPlay: true },
      onStatusUpdate
    );
    soundRef.current = newSound;
    setCurrentTrack(track);
  }, [currentTrack, isPlaying, onStatusUpdate]);

  const pauseTrack = useCallback(async () => {
    if (soundRef.current && isPlaying) await soundRef.current.pauseAsync();
  }, [isPlaying]);

  const resumeTrack = useCallback(async () => {
    if (soundRef.current && !isPlaying) await soundRef.current.playAsync();
  }, [isPlaying]);

  const stopTrack = useCallback(async () => {
    if (!soundRef.current) return;
    await soundRef.current.stopAsync();
    await soundRef.current.unloadAsync();
    soundRef.current = null;
    setCurrentTrack(null);
    setIsPlaying(false);
    setPositionMillis(0);
    setDurationMillis(0);
  }, []);

  const seekTrack = useCallback(async (millis: number) => {
    if (soundRef.current) await soundRef.current.setPositionAsync(millis);
  }, []);

  const loadFavorites = useCallback(async () => {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    if (data) {
      setFavorites(JSON.parse(data));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      positionMillis,
      durationMillis,
      sound: soundRef.current,
      playTrack,
      pauseTrack,
      resumeTrack,
      stopTrack,
      seekTrack,
      isFavorite,
      toggleFavorite,
      loadFavorites,
      setCurrentTrack
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};