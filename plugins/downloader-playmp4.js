import axios from 'axios'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  const emoji = '🎬'
  const error = '❌'
  const done = '✅'

  if (!text) {
    return m.reply(`╭─〔 *📽️ INGRESA UN TÍTULO* 〕
│
├ ✦ *Ejemplo:* ${usedPrefix + command} Arcangel La jumpa
├ ✦ Debes escribir el nombre del video
│
╰──────────────⬣`)
  }

  try {
    // Llamar a la API de búsqueda de video
    const response = await axios.get(`https://api.vreden.my.id/api/ytplayvideo?query=${encodeURIComponent(text)}`)
    const data = response.data

    if (!data?.result?.url) throw '⚠️ No se pudo obtener el video.'

    const info = data.result.metadata
    const videoUrl = data.result.url
    const title = info.title

    // Mostrar info del video
    await conn.sendMessage(m.chat, {
      image: { url: info.thumbnail },
      caption: `╭─〔 *🎞️ VIDEO ENCONTRADO* 〕
│
├ 📹 *Título:* ${title}
├ 🧑‍💻 *Autor:* ${info.author.name}
├ ⏱️ *Duración:* ${info.duration.timestamp}
├ 📊 *Vistas:* ${info.views.toLocaleString()}
├ 🔗 *Link:* ${info.url}
│
╰──────────────⬣`
    }, { quoted: m })

    // Enviar el video
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: `⟡ *${title}*\n> Enviado por MediaHub`,
      mimetype: 'video/mp4'
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply(`${error} Ocurrió un error al intentar obtener el video.`)
  }
}

handler.command = ['play2']
handler.help = ['play2 <nombre>']
handler.tags = ['descargas']

export default handler