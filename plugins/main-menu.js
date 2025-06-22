import { xpRange } from '../lib/levelling.js';

// Función para formatear el tiempo de actividad
const clockString = ms => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};

// URL de la imagen del menú
const imagen = "https://files.catbox.moe/ltq7ph.jpg";

// Encabezado del menú
const menuHeader = `
╭─❒ 「 *📍 BARBOZA MD* 」
│ 👤 *Nombre:* %name
│ 🎖 *Nivel:* %level | *XP:* %exp/%max
│ 🔓 *Límite:* %limit | *Modo:* %mode
│ ⏱️ *Uptime:* %uptime
│ 🌍 *Usuarios:* %total
│ 🤖 *Bot optimizado para mejor rendimiento.*
╰❒
`.trim();

// Divisor de sección
const sectionDivider = '╰─────────────────╯';

// Pie de página del menú
const menuFooter = `
╭─❒ 「 *📌 INFO FINAL* 」
│ ⚠️ *Usa los comandos con el prefijo correspondiente.*

> Creado por Barboza-Team
╰❒
`.trim();

// Handler principal
let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    // Asegurarse de que global.db y global.opts estén disponibles
    // Se asume que estos objetos son definidos globalmente en el entorno del bot.
    // Si no, necesitarías pasarlos o importarlos de alguna manera.
    const user = global.db?.data?.users?.[m.sender] || { level: 1, exp: 0, limit: 5 };
    const { exp, level, limit } = user;
    const { min, xp } = xpRange(level, global.multiplier || 1);
    const totalreg = Object.keys(global.db?.data?.users || {}).length;
    
    // Si global.opts no está definido, se usa un valor por defecto
    const mode = global.opts?.self ? 'Privado 🔒' : 'Público 🌐';
    const uptime = clockString(process.uptime() * 1000);

    let name = "Usuario";
    try {
      name = await conn.getName(m.sender);
    } catch {}

    let categorizedCommands = {};

    // Filtrar y categorizar comandos
    Object.values(global.plugins)
      .filter(p => p?.help && !p.disabled)
      .forEach(p => {
        // Asegurarse de que p.tags sea un array o un string para evitar errores
        const tags = Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? [p.tags] : ['Otros']);
        const tag = tags[0] || 'Otros'; // Tomar la primera etiqueta o 'Otros'

        if (!Array.isArray(p.help) && typeof p.help !== 'string') return;
        const commands = Array.isArray(p.help) ? p.help : [p.help];
        
        categorizedCommands[tag] = categorizedCommands[tag] || new Set();
        commands.forEach(cmd => categorizedCommands[tag].add(cmd));
      });

    // Emojis para las categorías
    const emojis = {
      anime: "🎭",
      info: "ℹ️",
      search: "🔎",
      game: "🎮",
      diversión: "🎉",
      subbots: "🤖",
      rpg: "🌀",
      registro: "📝",
      sticker: "🎨",
      imagen: "🖼️",
      logo: "🖌️",
      configuración: "⚙️",
      premium: "💎",
      descargas: "📥",
      herramientas: "🛠️",
      nsfw: "🔞",
      "base de datos": "📀",
      audios: "🔊",
      avanzado: "🗝️",
      "free fire": "🔥",
      otros: "🪪"
    };

    // Construir el cuerpo del menú por categorías
    const menuBody = Object.entries(categorizedCommands).map(([title, cmds]) => {
      const cleanTitle = title.toLowerCase().trim();
      const emoji = emojis[cleanTitle] || "📁"; // Emoji por defecto si no se encuentra
      const entries = [...cmds].map(cmd => `│ ◦ _${_p}${cmd}_`).join('\n');
      return `╭─「 ${emoji} *${title.toUpperCase()}* 」\n${entries}\n${sectionDivider}`;
    }).join('\n\n');

    // Rellenar el encabezado con los datos del usuario
    const finalHeader = menuHeader
      .replace('%name', name)
      .replace('%level', level)
      .replace('%exp', exp - min)
      .replace('%max', xp)
      .replace('%limit', limit)
      .replace('%mode', mode)
      .replace('%uptime', uptime)
      .replace('%total', totalreg);

    // Unir todas las partes del menú
    const fullMenu = `${finalHeader}\n\n${menuBody}\n\n${menuFooter}`;

    // Enviar el mensaje con la imagen y el caption
    await conn.sendMessage(m.chat, {
      image: { url: imagen },
      caption: fullMenu,
      mentions: [m.sender] // Mencion al usuario
    }, { quoted: m }); // Responder al mensaje original

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, '⚠️ Ocurrió un error al generar el menú. Por favor, inténtalo de nuevo más tarde o contacta al soporte.', m);
  }
};

// Comandos que activan este handler
handler.command = ['menu', 'help', 'menú'];

export default handler;
