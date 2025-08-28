const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Conexão com Supabase (pega variáveis do GitHub Actions via process.env)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Função para traduzir textos curtos (como title) usando Groq
async function translateShortTextGroq(text) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Você é um tradutor especializado em textos científicos curtos e títulos. Traduza fielmente para português mantendo nomes próprios, siglas, nomes de telescópios, planetas e instituições intactos. Entregue uma tradução natural e científica, sem introduções, explicações ou complementos.'
          },
          {
            role: 'user',
            content: `Traduza o seguinte título para português: ${text}`
          }
        ],
        temperature: 0
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error('Erro ao traduzir título:', err);
    return text; // retorna o original se houver erro
  }
}

// Função para traduzir textos longos (como explanation) usando Groq em 2 partes
async function translateLongTextGroq(text) {
  try {
    const midIndex = Math.floor(text.length / 2);
    const part1 = text.slice(0, midIndex);
    const part2 = text.slice(midIndex);

    const translatePart = async (chunk) => {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'Você é um tradutor especializado em textos científicos. Traduza fielmente para português mantendo nomes próprios, siglas, nomes de telescópios, planetas e instituições intactos. Não adicione introduções, explicações ou conclusões extras.'
            },
            {
              role: 'user',
              content: `Traduza o seguinte texto: ${chunk}`
            }
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

async function fetchAndSaveAPOD() {
  try {
    // 1️⃣ Request na NASA
    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`);
    const data = await res.json();

    if (data.error) {
      console.error("Erro na API da NASA:", data.error.message);
      return;
    }

    // 2️⃣ Apaga registros antigos
    await supabase.from('apod').delete().neq('id', 0);

    // 3️⃣ Lista e apaga imagens antigas no bucket
    const { data: files, error: listError } = await supabase.storage.from(process.env.SUPABASE_BUCKET).list();
    if (listError) console.error("Erro ao listar imagens:", listError);

    if (files && files.length > 0) {
      for (let file of files) {
        await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([file.name]);
      }
      console.log("Imagens antigas removidas.");
    }

    let finalUrl = data.url;

    // 4️⃣ Se for imagem → baixa e salva no Storage
    if (data.media_type === "image") {
      const response = await fetch(data.url);
      const buffer = await response.buffer();
      const fileName = `apod-${data.date}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(fileName, buffer, { upsert: true });

      if (uploadError) {
        console.error("Erro ao enviar imagem:", uploadError);
      } else {
        const { data: publicData } = supabase
          .storage
          .from(process.env.SUPABASE_BUCKET)
          .getPublicUrl(fileName);
        
        finalUrl = publicData.publicUrl;
      }
    } else {
      console.log("Hoje é vídeo, não imagem. Mantendo URL original.");
    }

    // 5️⃣ Traduz o title e explanation
    const translatedTitle = await translateShortTextGroq(data.title);
    const translatedExplanation = await translateLongTextGroq(data.explanation);

    // 6️⃣ Salva no banco
    const { error } = await supabase.from('apod').insert([{
      date: data.date,
      title: translatedTitle,
      explanation: translatedExplanation,
      url: finalUrl,
      media_type: data.media_type,
      copyright: data.copyright || null
    }]);

    if (error) {
      console.error("Erro ao salvar no banco:", error);
    } else {
      console.log(`APOD de ${data.date} salvo com sucesso!`);
    }

  } catch (err) {
    console.error("Erro geral:", err);
  }
}

// Executa
fetchAndSaveAPOD();
