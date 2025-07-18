//código creado por +50248019799 
//para Hinata Bot /  akeno himejima 
//https://whatsapp.com/channel/0029Vaqe1Iv65yDAKBYr6z0A
let handler = async (m, { conn, text, args, command, isAdmin, isBotAdmin, usedPrefix }) => {
  if (!isAdmin) throw '🛑 Este comando solo lo pueden usar los *admins* del grupo.'
  if (!isBotAdmin) throw '🤖 Necesito ser admin para activar esta función.'

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  const chat = global.db.data.chats[m.chat]
  const arabes = ['212', '91', '92', '234', '964', '971', '963', '93', '90', '994']

  // ACTIVAR
  if (command === 'activa') {
    if (text.toLowerCase() === 'antiarabe') {
      chat.antiArabe = true
      await conn.reply(m.chat, '🌐 Modo *antiárabe activado*. Ahora los números raros serán eliminados del grupo.', m)

      // Revisar y eliminar árabes ya presentes
      let groupData = await conn.groupMetadata(m.chat)
      let participantes = groupData.participants

      for (let user of participantes) {
        let number = user.id.split('@')[0]
        if (arabes.some(code => number.startsWith(code))) {
          try {
            await conn.sendMessage(m.chat, { text: `⚠️ Usuario sospechoso *@${number}* detectado. Eliminando...`, mentions: [user.id] })
            await conn.groupParticipantsUpdate(m.chat, [user.id], 'remove')
            await conn.sendMessage(m.chat, { text: `✅ *Listo*, ese número raro fue eliminado del grupo.`, mentions: [user.id] })
          } catch (e) {
            await conn.reply(m.chat, `❌ No pude eliminar a *@${number}*, puede que sea admin.`, m, { mentions: [user.id] })
          }
        }
      }
      return
    } else {
      return conn.reply(m.chat, `✋ Estás usando el comando mal.\n\n📌 Usa así:\n*${usedPrefix}activa antiarabe* para activar\n*${usedPrefix}desactiva antiarabe* para desactivar`, m)
    }
  }

  // DESACTIVAR
  if (command === 'desactiva') {
    if (text.toLowerCase() === 'antiarabe') {
      chat.antiArabe = false
      return conn.reply(m.chat, '📴 Modo *antiárabe desactivado*. Ya no eliminaré a los números raros.', m)
    } else {
      return conn.reply(m.chat, `✋ Estás usando el comando mal.\n\n📌 Usa así:\n*${usedPrefix}activa antiarabe* para activar\n*${usedPrefix}desactiva antiarabe* para desactivar`, m)
    }
  }
}

handler.command = ['activa', 'desactiva']
handler.group = true
handler.admin = true
export default handler