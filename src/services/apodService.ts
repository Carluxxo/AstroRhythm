import AsyncStorage from "@react-native-async-storage/async-storage";
import translate from "translate";


const NASA_API_KEY = "DEMO_KEY"; // Replace with a real key if you have one, DEMO_KEY has limitations
const APOD_API_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;

const CACHE_KEY_APOD = "apodData";
const CACHE_KEY_APOD_LAST_FETCH = "apodLastFetchTimestamp";
const CACHE_KEY_APOD_FETCH_COUNT = "apodFetchCount";
const CACHE_KEY_APOD_LAST_FETCH_DATE = "apodLastFetchDate"; // To reset count daily

const SIX_HOURS_IN_MS = 6 * 60 * 60 * 1000;
const MAX_DAILY_FETCHES = 4;

export interface ApodData {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: "image" | "video";
  service_version: string;
  title: string;
  url: string;
  translated_title?: string;
  copyright?: string; // Adicione esta linha
  translated_explanation?: string;
}

interface CachedApod {
  data: ApodData;
  timestamp: number;
}

// Configure translation engine (optional, defaults to Google)
// translate.engine = "libre"; // if google gives issues or for self-hosting needs
// translate.key = "YOUR_LIBRETRANSLATE_KEY"; // if using a self-hosted or private instance

const getTodaysDateString = () => {
  return new Date().toISOString().split("T")[0];
};

export const getApod = async (forceRefresh: boolean = false): Promise<ApodData | null> => {
  try {
    const now = Date.now();
    const todayStr = getTodaysDateString();

    // Get cache metadata
    const lastFetchTimestampStr = await AsyncStorage.getItem(CACHE_KEY_APOD_LAST_FETCH);
    const lastFetchTimestamp = lastFetchTimestampStr ? parseInt(lastFetchTimestampStr, 10) : 0;
    
    const fetchCountStr = await AsyncStorage.getItem(CACHE_KEY_APOD_FETCH_COUNT);
    let fetchCount = fetchCountStr ? parseInt(fetchCountStr, 10) : 0;

    const lastFetchDateStr = await AsyncStorage.getItem(CACHE_KEY_APOD_LAST_FETCH_DATE);

    // Reset daily fetch count if it's a new day
    if (lastFetchDateStr !== todayStr) {
      fetchCount = 0;
      await AsyncStorage.setItem(CACHE_KEY_APOD_LAST_FETCH_DATE, todayStr);
      await AsyncStorage.setItem(CACHE_KEY_APOD_FETCH_COUNT, "0");
    }

    // Check cache first unless forceRefresh is true
    if (!forceRefresh) {
      const cachedDataStr = await AsyncStorage.getItem(CACHE_KEY_APOD);
      if (cachedDataStr) {
        const cachedApod: CachedApod = JSON.parse(cachedDataStr);
        // Check if cache is still valid (less than 6 hours old)
        if (now - cachedApod.timestamp < SIX_HOURS_IN_MS) {
          console.log("APOD: Returning cached data (within 6hr window)");
          return cachedApod.data;
        }
      }
    }

    // Check if fetch limit exceeded
    if (fetchCount >= MAX_DAILY_FETCHES && !forceRefresh) {
      console.warn("APOD: Daily fetch limit reached. Returning potentially stale cache or null.");
      // Optionally return stale cache if available and acceptable
      const cachedDataStr = await AsyncStorage.getItem(CACHE_KEY_APOD);
      if (cachedDataStr) {
          const cachedApod: CachedApod = JSON.parse(cachedDataStr);
          return cachedApod.data; // Return stale data if limit is hit
      }
      return null; // Or throw an error
    }

    // Fetch new data
    console.log("APOD: Fetching new data from NASA");
    const response = await fetch(APOD_API_URL);
    if (!response.ok) {
      throw new Error(`NASA APOD API request failed: ${response.status}`);
    }
    const apodResult: ApodData = await response.json();

    if (apodResult.media_type !== "image") {
      console.warn("APOD: Received non-image media type, skipping translation for now.");
      // Store and return non-image data as is, or handle differently
      const newCache: CachedApod = { data: apodResult, timestamp: now };
      await AsyncStorage.setItem(CACHE_KEY_APOD, JSON.stringify(newCache));
      await AsyncStorage.setItem(CACHE_KEY_APOD_LAST_FETCH, now.toString());
      await AsyncStorage.setItem(CACHE_KEY_APOD_FETCH_COUNT, (fetchCount + 1).toString());
      return apodResult;
    }

    // Translate title and explanation
    try {
      apodResult.translated_title = await translate(apodResult.title, { from: "en", to: "pt" });
      apodResult.translated_explanation = await translate(apodResult.explanation, { from: "en", to: "pt" });
    } catch (translationError) {
      console.error("APOD: Translation failed", translationError);
      // Proceed with untranslated data if translation fails
      apodResult.translated_title = apodResult.title + " (Tradução falhou)";
      apodResult.translated_explanation = apodResult.explanation + " (Tradução falhou)";
    }

    // Update cache
    const newCache: CachedApod = { data: apodResult, timestamp: now };
    await AsyncStorage.setItem(CACHE_KEY_APOD, JSON.stringify(newCache));
    await AsyncStorage.setItem(CACHE_KEY_APOD_LAST_FETCH, now.toString());
    await AsyncStorage.setItem(CACHE_KEY_APOD_FETCH_COUNT, (fetchCount + 1).toString());
    if (lastFetchDateStr !== todayStr) { // Ensure date is also updated if it was reset
        await AsyncStorage.setItem(CACHE_KEY_APOD_LAST_FETCH_DATE, todayStr);
    }

    console.log("APOD: New data fetched, translated, and cached.");
    return apodResult;

  } catch (error) {
    console.error("Error in getApod service:", error);
    // Attempt to return cached data on error if available
    const cachedDataStr = await AsyncStorage.getItem(CACHE_KEY_APOD);
    if (cachedDataStr) {
        console.warn("APOD: Error fetching, returning stale cache.");
        const cachedApod: CachedApod = JSON.parse(cachedDataStr);
        return cachedApod.data;
    }
    return null;
  }
};

