// src/services/apodService.ts
import { createClient } from '@supabase/supabase-js';
import { REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as dateFnsTz from 'date-fns-tz';
import { parseISO, addDays, format, addSeconds } from 'date-fns';
import { Image as ExpoImage } from 'expo-image';

// Conexão com Supabase
const supabaseUrl = REACT_APP_SUPABASE_URL;
const supabaseAnonKey = REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY devem ser definidas.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ApodData {
  copyright?: string;
  date: string; // espera 'YYYY-MM-DD' ou ISO
  explanation: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  service_version: string;
  title: string;
  url: string;
  translated_title?: string;
  translated_explanation?: string;
}

const APOD_CACHE_KEY = 'apod_data_cache';
const APOD_CACHE_DATE_KEY = 'apod_cache_date';
const TIMEZONE_SAO_PAULO = 'America/Sao_Paulo';

function thresholdUtcForSaopauloDate(nextDay: Date): Date {
  const nextDayStr = format(nextDay, 'yyyy-MM-dd');

  const maybeFn: any =
    (dateFnsTz as any).zonedTimeToUtc ??
    (dateFnsTz as any).default?.zonedTimeToUtc ??
    (dateFnsTz as any)['zonedTimeToUtc'];

  if (typeof maybeFn === 'function') {
    try {
      // Calcula 02:00 em São Paulo e soma +1 segundo
      const d = maybeFn(`${nextDayStr} 02:00:00`, TIMEZONE_SAO_PAULO);
      return addSeconds(d, 1);
    } catch (err) {
      console.warn('date-fns-tz.zonedTimeToUtc existia mas falhou ao executar, caindo no fallback:', err);
    }
  } else {
    console.debug('date-fns-tz.zonedTimeToUtc não disponível em runtime; usando fallback -03:00.');
  }

  const y = nextDay.getUTCFullYear();
  const m = nextDay.getUTCMonth();
  const d = nextDay.getUTCDate();
  // 05:00 UTC == 02:00 BRT; soma +1 segundo
  return new Date(Date.UTC(y, m, d, 5, 0, 1));
}

function shouldUpdateCache(cachedDate: string | null): boolean {
  if (!cachedDate) {
    console.log('Cache: Não encontrado. Necessário buscar novos dados.');
    return true;
  }

  try {
    const parsed = parseISO(cachedDate);
    const nextDay = addDays(parsed, 1);

    const thresholdUtc = thresholdUtcForSaopauloDate(nextDay);
    const now = new Date();

    if (now.getTime() >= thresholdUtc.getTime()) {
      console.log(
        `Cache: Data ${cachedDate} expirou (>= ${format(nextDay, 'yyyy-MM-dd')} 02:00:01 ${TIMEZONE_SAO_PAULO}). Será atualizado.`
      );
      return true;
    }

    console.log(
      `Cache: Data ${cachedDate} ainda é válido (válido até ${format(nextDay, 'yyyy-MM-dd')} 02:00:01 ${TIMEZONE_SAO_PAULO}).`
    );
    return false;
  } catch (err) {
    console.warn('Erro ao verificar validade do cache, forçando atualização.', err);
    return true;
  }
}

export async function clearApodCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(APOD_CACHE_KEY);
    await AsyncStorage.removeItem(APOD_CACHE_DATE_KEY);
    console.log('Cache do APOD limpo manualmente.');
  } catch (err) {
    console.warn('Falha ao limpar cache do APOD:', err);
  }
}

export async function forceUpdateApodData(): Promise<ApodData> {
  try {
    console.log('Forçando atualização dos dados do APOD (ignorando cache)...');

    const { data, error } = await supabase
      .from('apod')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao forçar fetch do Supabase:', error);
      throw error;
    }
    if (!data) {
      throw new Error('Nenhum dado encontrado no Supabase ao forçar atualização.');
    }

    // normalizar date para 'YYYY-MM-DD'
    let apodDate = String(data.date || '');
    try {
      apodDate = format(parseISO(apodDate), 'yyyy-MM-dd');
    } catch {
      // fallback: manter o que veio
    }

    if (data.media_type === 'image') {
      try {
        // @ts-ignore - tipagem do expo-image pode variar
        await ExpoImage.prefetch(data.url);
      } catch (prefetchErr) {
        console.warn('Falha ao pré-carregar a imagem do APOD (não fatal):', prefetchErr);
      }
    }

    await AsyncStorage.setItem(APOD_CACHE_KEY, JSON.stringify(data));
    await AsyncStorage.setItem(APOD_CACHE_DATE_KEY, apodDate);
    console.log('Dados e imagem salvos no cache do AsyncStorage (forçado).');

    return data as ApodData;
  } catch (err) {
    console.error('Erro ao forçar atualização do APOD:', err);
    throw err;
  }
}

export async function getAPODData(): Promise<ApodData> {
  try {
    const cachedDate = await AsyncStorage.getItem(APOD_CACHE_DATE_KEY);
    const cachedRawData = await AsyncStorage.getItem(APOD_CACHE_KEY);

    if (cachedRawData && !shouldUpdateCache(cachedDate)) {
      console.log('Usando dados do cache do AsyncStorage.');
      const data: ApodData = JSON.parse(cachedRawData);
      return data;
    }

    console.log('Buscando novos dados do Supabase...');

    const { data, error } = await supabase
      .from('apod')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao buscar dados do Supabase:', error);
      if (cachedRawData) {
        console.log('Usando cache antigo como fallback devido ao erro no Supabase.');
        return JSON.parse(cachedRawData) as ApodData;
      }
      throw new Error('Não foi possível buscar os dados do Supabase e não há cache disponível.');
    }

    if (!data) {
      throw new Error('Nenhum dado encontrado no Supabase.');
    }

    let apodDate = String(data.date || '');
    try {
      apodDate = format(parseISO(apodDate), 'yyyy-MM-dd');
    } catch {}

    if (data.media_type === 'image') {
      try {
        // @ts-ignore
        console.log('Pré-carregando a nova imagem do APOD...');
        await ExpoImage.prefetch(data.url);
      } catch (prefetchErr) {
        console.warn('Falha ao pré-carregar a imagem do APOD (não fatal):', prefetchErr);
      }
    }

    await AsyncStorage.setItem(APOD_CACHE_KEY, JSON.stringify(data));
    await AsyncStorage.setItem(APOD_CACHE_DATE_KEY, apodDate);
    console.log('Dados e imagem salvos no cache do AsyncStorage.');

    return data as ApodData;
  } catch (err) {
    console.error('Erro geral no serviço de APOD:', err);
    throw err;
  }
}
