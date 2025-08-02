// Plugin adaptado para Waguri Ai ✦ Canal y privacidad ✦ By KenisawaDev import fs from 'fs'

let handler = async (m, { conn, text, args, command }) => { 
const valores = ['none', 'contacts', 'everyone', 'mycontacts', 'mycontactsexcept'] 
const isChannelLink = (url) => url.includes('whatsapp.com/channel/') 
const getID = (url) => url.split('whatsapp.com/channel/')[1] 
const img = { url: "https://files.catbox.moe/hale3u.jpg" }

switch (command) {

case 'setcallprivacy': {
  if (!valores.includes(text)) throw m.reply(`✎ Uso: #${command} <valor>\n⤿ Valores: ${valores.join(', ')}`)
  await conn.updateCallPrivacy(text)
  m.reply(`❀ Privacidad de llamadas actualizada a: *${text}* ✨`)
  break
}

case 'setlastprivacy': {
  if (!valores.includes(text)) throw m.reply(`✎ Uso: #${command} <valor>\n⤿ Valores: ${valores.join(', ')}`)
  await conn.updateLastSeenPrivacy(text)
  m.reply(`❀ Privacidad de última conexión actualizada a: *${text}* ✨`)
  break
}

case 'setonlineprivacy': {
  if (!valores.includes(text)) throw m.reply(`✎ Uso: #${command} <valor>\n⤿ Valores: ${valores.join(', ')}`)
  await conn.updateOnlinePrivacy(text)
  m.reply(`❀ Estado en línea ahora es visible para: *${text}* ✨`)
  break
}

case 'setprofileprivacy': {
  if (!valores.includes(text)) throw m.reply(`✎ Uso: #${command} <valor>\n⤿ Valores: ${valores.join(', ')}`)
  await conn.updateProfilePicturePrivacy(text)
  m.reply(`❀ Privacidad de foto de perfil configurada a: *${text}* ✨`)
  break
}

case 'setstatusprivacy': {
  if (!valores.includes(text)) throw m.reply(`✎ Uso: #${command} <valor>\n⤿ Valores: ${valores.join(', ')}`)
  await conn.updateStatusPrivacy(text)
  m.reply(`❀ Privacidad de estados configurada a: *${text}* ✨`)
  break
}

case 'setreadreceiptsprivacy': {
  if (!valores.includes(text)) throw m.reply(`✎ Uso: #${command} <valor>\n⤿ Valores: ${valores.join(', ')}`)
  await conn.updateReadReceiptsPrivacy(text)
  m.reply(`❀ Confirmación de lectura configurada a: *${text}* ✨`)
  break
}

case 'createnewsletter': {
  if (!text.includes('|')) throw m.reply('✎ Usa: #createnewsletter <nombre> | <descripción>')
  let [name, desc] = text.split('|').map(v => v.trim())
  const res = await conn.newsletterCreate(name, desc)
  conn.sendMessage(m.chat, {
    image: img,
    caption: `☁︎ *Canal creado con éxito:*

⤿ Nombre: ${res.name} 
⤿ Descripción: ${res.description}` }, { quoted: m }) 
break 
}

case 'setnewsletterdesc': {
  const des = text.trim()
  await conn.newsletterUpdateDescription(global.saluran, des)
  m.reply('❀ Descripción del canal actualizada correctamente ✨')
  break
}

case 'setnewslettername': {
  const name = text.trim()
  await conn.newsletterUpdateName(global.saluran, name)
  m.reply('❀ Nombre del canal actualizado con éxito ✨')
  break
}

case 'setnewsletterpic': {
  if (!m.quoted || !m.quoted.isMedia) throw m.reply('✎ Responde a una imagen para actualizar la foto del canal.')
  const media = await m.quoted.download()
  await conn.newsletterUpdatePicture(global.saluran, media)
  m.reply('❀ Imagen del canal actualizada con éxito ✨')
  break
}

case 'removenewsletterpic': {
  await conn.newsletterRemovePicture(global.saluran)
  m.reply('☁︎ Foto del canal eliminada correctamente ✨')
  break
}

case 'follownewsletter': {
  if (!isChannelLink(text)) throw m.reply('✎ Debes incluir un link válido del canal')
  const id = getID(text)
  const data = await conn.newsletterMetadata('invite', id)
  await conn.newsletterFollow(data.id)
  m.reply('☁︎ Seguiste el canal correctamente ✨')
  break
}

case 'unfollownewsletter': {
  if (!isChannelLink(text)) throw m.reply('✎ Debes incluir un link válido del canal')
  const id = getID(text)
  const data = await conn.newsletterMetadata('invite', id)
  await conn.newsletterUnfollow(data.id)
  m.reply('☁︎ Dejaste de seguir el canal correctamente ✨')
  break
}

case 'mutenewsletter': {
  if (!isChannelLink(text)) throw m.reply('✎ Debes incluir un link válido del canal')
  const id = getID(text)
  const data = await conn.newsletterMetadata('invite', id)
  await conn.newsletterMute(data.id)
  m.reply('☁︎ Notificaciones silenciadas correctamente ✨')
  break
}

case 'unmutenewsletter': {
  if (!isChannelLink(text)) throw m.reply('✎ Debes incluir un link válido del canal')
  const id = getID(text)
  const data = await conn.newsletterMetadata('invite', id)
  await conn.newsletterUnmute(data.id)
  m.reply('☁︎ Notificaciones activadas correctamente ✨')
  break
}

case 'setreactionmode': {
  if (!['enabled', 'disabled'].includes(text)) throw m.reply('✎ Usa: #setreactionmode enabled / disabled')
  await conn.newsletterReactionMode(global.saluran, text)
  m.reply(`☁︎ Modo de reacción actualizado a *${text}* ✨`)
  break
}

case 'getnewsletterinfo': {
  if (!isChannelLink(text)) throw m.reply('✎ Usa: #getnewsletterinfo <link>')
  const id = getID(text)
  const data = await conn.newsletterMetadata('invite', id)
  const fecha = (unix) => {
    let d = new Date(unix * 1000)
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
  }
  const caption = `☁︎ *Información del Canal*

⤿ Nombre: ${data.name} 
⤿ ID: ${data.id} 
⤿ Estado: ${data.state} 
⤿ Creado el: ${fecha(data.creation_time)} 
⤿ Subscriptores: ${data.subscribers} 
⤿ Verificado: ${data.verification} 
⤿ Emoji: ${data.reaction_codes} 
⤿ Descripción: ${data.description}`

conn.sendMessage(m.chat, { image: img, caption }, { quoted: m })
  break
}

} }

handler.command = [ 'setcallprivacy', 'setlastprivacy', 'setonlineprivacy', 'setprofileprivacy', 'setstatusprivacy', 'setreadreceiptsprivacy', 'createnewsletter', 'setnewsletterdesc', 'setnewslettername', 'setnewsletterpic', 'removenewsletterpic', 'follownewsletter', 'unfollownewsletter', 'mutenewsletter', 'unmutenewsletter', 'setreactionmode', 'getnewsletterinfo' ] 
handler.help = [ 'setcallprivacy', 'setlastprivacy', 'setonlineprivacy', 'setprofileprivacy', 'setstatusprivacy', 'setreadreceiptsprivacy', 'createnewsletter', 'setnewsletterdesc', 'setnewslettername', 'setnewsletterpic', 'removenewsletterpic', 'follownewsletter', 'unfollownewsletter', 'mutenewsletter', 'unmutenewsletter', 'setreactionmode', 'getnewsletterinfo' ] 
handler.tags = ['canal']
handler.owner = true

export default handler