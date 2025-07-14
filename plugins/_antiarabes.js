let handler = async (event, { conn}) => {
  const chat = global.db.data.chats[event.id]
  if (!chat?.onlyLatinos) return

  const metadata = await conn.groupMetadata(event.id)
  const bot = metadata.participants.find(p => p.id === conn.user.jid)
  const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin'

  if (!isBotAdmin) return 

  const forbidPrefixes = [
    "212", 
    "265", 
    "234", 
    "258", 
    "263", 
    "93", 
    "967",
    "92",  
    "254",
    "213",
    "960", 
    "964",
    "973",
    "971",
    "961", 
    "962" 
  ]

  for (const participant of event.participants) {
    if (event.action === 'add') {
      const jid = participant
      const phone = jid.split('@')[0]
      const prefix = phone.substring(0, 3)

      if (forbidPrefixes.includes(prefix)) {
        await conn.sendMessage(event.id, {
          text: `🚫 *Acceso restringido*\nUsuario @${phone} no cumple con los requisitos del grupo.\nSerá eliminado automáticamente.`,
          mentions: [jid]
})
        await conn.groupParticipantsUpdate(event.id, [jid], 'remove')
}
}
}
}

export default handler
handler.groupParticipantsUpdate = true