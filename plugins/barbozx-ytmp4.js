/**
  @ ✨ Descargador YTMP4
  @ ✨ Fuente: https://whatsapp.com/channel/0029VbBDTFd6mYPDtnetTK1f
  @ ✨ Scrape: https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C/3861
**/

import axios from 'axios'
import fs from 'fs'

// Función para obtener información del video
async function obtenerInfoVideo(url) {
  const { data} = await axios.post(`https://api.ytmp4.fit/api/video-info`, { url}, {
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://ytmp4.fit',
      'Referer': 'https://ytmp4.fit/'
}
})

  if (!data ||!data.title) throw new Error('❌ No se pudo obtener la información del video.')
  return data
}

// Función para obtener el enlace de descarga
async function obtenerVideo(url, calidad) {
  const res = await axios.post(`https://api.ytmp4.fit/api/download`, { url, quality: calidad}, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/octet-stream',
      'Origin': 'https://ytmp4.fit',
      'Referer': 'https://ytmp4.fit/'
},
    responseType: 'arraybuffer'
})

  const tipoContenido = res.headers['content-type']
  if (!tipoContenido.includes('video')) throw new Error('❌ Enlace de descarga no disponible.')

  return Buffer.from(res.data)
}

// Handler principal
let handler = async (m, { conn, text, usedPrefix, command}) => {
  let [url, calidad] = text.trim().split(/\s+/)

  if (!url ||!calidad) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key}})
    return conn.sendMessage(m.chat, {
      text: `📼 *Usa el comando correctamente:*\n\n` +
            `> *${usedPrefix + command}* <url> <calidad>\n\n` +
            `Ejemplo:\n\`\`\`${usedPrefix + command} https://youtube.com/watch?v=dQw4w9WgXcQ 360p\`\`\``
})
}

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key}})
    const info = await obtenerInfoVideo(url)

    const video = await obtenerVideo(url, calidad)

    await conn.sendMessage(m.chat, {
      video: video,
      mimetype: 'video/mp4',
      fileName: `${info.title} - ${calidad}.mp4`,
      caption: `🎬 *Descargador YTMP4* 🎬\n\n` +
               `📌 *Título:* ${info.title}\n` +
               `📺 *Canal:* ${info.channel}\n` +
               `⏱ *Duración:* ${info.duration}\n` +
               `👁 *Vistas:* ${info.views}\n` +
               `💾 *Calidad:* ${calidad}`
})

    await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key}})

} catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key}})
    await conn.sendMessage(m.chat, {
      text: `😢 *No se pudo descargar el video...*\n` +
            `🛠 *Error:* \`${err.message}\`\n\n` +
            `Asegúrate de que el enlace y la calidad sean válidos.`
})
}
}

handler.help = ['ytmp4 <url> <calidad>']
handler.tags = ['descargas']
handler.command = /^(ytmp4)$/i
handler.register = false
handler.limit = false
export default handler