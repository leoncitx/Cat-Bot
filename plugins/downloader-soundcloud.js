
import fetch from 'node-fetch';
import yts from 'yt-search';
import fs from 'fs';
import axios from 'axios';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 12000;

const countryCodes = {
  '+54': { country: 'Argentina', timeZone: 'America/Argentina/Buenos_Aires'},
  '+591': { country: 'Bolivia', timeZone: 'America/La_Paz'},
  '+56': { country: 'Chile', timeZone: 'America/Santiago'},
  '+57': { country: 'Colombia', timeZone: 'America/Bogota'},
  '+506': { country: 'Costa Rica', timeZone: 'America/Costa_Rica'},
  '+53': { country: 'Cuba', timeZone: 'America/Havana'},
  '+593': { country: 'Ecuador', timeZone: 'America/Guayaquil'},
  '+503': { country: 'El Salvador', timeZone: 'America/El_Salvador'},
  '+34': { country: 'España', timeZone: 'Europe/Madrid'},
  '+502': { country: 'Guatemala', timeZone: 'America/Guatemala'},
  '+504': { country: 'Honduras', timeZone: 'America/Tegucigalpa'},
  '+52': { country: 'México', timeZone: 'America/Mexico_City'},
  '+505': { country: 'Nicaragua', timeZone: 'America/Managua'},
  '+507': { country: 'Panamá', timeZone: 'America/Panama'},
  '+595': { country: 'Paraguay', timeZone: 'America/Asuncion'},
  '+51': { country: 'Perú', timeZone: 'America/Lima'},
  '+1': { country: 'Puerto Rico', timeZone: 'America/Puerto_Rico'},
  '+1-809': { country: 'República Dominicana', timeZone: 'America/Santo_Domingo'},
  '+1-829': { country: 'República Dominicana', timeZone: 'America/Santo_Domingo'},
  '+1-849': { country: 'República Dominicana', timeZone: 'America/Santo_Domingo'},
  '+598': { country: 'Uruguay', timeZone: 'America/Montevideo'},
  '+58': { country: 'Venezuela', timeZone: 'America/Caracas'}
};

const getGreeting = (hour) => {
  return hour < 12? 'Buenos días 🌅': hour < 18? 'Buenas tardes 🌄': 'Buenas noches 🌃';
};

let handler = async (m, { conn, args, usedPrefix, command}) => {
  if (!args[0]) {
    return m.reply(`✳️ Escribe el nombre de una canción o proporciona un enlace de YouTube.\n\nEjemplo:\n${usedPrefix + command} never gonna give you up`);
}

  const query = args.join(' ');
  const results = await yts(query);
  const video = results.videos[0];

  if (!video) return m.reply('⚠️ No se encontró ningún resultado para esa búsqueda.');

  const apiURL = `https://api.sylphy.xyz/download/ytmp3?url=${encodeURIComponent(video.url)}`;

  try {
    const res = await fetch(apiURL);
    const data = await res.json();
    const audioUrl = data?.result?.url;
    const title = data?.result?.title;

    if (!audioUrl) return m.reply('❌ No se pudo obtener el audio. Intenta con otro enlace o nombre.');

    // Obtener saludo con base en zona horaria estimada
    const prefix = m.sender.slice(0, m.sender.indexOf('@'));
    const matchedCode = Object.keys(countryCodes).find(code => prefix.startsWith(code.replace('+', '')));
    const userCountry = matchedCode? countryCodes[matchedCode].country: 'desconocido';
    const now = new Date();
    const hour = matchedCode? new Date().toLocaleString('en-US', { timeZone: countryCodes[matchedCode].timeZone, hour: 'numeric', hour12: false}): now.getHours();
    const saludo = getGreeting(parseInt(hour));

    await conn.sendMessage(m.chat, {
      document: { url: audioUrl},
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      caption: `${saludo}, aquí tienes el audio de *${title}* 📥\nOrigen estimado: ${userCountry}`
}, { quoted: m});

} catch (e) {
    console.error(e);
    m.reply('❌ Ocurrió un error inesperado al procesar tu solicitud.');
}
};

handler.command = ['play', 'playmp3', 'ytmp3'];
handler.help = ['play <canción o enlace>'];
handler.tags = ['downloader'];

export default handler;