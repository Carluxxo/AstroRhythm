// src/navigation/types.ts

export interface PlayerScreenParams {
  id: string;
  title: string;
  audio_url: string;
  image_url?: string;
  artist?: string;
  // duration is not passed as param, it's derived from the sound object in PlayerContext
}

export type RootStackParamList = {
  Onboarding: undefined;
  CreateAccount: undefined; // Tela de criação de conta
  MainTabs: undefined;      // Navegador para Dashboard, Library, Calendar, Profile
  Dashboard: undefined;
  Library: undefined;
  Player: PlayerScreenParams;
  LoginAccount: undefined;
  Calendar: undefined;
  Profile: undefined;
  Lua: undefined;
  WaitConfirm: undefined
};
