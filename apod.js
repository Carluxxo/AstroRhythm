require('dotenv').config();

const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); // Para baixar vídeo externo
const cheerio = require('cheerio'); // Para scrap HTML

// ⚠️ Use SERVICE ROLE KEY para ignorar RLS
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Função auxiliar genérica para request no Groq
async function groqRequestSystem(system, user) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [system, user],
        temperature: 0
      })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim();
  } catch (err) {
    console.error("Erro no groqRequestSystem:", err);
    return null;
  }
}

// Função para traduzir textos curtos (title)
async function translateShortTextGroq(text) {
  try {
    const system = {
      role: 'system',
      content:
        'Você é um tradutor especializado em textos científicos curtos e títulos. Traduza fielmente para português mantendo nomes próprios, siglas, nomes de telescópios, planetas e instituições intactos. Entregue uma tradução natural e científica, sem introduções ou complementos.'
    };
    const user = { role: 'user', content: `Traduza o seguinte título para português: ${text}` };
    return (await groqRequestSystem(system, user)) || text;
  } catch (err) {
    console.error('Erro ao traduzir título:', err);
    return text;
  }
}

// Função para traduzir textos longos (explanation)
async function translateLongTextGroq(text) {
  try {
    const mid = Math.floor(text.length / 2);
    const p1 = text.slice(0, mid);
    const p2 = text.slice(mid);

    const system = {
      role: 'system',
      content:
        'Você é um tradutor especializado em textos científicos. Traduza fielmente para português mantendo nomes próprios, siglas, nomes de telescópios, planetas e instituições intactos. Retorne APENAS o texto traduzido, sem saudações, explicações ou complementos.'
    };

    const user1 = { role: 'user', content: `Traduza o seguinte texto: ${p1}` };
    const user2 = { role: 'user', content: `Traduza o seguinte texto: ${p2}` };

    const t1 = (await groqRequestSystem(system, user1)) || p1;
    const t2 = (await groqRequestSystem(system, user2)) || p2;

    return (t1 + t2).trim();
  } catch (e) {
    console.error('Erro ao traduzir texto longo:', e);
    return text;
  }
}

// Função para revisar textos
async function reviewText(text) {
  try {
    const system = {
      role: 'system',
      content:
        'Você é um professor de português especializado em revisar textos científicos e técnicos. Corrija apenas erros de digitação, pontuação, gramática, capitalização e identação. Não altere termos técnicos, nomes próprios, siglas ou nomes de instituições. Retorne APENAS o texto revisado, sem saudações, explicações ou complementos.'
    };
    const user = { role: 'user', content: `Revise o seguinte texto: ${text}` };
    return (await groqRequestSystem(system, user)) || text;
  } catch (e) {
    console.error('Erro ao revisar texto:', e);
    return text;
  }
}

// Função para baixar vídeo externo via curl
async function downloadVideo(url, outputPath) {
  return new Promise((resolve, reject) => {
    console.log("Iniciando download de vídeo...");
    const curl = exec(`curl -L "${url}" -o "${outputPath}" --progress-bar`);

    curl.stdout?.on('data', (data) => process.stdout.write(data));
    curl.stderr?.on('data', (data) => process.stdout.write(data));

    curl.on('close', (code) => {
      if (code === 0) {
        console.log("\nDownload concluído com sucesso!");
        resolve();
      } else reject(new Error(`curl finalizou com código ${code}`));
    });
  });
}

// Função para scrap do HTML da APOD e extrair vídeo
async function scrapVideoFromHTML(date) {
  try {
    const url = `https://apod.nasa.gov/apod/astropix.html`;
    console.log("Pegando HTML da APOD...");
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Procura <video> e <source>
    const videoSrc = $('video source').attr('src');
    if (!videoSrc) return null;

    const videoUrl = new URL(videoSrc, 'https://apod.nasa.gov/apod/').href;
    console.log("Vídeo encontrado:", videoUrl);
    return videoUrl;
  } catch (err) {
    console.error("Erro ao scrapear HTML da APOD:", err);
    return null;
  }
}

