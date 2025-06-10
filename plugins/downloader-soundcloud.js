
import yts from 'yt-search';
import fetch from 'node-fetch';

const handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) throw m.reply(`Ejemplo: ${usedPrefix}${command} <consulta>`); // Agregado el paréntesis de cierre

  const search = await yts(text);
  const vid = search.videos[0];
  if (!vid) throw m.reply('No se encontró resultados, intente cambiar su consulta.');

  const { title, thumbnail, timestamp, views, ago, url } = vid;

  await conn.sendMessage(m.chat, {
    image: { url: thumbnail },
    caption: `[✿] Descargando *${title}*\n> Descargando su audio, espera un momento...`, // Corrección de typo
  }, { quoted: m });

  try {
    const response = await fetch(`https://nirkyy-dev.hf.space/api/v1/youtube-audio-v2?url=${encodeURIComponent(url)}`);
    let keni = await response.json();
    if (!keni.data) return m.reply("Error al obtener los datos!");

    await conn.sendMessage(m.chat, {
      audio: { url: keni.data },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      caption: `*${title}*\n*Duración*: ${timestamp}\n*Vistas*: ${views}\n*Publicado*: ${ago}`,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 2,
          mediaUrl: keni.data,
          title: title,
          body: 'Audio Download',
          sourceUrl: url, // Cambiado de args[0] a url
          thumbnail: await (await conn.getFile(thumbnail)).data,
        },
      },
    }, { quoted: m });

  } catch (error) {
    console.error('Error:', error.message);
    throw m.reply(`Error: ${error.message}`);
  }
}

handler.help = ['play'].map(v => v + ' <consulta>');
handler.tags = ['descargas']; // Corrección del tag
handler.command = /^(play)$/i;

export default handler;