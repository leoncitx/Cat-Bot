const jugadores = new Map()
const escuadra = []
const suplentes = []
const maxJugadores = 4
const maxSuplentes = 2
let mensajeId = null
let chatId = null

function render() {
  return `
🧨 *TORNEO 4 VS 4* ⚔️
──────────────────────────

🕓 *HORARIOS DISPONIBLES*
🇲🇽 México: --
🇨🇴 Colombia: --

🎮 *MODALIDAD:* Clásico / PvP

🎯 *JUGADORES TITULARES*

👑 ${escuadra[0] || '—'}
🥷 ${escuadra[1] || '—'}
🥷 ${escuadra[2] || '—'}
🥷 ${escuadra[3] || '—'}

💤 *SUPLENTES*

🔁 ${suplentes[0] || '—'}
🔁 ${suplentes[1] || '—'}

──────────────────────────
📝 Reacciona con 👍 para jugar
📝 Reacciona con ❤️ para ser suplente
`.trim()
}

let handler = async (m, { conn}) => {
  chatId = m.chat

  const msg = await conn.sendMessage(chatId, { text: render()}, { quoted: m})
  mensajeId = msg.key.id

  conn.ev.on('messages.reaction', async ({ key, message}) => {
    if (key.id!== mensajeId || key.remoteJid!== chatId) return

    const reaction = message?.reaction?.text
    const userId = key.participant
    const metadata = await conn.groupMetadata(chatId)
    const name = metadata.participants.find(p => p.id === userId)?.name || userId

    if (reaction === '👍') {
      if (!escuadra.includes(name) && escuadra.length < maxJugadores) {
        escuadra.push(name)
        jugadores.set(userId, name)
}
}

    if (reaction === '❤️') {
      if (!suplentes.includes(name) && suplentes.length < maxSuplentes) {
        suplentes.push(name)
        jugadores.set(userId, name)
}
}

    await conn.sendMessage(chatId, { text: render()})
})
}

handler.help = ['4vs4']
handler.tags = ['game']
handler.command = /^(4vs4|vs4)$/i
handler.group = true

export default handler