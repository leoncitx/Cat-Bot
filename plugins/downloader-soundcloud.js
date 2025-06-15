//Mediahub Codes Update Oficial ✔️ 
import fetch from 'node-fetch';
import { URL } from 'url';

const TIMEOUT = 15000;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const RETRY_ATTEMPTS = 2;

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const checkFileSize = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD', timeout: TIMEOUT });
    const size = parseInt(response.headers.get('content-length'), 10);
    return size <= MAX_FILE_SIZE;
  } catch {
    return false;
  }
};

const sendMessageWithRetry = async (conn, chat, message, options, attempts = RETRY_ATTEMPTS) => {
  for (let i = 0; i < attempts; i++) {
    try {
      await conn.sendMessage(chat, message, options);
      return true;
    } catch (error) {
      if (i === attempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) {
    await m.react('📀');
    return m.reply(`╭─⬣「 *Barboza Ai* 」⬣
│  ❗ *Uso Incorrecto*
│  ➤ Ingresa un texto para buscar en YouTube.
│  ➤ *Ejemplo:* ${usedPrefix + command} Shakira
╰────────────⬣`);
  }

  try {
    await m.react('📀');

    const searchApi = `https://delirius-apiofc.vercel.app/search/ytsearch?q=${encodeURIComponent(text)}`;
    const searchResponse = await fetch(searchApi, { timeout: TIMEOUT });
    if (!searchResponse.ok) throw new Error('Error en la búsqueda');
    const searchData = await searchResponse.json();

    if (!searchData?.data || searchData.data.length === 0) {
      await m.react('🔴');
      return m.reply(`╭─⬣「 *Barboza Ai* 」⬣
│  ⚠️ *Sin Resultados*
│  ➤ No se encontraron resultados para:
│  ➤ *"${text}"*
╰────────────⬣`);
    }

    const video = searchData.data[0];

    if (!isValidUrl(video.image)) throw new Error('URL de imagen no válida');

    let info = `╭─⬣「 *Barboza Ai* 」⬣
│  ≡◦🎵 *Título:* ${video.title}
│  ≡◦📺 *Canal:* ${video.author.name}
│  ≡◦⏱️ *Duración:* ${video.duration}
│  ≡◦👁️ *Vistas:* ${video.views}
│  ≡◦📅 *Publicado:* ${video.publishedAt}
│  ≡◦🔗 *Enlace:* ${video.url}
╰────────────⬣`;

    await sendMessageWithRetry(
      conn,
      m.chat,
      { image: { url: video.image }, caption: info },
      { quoted: m }
    );

    const downloadApi = `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(video.url)}`;
    const downloadResponse = await fetch(downloadApi, { timeout: TIMEOUT });
    if (!downloadResponse.ok) throw new Error('Error en la descarga');
    const downloadData = await downloadResponse.json();

    if (!downloadData?.result?.download?.url) {
      await m.react('🔴');
      return m.reply(`╭─⬣「 *Barboza Ai* 」⬣
│  ❌ *Error al descargar*
│  ➤ No se pudo obtener el audio del video.
╰────────────⬣`);
    }

    const audioUrl = downloadData.result.download.url;

    if (!isValidUrl(audioUrl) || !(await checkFileSize(audioUrl))) {
      throw new Error('URL de audio no válida o archivo demasiado grande');
    }

    await sendMessageWithRetry(
      conn,
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`
      },
      { quoted: m }
    );

    await m.react('🟢');
  } catch (error) {
    console.error(error);
    await m.react('🔴');
    let errorMessage = error.message;
    if (error.message.includes('Media upload failed')) {
      errorMessage = 'Error al enviar el archivo multimedia';
    }
    m.reply(`╭─⬣「 *Barboza Ai* 」⬣
│  ❌ *Error Interno*
│  ➤ ${errorMessage}
╰────────────⬣`);
  }
};

handler.command = ['play', 'playaudio'];
handler.help = ['play <texto>', 'playaudio <texto>'];
handler.tags = ['media'];

export default handler;
