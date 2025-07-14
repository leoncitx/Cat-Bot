let handler = m => m

handler.before = async function (m, {conn, isAdmin, isBotAdmin, isOwner}) {
  if (!m.isGroup) return!1
  let chat = global.db.data.chats[m.chat]

  let forbiddenLinks = ["porn", "xxx", "xvideos.com", "xnxx.com", "redtube.com", "sex.com"]

  if (m.text && isBotAdmin && chat.antilinkxxx &&!isAdmin &&!isOwner) {
    for (let link of forbiddenLinks) {
      if (m.text.toLowerCase().includes(link)) {
        await m.reply('🚫 Enlace prohibido detectado. Serás eliminado del grupo.')
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        return false
}
}
}

  return true
}

export default handler