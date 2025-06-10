import yts from 'yt-search';
import fs from 'fs';
import axios from 'axios';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 12000;

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
      } catch (error) {
        if (attempt < MAX_RETRIES - 1) await wait(RETRY_DELAY_MS);
      }
    }
  }
  return null;
};

const sendAudioNormal = async (conn, chat, audioUrl, videoTitle) => {
  let thumbnailBuffer = null;
  try {
    const response = await axios.get('https://files.catbox.moe/skhywv.jpg', { responseType: 'arraybuffer' });
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
              body: 'MediaHub Mu&ic',
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
    } catch (error) {
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
      const response = await axios.get('https://files.catbox.moe/rdxsm0.jpg', { responseType: 'arraybuffer' });
      thumbnailBuffer = Buffer.from(response.data, 'binary');
    } catch {
      console.error('Error al obtener la miniatura de ayuda:', error);
    }

    await conn.sendMessage(
      m.chat,
      {
        text: `Uso: ${usedPrefix + command} <nombre de la canción>\n> Ejemplo: ${usedPrefix + command} Mi Vida Eres Tu `,
        contextInfo: {
          externalAdReply: {
            title: 'MediaHub Mu&ic',
            previewType: 'PHOTO',
            thumbnail: thumbnailBuffer || null,
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: true,
            sourceUrl: 'https://mediahub-info.vercel.app'
          }
        }
      },
      { quoted: m }
    );
    return;
  }

  const currentTime = new Date().toLocaleString('en-US', { timeZone: 'America/Lima' });
  const currentHour = new Date(currentTime).getHours();
  const greeting = currentHour < 12 ? 'Buenos días 🌅' : currentHour < 18 ? 'Buenas tardes 🌄' : 'Buenas noches 🌃';

  const userNumber = m.sender.split('@')[0];
  const reactionMessage = await conn.reply(
    m.chat,
    `${greeting} @${userNumber},\nEstoy buscando la música solicitada.\n
> Gracias por usar MediaHub📱!`,
    m,
    { mentions: [m.sender] }
  );

  await conn.sendMessage(m.chat, { react: { text: '📀', key: reactionMessage.key } }, { quoted: m });

  try {
    const searchResults = await yts(text.trim());
    if (!searchResults?.videos?.length) throw new Error('No se encontraron resultados en YouTube.');

    const videoInfo = searchResults.videos[0];
    const { title, timestamp: duration, views, ago, url: videoUrl } = videoInfo;

    // Descargar la imagen del video como buffer para externalAdReply
    let thumbnailBuffer = null;
    try {
      const response = await axios.get(videoInfo.image, { responseType: 'arraybuffer' });
      thumbnailBuffer = Buffer.from(response.data, 'binary');
    } catch {
      console.error('Error al obtener la miniatura del video:', error);
    }

    // Formato exacto con externalAdReply
    const description = `╭─⬣「 *MediaHub* 」⬣
│  ≡◦ *🎵 Título* ∙ ${title}
│  ≡◦ *⏱ Duración* ∙ ${duration || 'Desconocida'}
│  ≡◦ *👀 Vistas* ∙ ${views.toLocaleString()}
│  ≡◦ *📅 Publicado* ∙ ${ago || 'Desconocido'}
│  ≡◦ *🔗 URL* ∙ ${videoUrl}
╰─⬣
> © Prohibido la copia, Código Oficial de MediaHub™`;

    await conn.sendMessage(
      m.chat,
      {
        text: description,
        contextInfo: {
          externalAdReply: {
            title: title,
            body: 'MediaHub Mu&ic',
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
    await conn.reply(m.chat, `🚨 *Error:* ${error.message || 'Error desconocido'}`, m);
  }
};

handler.command = /^play$/i;
handler.help = ['play <text>'];
handler.tags = ['descargas'];
export default handler;