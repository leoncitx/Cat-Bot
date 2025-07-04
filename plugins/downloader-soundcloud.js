import axios from 'axios'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  const emoji = '🎧'
  const error = '❌'
  const done = '✅'

  if (!text) {
    return m.reply(`╭─〔 *🔍 BÚSQUEDA REQUERIDA* 〕
│
├ ✦ *Ejemplo:* ${usedPrefix + command} DJ Malam Pagi
├ ✦ Escribe el nombre de una canción
│
╰──────────────⬣`)
  }

  try {
    const res = await axios.get(`https://api.vreden.my.id/api/ytplaymp3?query=${encodeURIComponent(text)}`)
    const data = res.data

    if (!data?.result?.download?.url) {
      throw '⚠️ No se encontró un resultado válido.'
    }

    const info = data.result.metadata
    const dl = data.result.download

    await conn.sendMessage(m.chat, {
      image: { url: info.thumbnail },
      caption: `╭─〔 *🎶 AUDIO ENCONTRADO* 〕
│
├ 🎵 *Título:* ${info.title}
├ 🧑‍🎤 *Autor:* ${info.author.name}
├ ⏱️ *Duración:* ${info.duration.timestamp}
├ 📊 *Vistas:* ${info.views.toLocaleString()}
├ 🔗 *Link:* ${info.url}
│
╰──────────────⬣`
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      audio: { url: dl.url },
      fileName: dl.filename,
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    return m.reply(`${error} No se pudo procesar tu solicitud.`)
  }
}

handler.command = ['play']
handler.help = ['play <nombre>']
handler.tags = ['descargas']

export default handler