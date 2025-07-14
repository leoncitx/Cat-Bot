const delay = ms => new Promise(res => setTimeout(res, ms))

const handler = async (m, { conn, args, participants, usedPrefix, command, isBotAdmin}) => {
  // Validación de entrada
  if (args.length < 2) {
    return m.reply(`📝 Uso correcto:\n${usedPrefix}${command} <prefijo> <mensaje>\nEjemplo: ${usedPrefix}${command} 52 Hola a todos los del +52`)
}

  // Procesamiento del prefijo y el mensaje
  const prefijo = args[0].replace(/[+]/g, '')
  const texto = args.slice(1).join(' ')
  const botSettings = global.db.data.settings[conn.user.jid] || {}

  // Filtrado de participantes con el prefijo
  const objetivo = participants
.map(u => u.id)
.filter(id => id.startsWith(prefijo) && id!== conn.user.jid)

  if (!objetivo.length) {
    return m.reply(`📭 No encontré usuarios con prefijo +${prefijo} en este grupo.`)
}

  const menciones = objetivo.map(id => '@' + id.split('@')[0])

  // Envío del mensaje con menciones ocultas
  await conn.sendMessage(m.chat, {
    text: `💌 *Mensaje para usuarios con prefijo +${prefijo}:*\n\n${texto}`,
    mentions: objetivo
}, { quoted: m})

  // Expulsión opcional
  if (isBotAdmin && botSettings.restrict) {
    for (const usuario of objetivo) {
      await delay(3000)
      const respuesta = await conn.groupParticipantsUpdate(m.chat, [usuario], 'remove')
      if (respuesta?.[0]?.status === '404') {
        const errorMsg = `⚠️ @${usuario.split('@')[0]} no se pudo eliminar o ya no está en el grupo.`
        await m.reply(errorMsg, m.chat, { mentions: conn.parseMention(errorMsg)})
}
}
}
}

handler.command = /^(hidetagnum)$/i
handler.group = true
handler.botAdmin = true
handler.admin = true
handler.fail = null

export default handler