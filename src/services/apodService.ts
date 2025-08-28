import { createClient } from '@supabase/supabase-js';
import { REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toZonedTime } from 'date-fns-tz';
import { addDays, setHours, getYear, getMonth, getDate } from 'date-fns';
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
    date: string;
    explanation: string;
    hdurl?: string;
    media_type: "image" | "video";
    service_version: string;
    title: string;
    url: string;
    translated_title?: string;
    translated_explanation?: string;
}

const APOD_CACHE_KEY = 'apod_data_cache';
const APOD_CACHE_DATE_KEY = 'apod_cache_date';
const TIMEZONE_SAO_PAULO = 'America/Sao_Paulo';

/**
 * Verifica se o cache precisa ser atualizado com base na data do cache e na hora de São Paulo.
 * @param {string | null} cachedDate - A data do cache no formato 'YYYY-MM-DD'.
 * @returns {boolean} - Retorna true se o cache precisar ser atualizado.
 */
function shouldUpdateCache(cachedDate: string | null): boolean {
  if (!cachedDate) {
    console.log("Cache: Não encontrado. Necessário buscar novos dados.");
    return true;
  }

  // 1. Obtém a data e hora atuais no fuso horário de São Paulo
  const nowSaoPaulo = toZonedTime(new Date(), TIMEZONE_SAO_PAULO);

  // 2. Converte a data do cache para um objeto Date no fuso de São Paulo
  const [year, month, day] = cachedDate.split('-').map(Number);
  const cacheDateSaoPaulo = toZonedTime(new Date(year, month - 1, day), TIMEZONE_SAO_PAULO);
  
  // 3. Calcula a data/hora limite para a atualização (6h da manhã do dia seguinte)
  const nextDay = addDays(cacheDateSaoPaulo, 1);
  const updateThreshold = setHours(nextDay, 6);

  // 4. Compara a hora atual em São Paulo com a hora limite
  if (nowSaoPaulo.getTime() >= updateThreshold.getTime()) {
    console.log(`Cache: Data ${cachedDate} expirou. Será atualizado.`);
    return true;
  }

  console.log(`Cache: Data ${cachedDate} ainda é válido.`);
  return false;
}

/**
 * Busca os dados do APOD do Supabase, gerencia o cache e retorna os dados.
 * @returns {Promise<ApodData>} - Os dados do APOD mais recentes.
 */
export async function getAPODData(): Promise<ApodData> {
  try {
    const cachedDate = await AsyncStorage.getItem(APOD_CACHE_DATE_KEY);
    const cachedRawData = await AsyncStorage.getItem(APOD_CACHE_KEY);

    if (cachedRawData && !shouldUpdateCache(cachedDate)) {
      console.log("Usando dados do cache do AsyncStorage.");
      const data: ApodData = JSON.parse(cachedRawData);
      return data;
    }

    console.log("Buscando novos dados do Supabase...");

    if (cachedRawData) {
      console.log("Limpando cache antigo do AsyncStorage...");
      await AsyncStorage.removeItem(APOD_CACHE_KEY);
      await AsyncStorage.removeItem(APOD_CACHE_DATE_KEY);
    }
    
    const { data, error } = await supabase
      .from('apod')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Erro ao buscar dados do Supabase:", error);
      throw new Error("Não foi possível buscar os dados do Supabase.");
    }

    if (!data) {
      throw new Error("Nenhum dado encontrado no Supabase.");
    }

    // Pré-carrega a imagem usando expo-image antes de salvar os dados
    if (data.media_type === 'image') {
      console.log("Pré-carregando a nova imagem do APOD...");
      await ExpoImage.prefetch(data.url);
    }

    await AsyncStorage.setItem(APOD_CACHE_KEY, JSON.stringify(data));
    await AsyncStorage.setItem(APOD_CACHE_DATE_KEY, data.date);
    console.log("Dados e imagem salvos no cache do AsyncStorage.");

    return data as ApodData;

  } catch (err) {
    console.error("Erro geral no serviço de APOD:", err);
    throw err;
  }
}