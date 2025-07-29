import { sticker} from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png} from '../lib/webp2mp4.js'
import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command}) => {
  let stiker = false
  const emoji = '✨'

  // fkontak estilo Sasuke Bot MD
  const fkontak = {
    key: {
      participants: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'SasukeSticker'
},
    message: {
      contactMessage: {
        displayName: '✨ Sasuke Bot MD | Generador de Stickers',
        vcard:
          'BEGIN:VCARD\n' +
          'VERSION:3.0\n' +
          'N:;Sasuke;;;\n' +
          'FN:Sasuke Sticker Master\n' +
          'ORG:Barboza Developers\n' +
          'TITLE:Editor Visual Shinobi\n' +
          'item1.TEL;waid=19709001746:+1 (970) 900-1746\n' +
          'item1.X-ABLabel:Stickers\n' +
          'X-WA-BIZ-DESCRIPTION:🌀 Creador avanzado de stickers visuales en formato anime y dinámico.\n' +
          'X-WA-BIZ-NAME:Sasuke Bot MD\n' +
          'END:VCARD'
}
},
    participant: '0@s.whatsapp.net'
}

  try {
    let q = m.quoted? m.quoted: m
    let mime = (q.msg || q).mimetype || q.mediaType || ''

    if (/webp|image|video/g.test(mime)) {
      if (/video/g.test(mime) && (q.msg || q).seconds> 15) {
        return m.reply(`📽️ *Demasiado largo...*\nTu video excede los 15 segundos. Usa uno más corto para el sticker.`, m, fkontak)
}

      let img = await q.download?.()
      if (!img) {
        return conn.reply(m.chat,
`╭─〔 🌟 *CREADOR DE STICKERS* 🌟 〕─╮
│
│ 🖼️ *Envía una imagen o video corto*
│     para generar tu sticker personalizado.
│
│ ⏱️ *Máx. duración de video:* 15 segundos
│
│ 🌐 También puedes usar un enlace:
│     *.sticker https://ejemplo.com/imagen.png*
│
│ 🚀 ¡Exprésate con estilo!
╰──────────────────────────────╯`, m, fkontak)
}

      let out
      try {
        let userId = m.sender
        let packstickers = global.db.data.users[userId] || {}
        let texto1 = packstickers.text1 || global.packsticker
        let texto2 = packstickers.text2 || global.packsticker2

        stiker = await sticker(img, false, texto1, texto2)
} finally {
        if (!stiker) {
          if (/webp/g.test(mime)) out = await webp2png(img)
          else if (/image/g.test(mime)) out = await uploadImage(img)
          else if (/video/g.test(mime)) out = await uploadFile(img)
          if (typeof out!== 'string') out = await uploadImage(img)
          stiker = await sticker(false, out, global.packsticker, global.packsticker2)
}
}

} else if (args[0]) {
      if (isUrl(args[0])) {
        stiker = await sticker(false, args[0], global.packsticker, global.packsticker2)
} else {
        return m.reply(`⚠️ *URL no válida.* Por favor, verifica el enlace e intenta nuevamente.`, m, fkontak)
}
}

} finally {
    if (stiker) {
      conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, fkontak)
} else {
      return conn.reply(m.chat,
`╭─〔 🤖 *STICKER BOT* 🤖 〕─╮
│
│ ❌ No se pudo crear el sticker.
│
│ 📥 Asegúrate de enviar una imagen o video
│     válido, o prueba con un enlace directo.
│
│ 📌 Si necesitas ayuda, usa *.menu*
╰────────────────────────────╯`, m, fkontak)
}
}
}

handler.help = ['stiker <img>', 'sticker <url>']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']

export default handler

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))
}