//Mediahub Codes Update Oficial ✔️ 

    import yts from 'yt-search';
import fs from 'fs';
import axios from 'axios';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 12000;

// Zonas horarias de países hispanohablantes
const timeZones = {
  Argentina: 'America/Argentina/Buenos_Aires',
  Bolivia: 'America/La_Paz',
  Chile: 'America/Santiago',
  Colombia: 'America/Bogota',
  CostaRica: 'America/Costa_Rica',
  Cuba: 'America/Havana',
  Ecuador: 'America/Guayaquil',
  ElSalvador: 'America/El_Salvador',
  España: 'Europe/Madrid',
  Guatemala: 'America/Guatemala',
  Honduras: 'America/Tegucigalpa',
  México: 'America/Mexico_City',
  Nicaragua: 'America/Managua',
  Panamá: 'America/Panama',
  Paraguay: 'America/Asuncion',
  Perú: 'America/Lima',
  PuertoRico: 'America/Puerto_Rico',
  RepúblicaDominicana: 'America/Santo_Domingo',
  Uruguay: 'America/Montevideo',
  Venezuela: 'America/Caracas'
};

const getGreeting = (hour) => {
  return hour < 12 ? 'Buenos días 🌅' : hour < 18 ? 'Buenas tardes 🌄' : 'Buenas noches 🌃';
};

const getLocalGreeting = (limaTime) => {
  const greetings = [];
  for (const [country, timeZone] of Object.entries(timeZones)) {
    try {
      const localTime = new Date(limaTime.toLocaleString('en-US', { timeZone }));
      const localHour = localTime.getHours();
      greetings.push(`${country}: ${getGreeting(localHour)}`);
    } catch {
      greetings.push(`${country}: ${getGreeting(limaTime.getHours())}`);
    }
  }
  return greetings.join('\n');
};

const isUserBlocked = (userId) => {
  try {
    const blockedUsers = JSON.parse(fs.readFileSync('./bloqueados.json', 'utf8'));
    return blockedUsers.includes(userId);
  } catch {
    return false;
  }
};

const getDownloadUrl = async (videoUrl) => {
  const apis = [{ url: 'https://api.vreden.my.id/api/ytmp3?url=', type: 'vreden' }];

  for (const api of apis) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await axios.get(`${api.url}${encodeURIComponent(videoUrl)}`, { timeout: TIMEOUT_MS });
        if (
          response.data?.status === 200 &&
          response.data?.result?.download?.url &&
          response.data?.result?.download?.status === true
        ) {
          return {
            url: response.data.result.download.url.trim(),
            title: response.data.result.metadata.title
          };
        }
      } catch {
        if (attempt < MAX_RETRIES - 1) await wait(RETRY_DELAY_MS);
      }
    }
  }
  return null;
};

const sendAudioNormal = async (conn, chat, audioUrl, videoTitle) => {
  let thumbnailBuffer = null;
  try {
    const response = await axios.get('https://files.catbox.moe/ltq7ph.jpg', { responseType: 'arraybuffer' });
    thumbnailBuffer = Buffer.from(response.data, 'binary');
  } catch {}

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await conn.sendMessage(
        chat,
        {
          audio: { url: audioUrl },
          mimetype: 'audio/mpeg',
          contextInfo: {
            externalAdReply: {
              title: videoTitle,
              body: 'Barboza Music',
              previewType: 'PHOTO',
              thumbnail: thumbnailBuffer || null,
              mediaType: 1,
              renderLargerThumbnail: false,
              showAdAttribution: true,
            }
          }
        },
        { quoted: null }
      );
      return true;
    } catch {
      if (attempt < MAX_RETRIES - 1) await wait(RETRY_DELAY_MS);
    }
  }
  return false;
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const userId = m.sender;
  if (isUserBlocked(userId)) {
    await conn.reply(m.chat, '🚫 Lo siento, estás en la lista de usuarios bloqueados.', m);
    return;
  }

  if (!text || !text.trim()) {
    let thumbnailBuffer = null;
    try {
      const response = await axios.get('https://files.catbox.moe/ltq7ph.jpg', { responseType: 'arraybuffer' });
      thumbnailBuffer = Buffer.from(response.data, 'binary');
    } catch {}

    await conn.sendMessage(
      m.chat,
      {
        text: `Uso: ${usedPrefix + command} <nombre de la canción>\n> Ejemplo: ${usedPrefix + command} Mi Vida Eres Tu`,
        contextInfo: {
          externalAdReply: {
            title: 'Barboza Music',
            previewType: 'PHOTO',
            thumbnail: thumbnailBuffer || null,
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: true,
            sourceUrl: 'Ella Nunca Te Quizo'
          }
        }
      },
      { quoted: m }
    );
    return;
  }

  const limaTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }));
  const userNumber = m.sender.split('@')[0];
  const reactionMessage = await conn.reply(
    m.chat,
    `${getLocalGreeting(limaTime)} @${userNumber},\nEstoy buscando la música solicitada...`,
    m,
    { mentions: [m.sender] }
  );

  await conn.sendMessage(m.chat, { react: { text: '📀', key: reactionMessage.key } }, { quoted: m });

  try {
    const searchResults = await yts(text.trim());
    if (!searchResults?.videos?.length) throw new Error('No se encontraron resultados en YouTube.');

    const videoInfo = searchResults.videos[0];
    const { title, timestamp: duration, views, ago, url: videoUrl } = videoInfo;

    let thumbnailBuffer = null;
    try {
      const response = await axios.get(videoInfo.image, { responseType: 'arraybuffer' });
      thumbnailBuffer = Buffer.from(response.data, 'binary');
    } catch {}

    const description = `╭─⬣「 *Barboza-Ai* 」⬣
│  ≡◦ 🎵 Título ∙ ${title}
│  ≡◦ ⏱ Duración ∙ ${duration || 'Desconocida'}
│  ≡◦ 👀 Vistas ∙ ${views.toLocaleString()}
│  ≡◦ 📅 Publicado ∙ ${ago || 'Desconocido'}
│  ≡◦ 🔗 URL ∙ ${videoUrl}
╰─⬣
> © Powered By Barboza™`;

    await conn.sendMessage(
      m.chat,
      {
        text: description,
        contextInfo: {
          externalAdReply: {
            title: title,
            body: 'Barboza Music',
            previewType: 'PHOTO',
            thumbnail: thumbnailBuffer || null,
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          }
        }
      },
      { quoted: m }
    );

    const downloadData = await getDownloadUrl(videoUrl);
    if (!downloadData || !downloadData.url) {
      await conn.sendMessage(m.chat, { react: { text: '🔴', key: reactionMessage.key } }, { quoted: m });
      throw new Error('No se pudo descargar la música desde ninguna API.');
    }

    await conn.sendMessage(m.chat, { react: { text: '🟢', key: reactionMessage.key } }, { quoted: m });
    const success = await sendAudioNormal(conn, m.chat, downloadData.url, downloadData.title || title);
    if (!success) throw new Error('No se pudo enviar el audio.');

  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: '🔴', key: reactionMessage.key } }, { quoted: m });
    await conn.reply(m.chat, `🚨 *Error:* ${error.message || 'Error desconocido'}`, m);
  }
};

handler.command = /^play$/i;
handler.help = ['play <texto>'];
handler.tags = ['descargas'];

export default handler;
