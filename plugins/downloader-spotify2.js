import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return m.reply(`✨ *Uso del comando incorrecto:*\n\n🎵 Ejemplo:\n${usedPrefix + command} Believer`);
    }

    await m.react('🎧');

    const res = await fetch(`https://api.nekorinn.my.id/downloader/spotifyplay?q=${encodeURIComponent(text)}`);
    const json = await res.json();

    // Validación estricta
    if (!json || !json.status || !json.result || !json.result.downloadUrl) {
      throw new Error('No se encontró la canción o la API falló.');
    }

    const { title, artist, thumbnail, downloadUrl } = json.result;

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: `
╭━━━〘 *🎧 SPOTIFY DOWNLOADER* 〙━━━╮

🔊 *Título:* ${title || 'Desconocido'}
🎤 *Artista:* ${artist || 'Desconocido'}

🎶 *Descargando audio...*

╰━━━━━━━━━━━━━━━━━━━━╯
`.trim(),
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title || 'spotify_audio'}.mp3`
    }, { quoted: m });

    await m.react('✅');

  } catch (e) {
    console.error('[ERROR Spotify]', e);
    await m.reply(`⚠️ *Error al procesar tu solicitud:*\n${e.message || String(e)}`);
    await m.react('❌');
  }
};

handler.help = ['music *<texto>*'];
handler.tags = ['descargas'];
handler.command = ['music', 'spotify', 'splay'];

export default handler;
