let handler = async (m, { conn, participants, groupMetadata}) => {
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || './storage/img/siskedurl.jpg'
  const groupAdmins = participants.filter(p => p.admin)
  const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'

  const text = `
╭─❍ *💢 GUERRA DE CLANES ACTIVADA*
│
│📛 *Grupo:* ${groupMetadata.subject}
│
│⏳ *Horario:*
│➥ MÉXICO 🇲🇽
│➥ COLOMBIA 🇨🇴
│
│👥 *Jugadores:*
│➥ Confirmación vía comando
│
│🥷 *Escuadra ➹1*
│   👑 •
│   ⚜️ •
│   ⚜️ •
│   ⚜️ •
│
│🥷 *Escuadra ➹2*
│   👑 •
│   ⚜️ •
│   ⚜️ •
│   ⚜️ •
│
│🥷 *Escuadra ➹3*
│   👑 •
│   ⚜️ •
│   ⚜️ •
│   ⚜️ •
│
│🥷 *Escuadra ➹4*
│   👑 •
│   ⚜️ •
│   ⚜️ •
│   ⚜️ •
│
│🥷 *Escuadra ➹5*
│   👑 •
│   ⚜️ •
│   ⚜️ •
│   ⚜️ •
│
│🥷 *Escuadra ➹6*
│   👑 •
│   ⚜️ •
│   ⚜️ •
│   ⚜️ •
│
│🔁 *Suplentes:*
│   ⚜️ •
│   ⚜️ •
│   ⚜️ •
│   ⚜️ •
│   ⚜️ •
│   ⚜️ •
╰────────────────────❍
`.trim()

  await conn.sendFile(
    m.chat,
    pp,
    'guerra.jpg',
    text,
    m,
    false,
    { mentions: [...groupAdmins.map(v => v.id), owner]}
)
}

handler.help = ['guerradeclanes']
handler.command = /^(guerra|guerradeclanes)$/i
handler.group = true

export default handler