// Função principal
async function fetchAndSaveAPOD() {
  try {
    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`);
    const data = await res.json();

    if (data.error) { console.error("Erro na API da NASA:", data.error.message); return; }

    // Apaga registros antigos
    const { error: deleteError } = await supabase.from('apod').delete().neq('id', 0);
    if (deleteError) console.error("Erro ao apagar registros antigos:", deleteError);

    // Apaga arquivos antigos no bucket
    const { data: files, error: listError } = await supabase.storage.from(process.env.SUPABASE_BUCKET).list();
    if (listError) console.error("Erro ao listar arquivos no bucket:", listError);

    if (files?.length > 0) {
      for (let file of files) await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([file.name]);
      console.log("Arquivos antigos removidos do bucket.");
    }

    let finalUrl = data.url;

    // Dependendo do tipo de mídia
    if (data.media_type === "image") {
      const response = await fetch(data.url);
      const buffer = await response.buffer();
      const fileName = `apod-${data.date}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(fileName, buffer, { upsert: true });
      if (uploadError) console.error("Erro ao enviar imagem:", uploadError);
      else finalUrl = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(fileName).data.publicUrl;

    } else if (data.media_type === "video") {
      if (data.url.includes("youtube.com") || data.url.includes("youtu.be")) {
        console.log("Vídeo do YouTube detectado, mantendo URL original.");
      } else {
        // Vídeo externo → baixa e envia
        const ext = path.extname(data.url).split('?')[0] || '.mp4';
        const fileName = `apod-${data.date}${ext}`;
        const tempPath = path.join(__dirname, fileName);

        console.log("Baixando vídeo externo...", data.url);
        await downloadVideo(data.url, tempPath);

        const videoBuffer = fs.readFileSync(tempPath);
        const { error: uploadError } = await supabase.storage
          .from(process.env.SUPABASE_BUCKET)
          .upload(fileName, videoBuffer, { upsert: true });
        if (uploadError) console.error("Erro ao enviar vídeo:", uploadError);
        else finalUrl = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(fileName).data.publicUrl;

        fs.unlinkSync(tempPath);
      }
    } else if (data.media_type === "other") {
      // Faz scrap para pegar vídeo
      const scrapUrl = await scrapVideoFromHTML(data.date);
      if (scrapUrl) {
        const ext = path.extname(scrapUrl).split('?')[0] || '.mp4';
        const fileName = `apod-${data.date}${ext}`;
        const tempPath = path.join(__dirname, fileName);

        console.log("Baixando vídeo do scrap...", scrapUrl);
        await downloadVideo(scrapUrl, tempPath);

        const videoBuffer = fs.readFileSync(tempPath);
        const { error: uploadError } = await supabase.storage
          .from(process.env.SUPABASE_BUCKET)
          .upload(fileName, videoBuffer, { upsert: true });
        if (uploadError) console.error("Erro ao enviar vídeo:", uploadError);
        else finalUrl = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(fileName).data.publicUrl;

        fs.unlinkSync(tempPath);
      }
    }

    // Tradução e revisão
    const translatedTitle = await translateShortTextGroq(data.title);
    let translatedExplanation = await translateLongTextGroq(data.explanation);
    translatedExplanation = await reviewText(translatedExplanation); // revisão gramatical

    // Salva no banco
    const { error } = await supabase.from('apod').insert([{
      date: data.date,
      title: translatedTitle,
      explanation: translatedExplanation,
      url: finalUrl,
      media_type: data.media_type,
      copyright: data.copyright || null
    }]);

    if (error) console.error("Erro ao salvar no banco:", error);
    else console.log(`APOD de ${data.date} salvo com sucesso!`);

  } catch (err) {
    console.error("Erro geral:", err);
  }
}

// Executa
fetchAndSaveAPOD();
