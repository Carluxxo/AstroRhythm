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
  MainTabs: undefined; // This is the navigator for Dashboard, Library, Calendar, Profile
  Dashboard: undefined;
  Library: undefined;
  Player: PlayerScreenParams;
  Calendar: undefined;
  Profile: undefined; // Added Profile to RootStack as it's part of MainTabs
  Lua: undefined;
};
