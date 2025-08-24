import { xpRange} from '../lib/levelling.js';
import axios from 'axios';

// Utilidad para convertir milisegundos en formato hh:mm:ss
const clockString = ms => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};

// Saludo dinámico según la hora
const saludarSegunHora = () => {
  const hora = new Date().getHours();
  if (hora>= 5 && hora < 12) return '🌄 Buenos días';
  if (hora>= 12 && hora < 19) return '🌞 Buenas tardes';
  return '🌙 Buenas noches';
};

// Imagen de respaldo
const img = 'https://cdn-sunflareteam.vercel.app/images/f123d13223.jpg';
const sectionDivider = '╰━━━━━━━━━━━━━━━━━━⭓';

// Pie de menú
const menuFooter = `
╭─❒ 「📌 INFO FINAL」
│ ⚠️ Usa los comandos con el prefijo correspondiente
│ 📌 Ejemplo:.ping |.menu
│ 🛡️ Creado por Barboza-Team
╰❒
`.trim();

// Extensión para obtener un elemento aleatorio de un array
Array.prototype.getRandom = function () {
  return this[Math.floor(Math.random() * this.length)];
};

const handler = async (m, { conn, usedPrefix}) => {
  try {
    const saludo = saludarSegunHora();
    const user = global.db.data.users[m.sender] || { level: 1, exp: 0, limit: 5};
    const { exp, level, limit} = user;
    const { min, xp} = xpRange(level, global.multiplier || 1);
    const totalUsers = Object.keys(global.db.data.users).length;
    const mode = global.opts?.self? 'Privado 🔒': 'Público 🌐';
    const uptime = clockString(process.uptime() * 1000);
    const tagUsuario = `@${m.sender.split('@')[0]}`;
    const userName = (await conn.getName?.(m.sender)) || tagUsuario;

    const text = [
      "*Etiqueta General X Sasuke*",
      "𝙈𝙚𝙣𝙘𝙞𝙤𝙣 𝙂𝙚𝙣𝙚𝙧𝙖𝙡",
      "𝙀𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙣𝙙𝙤 𝙖 𝙡𝙤𝙨 𝙉𝙋𝘾"
    ].getRandom();

    const imgRandom = [
      "https://iili.io/FKVDVAN.jpg",
      "https://iili.io/FKVbUrJ.jpg"
    ].getRandom();

    let thumbnailBuffer;
    try {
      const response = await axios.get(imgRandom, { responseType: 'arraybuffer'});
      thumbnailBuffer = Buffer.from(response.data);
} catch (e) {
      console.error('❌ Error al descargar la imagen:', e);
      const fallback = await axios.get(img, { responseType: 'arraybuffer'});
      thumbnailBuffer = Buffer.from(fallback.data);
}

    const izumi = {
      key: { participants: "0@s.whatsapp.net", fromMe: false, id: "Halo"},
      message: {
        locationMessage: {
          name: text,
          jpegThumbnail: thumbnailBuffer,
          vcard:
            "BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\n" +
            "item1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\n" +
            "X-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD"
}
},
      participant: "0@s.whatsapp.net"
};

    let categorizedCommands = {};
    Object.values(global.plugins)
.filter(p => p?.help &&!p.disabled)
.forEach(p => {
        const tag = Array.isArray(p.tags)? p.tags[0]: p.tags || 'Otros';
        const cmds = Array.isArray(p.help)? p.help: [p.help];
        categorizedCommands[tag] = categorizedCommands[tag] || new Set();
        cmds.forEach(cmd => categorizedCommands[tag].add(usedPrefix + cmd));
});

    const categoryEmojis = {
      anime: '🎭', info: 'ℹ️', search: '🔎', diversión: '🎉', subbots: '🤖',
      rpg: '🌀', registro: '📝', sticker: '🎨', imagen: '🖼️', logo: '🖌️',
      premium: '🎖️', configuración: '⚙️', descargas: '📥', herramientas: '🛠️',
      nsfw: '🔞', 'base de datos': '📀', audios: '🔊', freefire: '🔥', otros: '🪪'
};

    const menuBody = Object.entries(categorizedCommands).map(([title, cmds]) => {

const emoji = categoryEmojis[title.toLowerCase()] || '📁';
      const list = [...cmds].map(cmd => `│ ◦ ${cmd}`).join('\n');
      return `╭─「 ${emoji} ${title.toUpperCase()} 」\n${list}\n${sectionDivider}`;
}).join('\n\n');

    const header = `
${saludo} ${tagUsuario} 👋

╭─ 「 sᥲsᥙkᥱ ᑲ᥆𝗍 mძ 🌀 」
│ 👤 Nombre: ${userName}
│ 🎖 Nivel: ${level} | XP: ${exp - min}/${xp}
│ 🔓 Límite: ${limit}
│ 🧭 Modo: ${mode}
│ ⏱️ Tiempo activo: ${uptime}
│ 🌍 Usuarios registrados: ${totalUsers}
╰─❒
`.trim();

    const fullMenu = `${header}\n\n${menuBody}\n\n${menuFooter}`;

    const botSettings = global.db.data.settings?.[conn.user.jid] || {};
    const bannerr = botSettings.banner || 'https://raw.githubusercontent.com/WillZek/CrowBot-ST/main/media/catalogo.jpg';

    await conn.sendMessage(m.chat, {
      image: { url: bannerr},
      caption: fullMenu,
      mentions: [m.sender]
}, { quoted: izumi});

} catch (e) {
    console.error('❌ Error al generar el menú:', e);
    await conn.reply(m.chat, '⚠️ Ocurrió un error al mostrar el menú.', m);
}
};

handler.command = ['menu', 'help', 'menú'];
export default handler;
```

Este código está listo para integrarse en tu bot. Si el error persiste, compárteme el mensaje exacto que aparece en consola y te ayudo a resolverlo paso a paso. También puedo ayudarte a convertir este menú en uno interactivo con botones o listas si lo deseas.