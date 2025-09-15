const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); // Para baixar vídeo externo
const cheerio = require('cheerio'); // Para scrap HTML

// ⚠️ Use SERVICE ROLE KEY para ignorar RLS
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Função para traduzir textos curtos (title)
async function translateShortTextGroq(text) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Você é um tradutor especializado em textos científicos curtos e títulos. Traduza fielmente para português mantendo nomes próprios, siglas, nomes de telescópios, planetas e instituições intactos. Entregue uma tradução natural e científica, sem introduções ou complementos.' },
          { role: 'user', content: `Traduza o seguinte título para português: ${text}` }
        ],
        temperature: 0
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error('Erro ao traduzir título:', err);
    return text;
  }
}

// Função para traduzir textos longos (explanation)
async function translateLongTextGroq(text) {
  try {
    const midIndex = Math.floor(text.length / 2);
    const part1 = text.slice(0, midIndex);
    const part2 = text.slice(midIndex);

    const translatePart = async (chunk) => {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'Você é um tradutor especializado em textos científicos. Traduza fielmente para português mantendo nomes próprios, siglas, nomes de telescópios, planetas e instituições intactos. Não adicione introduções ou conclusões extras.' },
            { role: 'user', content: `Traduza o seguinte texto: ${chunk}` }
          ],
          temperature: 0
        })
      });
      const data = await response.json();
      return data.choices[0].message.content;
    };

    const translatedPart1 = await translatePart(part1);
    const translatedPart2 = await translatePart(part2);
    return translatedPart1 + translatedPart2;
  } catch (err) {
    console.error('Erro ao traduzir explanation:', err);
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

    // Tradução
    const translatedTitle = await translateShortTextGroq(data.title);
    const translatedExplanation = await translateLongTextGroq(data.explanation);

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
