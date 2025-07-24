
import axios from 'axios'

const jugadores = new Map()
const escuadras = [[], []]
const suplentes = []
const maxPorEscuadra = 4
const maxSuplentes = 2

const render = () => {
  let salida = `
〘 ⚔️ *EVENTO 4 VS 4* ⚔️ 〙
───────────────────────

🕒 *HORARIO*
🇲🇽 MÉXICO: --
🇨🇴 COLOMBIA: --

🎯 *MODALIDAD:* CLÁSICO / PVP

👥 *JUGADORES CONFIRMADOS:*

━━━━━━━━━━━━━━━━━━━━━
🛡️ *ESCUADRA 1*
👑 ${escuadras[0][0] || '—'}
🥷 ${escuadras[0][1] || '—'}
🥷 ${escuadras[0][2] || '—'}
🥷 ${escuadras[0][3] || '—'}

💤 *SUPLENTES*
🥷 ${suplentes[0] || '—'}
🥷 ${suplentes[1] || '—'}
━━━━━━━━━━━━━━━━━━━━━

📌 Reacciona con 👍 para jugar
📌 Reacciona con ❤️ para suplente
  `.trim()
  return salida
}

let handler = async (m, { conn}) => {
  const msg = await conn.sendMessage(m.chat, { text: render()}, { quoted: m})

  conn.updateMessageReaction = async ({ key, reaction}) => {
    const user = key.participant || m.sender
    const metadata = await conn.groupMetadata(m.chat)
    const name = metadata.participants.find(p => p.id === user)?.name || user

    if (reaction === '👍') {
      for (let i = 0; i < escuadras.length; i++) {
        if (escuadras[i].length < maxPorEscuadra &&!escuadras[i].includes(name)) {
          jugadores.set(user, name)
          escuadras[i].push(name)
          break
}
}
}

    if (reaction === '❤️') {
      if (suplentes.length < maxSuplentes &&!suplentes.includes(name)) {
        jugadores.set(user, name)
        suplentes.push(name)
}
}

    await conn.sendMessage(m.chat, { text: render()}, { quoted: m})
}
}

handler.help = ['4vs4']
handler.tags = ['game']
handler.command = /^(4vs4|vs4)$/i
handler.group = true
export default handler