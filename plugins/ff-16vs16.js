import fetch from 'node-fetch'
import axios from 'axios'

const jugadores = new Map()
const escuadras = [[], [], [], []]
const suplentes = []
const maxPorEscuadra = 4
const maxSuplentes = 2

const render = () => {
  let salida = `*16 𝐕𝐄𝐑𝐒𝐔𝐒 16*\n\n⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎                  •\n🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎:\n🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀:\n\n➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃:\n➥ 𝐉𝐔𝐆𝐀𝐃𝐎𝐑𝐄𝐒:\n`

  for (let i = 0; i < 4; i++) {
    salida += `\n         𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 ${i + 1}\n\n👑 ┇ ${escuadras[i][0] || '—'}\n`
    for (let j = 1; j < maxPorEscuadra; j++) {
      salida += `🥷🏻 ┇ ${escuadras[i][j] || '—'}\n`
}
}

  salida += `\nㅤʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄𝐒:\n`
  for (let i = 0; i < maxSuplentes; i++) {
    salida += `🥷🏻 ┇ ${suplentes[i] || '—'}\n`
}

  return salida
}

let handler = async (m, { conn}) => {
  const msg = await conn.sendMessage(m.chat, { text: render()}, { quoted: m})

  conn.updateMessageReaction = async ({ key, reaction}) => {
    const user = key.participant || m.sender
    const name = (await conn.fetchGroupMetadata(m.chat)).participants.find(p => p.id === user)?.name || user

    if (reaction === '👍') {
      for (let i = 0; i < escuadras.length; i++) {
        if (escuadras[i].length < maxPorEscuadra) {
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

handler.help = ['16vs16']
handler.tags = ['freefire']
handler.command = /^(vs16|16vs16)$/i
handler.group = true
export default handler