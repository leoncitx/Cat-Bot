
const handler = async (msg, { conn, args}) => {
  const chatId = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid
  const senderNum = sender.replace(/[^0-9]/g, "")
  const isOwner = global.owner?.some(([id]) => id === senderNum)
  const isFromMe = msg.key.fromMe

  const meta = await conn.groupMetadata(chatId)
  const isAdmin = meta.participants.find(p => p.id === sender)?.admin

  if (!chatId.endsWith("@g.us")) return conn.sendMessage(chatId, { text: "😭 Este comando solo funciona en grupos."}, { quoted: msg})
  if (!isAdmin &&!isOwner &&!isFromMe) return conn.sendMessage(chatId, { text: "🧱 Solo admins o el dueño pueden invocar el sufrimiento."}, { quoted: msg})

  const horaTexto = args.join(" ").trim()
  if (!horaTexto) return conn.sendMessage(chatId, {
    text: "⌛ Usa así:\n*.4vs4 21:00*\nO *.4vs4 8:30pm*",
    quoted: msg
})

  await conn.sendMessage(chatId, { react: { text: '⚔️', key: msg.key}})

  const to24Hour = (str) => {
    let [time, modifier] = str.toLowerCase().split(/(am|pm)/)
    let [h, m] = time.split(":").map(n => parseInt(n))
    if (modifier === 'pm' && h!== 12) h += 12
    if (modifier === 'am' && h === 12) h = 0
    return { h, m: m || 0}
}

  const to12Hour = (h, m) => {
    const suffix = h>= 12? 'pm': 'am'
    h = h % 12 || 12
    return `${h}:${m.toString().padStart(2, '0')}${suffix}`
}

  const base = to24Hour(horaTexto)
  const zonas = [
    { pais: "🇲🇽 MÉXICO", offset: 0},
    { pais: "🇨🇴 COLOMBIA", offset: 0},
    { pais: "🇵🇪 PERÚ", offset: 0},
    { pais: "🇨🇱 CHILE", offset: 2},
    { pais: "🇦🇷 ARGENTINA", offset: 2},
    { pais: "🇪🇸 ESPAÑA", offset: 7}
  ]

  const horaMsg = zonas.map(z => {
    let newH = base.h + z.offset
    if (newH>= 24) newH -= 24
    return `${z.pais}: ${to12Hour(newH, base.m)}`
}).join("\n")

  const escuadra = []
  const suplentes = []
  const participantes = meta.participants.filter(p => p.id!== conn.user.id)

  const plantilla = () => `
🔥 *4 VS 4 - DUELO SIN PIEDAD* 🔥

⏱ *HORARIO:*
${horaMsg}

🔫 *MODALIDAD:* Clásico / PvP

👑 *ESCUADRA:*
${escuadra.map((u, i) => `${i === 0? "👑": "🥷"} ┇ @${u.split("@")[0]}`).join("\n") || "—"}

💤 *SUPLENTES:*
${suplentes.map((u, i) => `🧑‍🦲 ┇ @${u.split("@")[0]}`).join("\n") || "—"}

📝 Reacciona con ❤️ para jugar
📝 Reacciona con 👍 para ser suplente
`.trim()

  const msgInicio = await conn.sendMessage(chatId, {
    text: plantilla(),
    mentions: participantes.map(p => p.id)
}, { quoted: msg})

  const mensajeId = msgInicio.key.id

  conn.ev.on('messages.reaction', async ({ key, message}) => {
    if (key.id!== mensajeId || key.remoteJid!== chatId) return

    const reaction = message?.reaction?.text
    const userId = key.participant
    const nombre = meta.participants.find(p => p.id === userId)?.id || userId

    if (reaction === "❤️") {
      if (!escuadra.includes(nombre) && escuadra.length < 4) {
        escuadra.push(nombre)
        suplentes.splice(suplentes.indexOf(nombre), 1)
}
}

    if (reaction === "👍") {
      if (!suplentes.includes(nombre) && suplentes.length < 2) {
        suplentes.push(nombre)
        escuadra.splice(escuadra.indexOf(nombre), 1)
}
}

    await conn.sendMessage(chatId, {
      edit: msgInicio.key,
      text: plantilla(),
      mentions: [...escuadra,...suplentes]
})
})
}

handler.command = ['4vs4']
handler.tags = ['game']
handler.group = true
export default handler