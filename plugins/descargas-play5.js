
const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { promisify} = require("util");
const { pipeline} = require("stream");
const streamPipe = promisify(pipeline);

const handler = async (m, { conn, text, command}) => {
  if (!text) return conn.sendMessage(m.chat, { text: `✳️ Usa: ${command} <nombre del video>`}, { quoted: m});

  // buscar video
  const res = await yts(text);
  const vid = res.videos[0];
  if (!vid) return conn.sendMessage(m.chat, { text: "❌ No encontré resultados."}, { quoted: m});

  const { title, url, timestamp, views, author, thumbnail} = vid;

  const info = `
🎬 Título: ${title}
⏱️ Duración: ${timestamp}
👁️ Vistas: ${views.toLocaleString()}
👤 Autor: ${author}
🔗 Enlace: ${url}

🎧 Descargando audio...`.trim();

  await conn.sendMessage(m.chat, { image: { url: thumbnail}, caption: info}, { quoted: m});

  // obtener audio
  const api = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(url)}&type=audio&quality=128kbps&apikey=russellxz`;
  const resAudio = await axios.get(api);
  if (!resAudio.data?.status ||!resAudio.data.data?.url) return conn.sendMessage(m.chat, { text: "⚠️ No se pudo obtener el audio"}, { quoted: m});

  const tmp = path.join(__dirname, "../tmp");
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);
  const inFile = path.join(tmp, `${Date.now()}_in.m4a`);
  const outFile = path.join(tmp, `${Date.now()}_out.mp3`);

  const dlStream = await axios.get(resAudio.data.data.url, { responseType: "stream"});
  await streamPipe(dlStream.data, fs.createWriteStream(inFile));
  await new Promise((resolve, reject) => {
    ffmpeg(inFile)
.audioCodec("libmp3lame")
.audioBitrate("128k")
.format("mp3")
.save(outFile)
.on("end", resolve)
.on("error", reject);
});

  const buffer = fs.readFileSync(outFile);
  await conn.sendMessage(m.chat, {
    audio: buffer,
    mimetype: "audio/mpeg",
    fileName: `${title}.mp3`
}, { quoted: m});

  fs.unlinkSync(inFile);
  fs.unlinkSync(outFile);
};

handler.command = ["musica", "playx"];
handler.tags = ["downloader"];
handler.help = ["musica <nombre>", "playx <nombre>"];
handler.register = true;

export default = handler;