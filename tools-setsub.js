let handler = async (m, { args, usedPrefix, command }) => {
  const name = args.join(" ")
  if (!name) return m.reply(`✨ *Usa el comando así:*\n\n${usedPrefix + command} MiBotPersonal`)

  if (name.length > 25) return m.reply("⚠️ *El nombre es muy largo.* Usa menos de 25 caracteres.")

  global.db.data.settings = global.db.data.settings || {}
  global.db.data.settings[m.sender] = global.db.data.settings[m.sender] || {}
  global.db.data.settings[m.sender].menuBotName = name

  m.reply(`✅ *Nombre del menú del subbot actualizado a:* *${name}*`)
}

handler.help = ['setsub <nombre>']
handler.tags = ['owner']
handler.command = /^setsub$/i
handler.register = true

export default handler