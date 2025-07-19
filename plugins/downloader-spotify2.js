import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return m.reply(`🌀 *Uso incorrecto del comando*\n\n🔎 _Ejemplo:_\n${usedPrefix + command} Stay`);
    }

    await m.react('🎧');

    const res = await fetch(`https://api.nekorinn.my.id/downloader/spotifyplay?q=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status || !json.result?.downloadUrl) {
      throw '❌ No se encontró la canción o el enlace está roto.';
    }

    const { title, artist, thumbnail, downloadUrl } = json.result;

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: `
┏━━━꒷꒦✞꒦꒷━━━┓
🎶 *Spotify Downloader*
┗━━━꒷꒦✞꒦꒷━━━┛

🔊 *Título:* ${title}
🎤 *Artista:* ${artist}

🔗 *Descarga MP3 abajo...*`,
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m });

    await m.react('✅');

  } catch (e) {
    console.error('[❌ ERROR Spotify]', e);
    await m.reply(`⚠️ *Error al procesar tu solicitud:*\n${e?.message || e}`);
    await m.react('💀');
  }
};

handler.help = ['music *<texto>*'];
handler.tags = ['descargas'];
handler.command = ['music', '', 'splay'];

export default handler;
