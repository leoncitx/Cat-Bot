import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import yts from 'yt-search';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';

// Asegúrate de que ffmpeg esté instalado y accesible en tu PATH
// Por ejemplo, en sistemas basados en Debian/Ubuntu: sudo apt install ffmpeg
// En Windows, descarga los binarios y añádelos a tu PATH

const unlinkAsync = promisify(fs.unlink);

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!args[0]) {
    throw `✧ Ejemplo: ${usedPrefix}${command} Joji - Ew`;
  }

  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

  try {
    let results = await yts(text);
    if (!results.videos || results.videos.length === 0) {
      throw '✧ No se encontraron resultados para tu búsqueda.';
    }

    let videoInfo = results.videos[0];
    const videoUrl = videoInfo.url;

    // Obtener información detallada del video para el título y la duración
    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title;
    const author = info.videoDetails.author.name;
    const duration = formatDuration(parseInt(info.videoDetails.lengthSeconds));

    // Ruta temporal para guardar el archivo MP3
    const outputFilePath = path.join('/tmp', `${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`);

    // Descargar y convertir a MP3
    await new Promise((resolve, reject) => {
      ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' })
        .pipe(ffmpeg()
          .audioBitrate(128) // Puedes ajustar la calidad del audio
          .save(outputFilePath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err)));
    });

    const caption = `
      *💮 PLAY AUDIO 💮*
 
  ✧ : \`titulo;\` ${title || 'no encontrado'}
  ✧ : \`artista;\` ${author || 'no encontrado'}
  ✧ : \`duracion;\` ${duration || 'no encontrado'}
  ✧ : \`tipo;\` mp3
 
> ${wm}
> Pedido de @${m.sender.split('@')[0]}
> url: ${videoUrl}`;

    await m.reply(caption);

    await conn.sendMessage(m.chat, {
      audio: { url: outputFilePath },
      mimetype: "audio/mp4",
      fileName: `${title}.mp3`,
      mentions: [m.sender]
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    // Eliminar el archivo temporal después de enviarlo
    await unlinkAsync(outputFilePath);

  } catch (error) {
    console.error("Error:", error);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    m.reply(`✧ Ocurrió un error al procesar tu solicitud: ${error.message || error}`);
  }
};

handler.help = ['play *<consulta>*'];
handler.tags = ['downloader'];
handler.command = ["play", "song", "musica"];

export default handler;

// Función para formatear la duración
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
