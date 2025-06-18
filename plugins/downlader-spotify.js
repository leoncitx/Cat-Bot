
import fetch from 'node-fetch';
import fs from 'fs';

const countryCodes = {
  '+54': { country: 'Argentina', timeZone: 'America/Argentina/Buenos_Aires'},
  '+591': { country: 'Bolivia', timeZone: 'America/La_Paz'},
  '+56': { country: 'Chile', timeZone: 'America/Santiago'},
  '+57': { country: 'Colombia', timeZone: 'America/Bogota'},
  '+593': { country: 'Ecuador', timeZone: 'America/Guayaquil'},
  '+502': { country: 'Guatemala', timeZone: 'America/Guatemala'},
  '+504': { country: 'Honduras', timeZone: 'America/Tegucigalpa'},
  '+52': { country: 'México', timeZone: 'America/Mexico_City'},
  '+51': { country: 'Perú', timeZone: 'America/Lima'},
  '+58': { country: 'Venezuela', timeZone: 'America/Caracas'},
  '+34': { country: 'España', timeZone: 'Europe/Madrid'}
};

const getGreeting = hour => hour < 12? 'Buenos días 🌅': hour < 18? 'Buenas tardes 🌄': 'Buenas noches 🌃';

const getUserGreeting = (userNumber, limaTime) => {
  const phoneCode = '+' + userNumber.slice(0, userNumber.length - 7); // crudo pero funcional
  const info = countryCodes[phoneCode];
  if (info) {
    const local = new Date(limaTime.toLocaleString('en-US', { timeZone: info.timeZone}));
    return `${getGreeting(local.getHours())} @${userNumber}, (${info.country})`;
}
  return `${getGreeting(limaTime.getHours())} @${userNumber}`;
};

let handler = async (m, { conn, text, usedPrefix, command}) => {
  if (!text) throw `💨 Por favor, ingresa el nombre de una canción de Spotify.\n\n📌 Ejemplo:\n${usedPrefix + command} someone like you`;

  const limaTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima'}));
  const userNumber = m.sender.split('@')[0];

  const saludo = getUserGreeting(userNumber, limaTime);

  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key}});

  try {
    const res = await fetch(`https://api.nekorinn.my.id/downloader/spotifyplay?q=${encodeURIComponent(text)}`);
    const data = await res.json();

    if (!data.result?.downloadUrl) throw 'No se pudo obtener el enlace de descarga.';

    const caption = `╭──── ⬣「 *Spotify 🎧* 」⬣
│ 🧾 *Título:* ${data.result.name}
│ 🎤 *Artista:* ${data.result.artists?.join(', ') || 'Desconocido'}
│ ⏱ *Duración:* ${data.result.duration || 'N/A'}
│ 🔗 *Enlace:* ${data.result.external_urls?.spotify || 'Sin enlace'}
╰──── ⬣
${saludo}
> 🎶 Disfruta tu música con Barboza-Ai`;

    await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender]}, { quoted: m});

    await conn.sendMessage(m.chat, {
      audio: { url: data.result.downloadUrl},
      mimetype: 'audio/mpeg'
}, { quoted: m});

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key}});

} catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key}});
    throw `❌ Lo siento, no pude procesar esa canción.\nIntenta con otro título o revisa que sea válido.`;
}
};

handler.help = ['spotify *<texto>*'];
handler.tags = ['descargas'];
handler.command = ['spotify'];

export default handler;