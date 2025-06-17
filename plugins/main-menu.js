import { xpRange } from '../lib/levelling.js'

const clockString = (ms) => {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

const imagen = "https://files.catbox.moe/ltq7ph.jpg"

const menuHeader = `
╭───❒「 *📍 BARBOZA MD MENU* 」❒
│ 👤 *Usuario:* %name
│ 🎖 *Nivel:* %level | 🧬 XP: %exp/%max
│ 💠 *Límite:* %limit | 📌 *Modo:* %mode
│ ⏱️ *Uptime:* %uptime | 🌎 *Usuarios:* %total
│ 🤖 Bot estable y optimizado.
╰──────────────❒`.trim()

const sectionDivider = `╰───────────────────────❒`

const menuFooter = `
╭───❒「 *📌 INFO IMPORTANTE* 」❒
│ ⚙️ *Utiliza los comandos con:* prefijo: (_ej. ! / ._)
│ 🚀 *Desarrollado por:* @Barboza-Team
╰──────────────❒`.trim()

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const user = global.db.data.users[m.sender] || { level: 1, exp: 0, limit: 5 }
    const { exp, level, limit } = user
    const { min, xp } = xpRange(level, global.multiplier || 1)
    const totalreg = Object.keys(global.db?.data?.users || {}).length
    const mode = global.opts?.self ? 'Privado 🔒' : 'Público 🌐'
    const uptime = clockString(process.uptime() * 1000)
    const name = await conn.getName(m.sender) || "Usuario"

    if (!global.plugins) return conn.reply(m.chat, '❌ _Plugins no cargados._', m)

    let categorizedCommands = {}
    Object.values(global.plugins)
      .filter(p => p?.help && !p.disabled)
      .forEach(p => {
        const tag = p.tags?.[0] || 'Otros'
        categorizedCommands[tag] = categorizedCommands[tag] || new Set()
        (Array.isArray(p.help) ? p.help : [p.help]).forEach(cmd => categorizedCommands[tag].add(cmd))
      })

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
    }

    const menuBody = Object.entries(categorizedCommands).map(([title, cmds]) => {
      const emoji = emojis[title] || "📁"
      const commands = [...cmds].map(cmd => {
        const plugin = Object.values(global.plugins).find(p => p.help?.includes(cmd))
        const premium = plugin?.premium ? '💎' : ''
        const limited = plugin?.limit ? '🌀' : ''
        return `│ ➤ ${_p}${cmd} ${premium}${limited}`.trim()
      }).join('\n')
      return `╭─「 ${emoji} *${title.toUpperCase()}* 」\n${commands}\n${sectionDivider}`
    }).join('\n\n')

    const finalHeader = menuHeader
      .replace('%name', name)
      .replace('%level', level)
      .replace('%exp', exp - min)
      .replace('%max', xp)
      .replace('%limit', limit)
      .replace('%mode', mode)
      .replace('%uptime', uptime)
      .replace('%total', totalreg)

    const fullMenu = `${finalHeader}\n\n${menuBody}\n\n${menuFooter}`.trim()

    await conn.sendMessage(m.chat, {
      image: { url: imagen },
      caption: fullMenu,
      mentions: [m.sender]
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ _Error al generar el menú._', m)
  }
}

handler.command = ['menu', 'help', 'menú']
export default handler
