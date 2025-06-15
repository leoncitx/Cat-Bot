
import { xpRange} from '../lib/levelling.js'

const clockString = ms => {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

const imagen = "https://files.catbox.moe/ltq7ph.jpg";

const menuHeader = `
_╭━━━「 📍 BARBOZA MD 」━━━╮_
_┃ 👤 Bienvenido, %name_
_┃ 🎖 Nivel: %level | XP: %exp/%max_
_┃ 🔓 Límite: %limit | 📌 Modo: %mode_
_┃ ⏱️ Uptime: %uptime | 🌍 Usuarios: %total_
_┃ 🤖 Bot optimizado para mejor rendimiento._
_╰━━━━━━━━━━━━━━━━━━━━━━━╯_
`;

const sectionDivider = `_╰───────────────╯_`;

const menuFooter = `
_╭────────────┈_
_│ 🛠 Bot desarrollado para máxima eficiencia._
_│ 💡 Usa los comandos con el prefijo correspondiente._
_│ 🚀 Desarrollado por @Barboza-Team_
_╰────────────┈_
`;

let handler = async (m, { conn, usedPrefix: _p}) => {
  try {
    const user = global.db.data.users[m.sender] || { level: 1, exp: 0, limit: 5};
    const { exp, level, limit} = user;
    const { min, xp} = xpRange(level, global.multiplier || 1);
    const totalreg = Object.keys(global.db?.data?.users || {}).length;
    const mode = global.opts?.self? 'Privado 🔒': 'Público 🌐';
    const uptime = clockString(process.uptime() * 1000);
    const name = await conn.getName(m.sender) || "Usuario";

    if (!global.plugins) return conn.reply(m.chat, '❌ _Plugins no cargados._', m);

    let categorizedCommands = {};
    Object.values(global.plugins)
.filter(p => p?.help &&!p.disabled)
.forEach(p => {
        const tag = p.tags?.[0] || 'Otros';
        categorizedCommands[tag] = categorizedCommands[tag] || new Set();
        (Array.isArray(p.help)? p.help: [p.help]).forEach(cmd => categorizedCommands[tag].add(cmd));
});

    const menuBody = Object.entries(categorizedCommands)
.map(([title, cmds]) => {
        const emojis = {
          "Anime": "🎭",
          "Info": "ℹ️",
          "Search": "🔎",
          "Game": "🎮",
          "SubBots": "🤖",
          "RPG": "🌀",
          "Registro": "📝",
          "Sticker": "🎨",
          "Imagen": "🖼️",
          "Logo": "🖌️",
          "Configuración": "⚙️",
          "Premium": "💎",
          "Descargas": "📥",
          "Herramientas": "🛠️",
          "Diversión": "🎉",
          "NSFW": "🔞",
          "Base de Datos": "📀",
          "Audios": "🔊",
          "Avanzado": "🗝️",
          "Free Fire": "🔥",
          "Otros": "🪪"
};
        const emoji = emojis[title] || "📁";
        const upperTitle = title.toUpperCase();
        const entries = [...cmds].map(cmd => {
          const plugin = Object.values(global.plugins).find(p => p.help?.includes(cmd));
          const premium = plugin?.premium? '💎': '';
          const limited = plugin?.limit? '🌀': '';
          return `_│ 📍 ${_p}${cmd}_ ${premium}${limited}`.trim();
}).join('\n');
        return `_╭─「 ${emoji} ${upperTitle} 」_\n${entries}\n${sectionDivider}`;
}).join('\n\n');

    const finalHeader = menuHeader
.replace('%name', name)
.replace('%level', level)
.replace('%exp', exp - min)
.replace('%max', xp)
.replace('%limit', limit)
.replace('%mode', mode)
.replace('%uptime', uptime)
.replace('%total', totalreg);

    const fullMenu = `${finalHeader}\n\n${menuBody}\n\n${menuFooter}`.trim();

    await conn.sendMessage(m.chat, {
      image: { url: imagen},
      caption: fullMenu,
      mentions: [m.sender]
}, { quoted: m});

} catch (e) {
    console.error(e);
    conn.reply(m.chat, '⚠️ _Error al generar el menú._', m);
}
};

handler.command = ['menu', 'help', 'menú'];
export default handler;