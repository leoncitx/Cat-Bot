import yts from 'yt-search'
import axios from 'axios'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getVideoDownloadUrl = async (videoUrl, maxRetries = 2) => {
  const apiUrl = 'https://apis-mediahub.vercel.app/api/ytmp4?url='
  let attempt = 0

  while (attempt < maxRetries) {
    try {
      const response = await axios.get(`${apiUrl}${encodeURIComponent(videoUrl)}`, { timeout: 10000 })
      const data = response.data

      if (data?.status === 200 && data?.download) {
        return {
          url: data.download.trim(),
          title: data.title || 'Video sin título',
          resolution: data.resolution || 'Desconocida'
        }
      }
    } catch (error) {
      console.error(`❌ Error en intento ${attempt + 1} con API MP4:`, error.message)
      if (attempt < maxRetries - 1) await wait(12000)
    }
    attempt++
  }

  return null
}

// Convierte duración tipo "1:23:45" o "12:34" en minutos
const durationToMinutes = (durationStr) => {
  const parts = durationStr.split(':').map(Number)
  if (parts.length === 3) {
    return parts[0] * 60 + parts[1] + parts[2] / 60
  } else if (parts.length === 2) {
    return parts[0] + parts[1] / 60
  } else {
    return 0
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.trim()) {
    await conn.reply(
      m.chat,
      `Uso: ${usedPrefix + command} <nombre del video>\nEjemplo: ${usedPrefix + command} La Bachata Manuel Turizo`,
      m
    )
    return
  }

  text = text.trim()

  const currentTime = new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
  const currentHour = new Date(currentTime).getHours()
  let greeting = ""
  if (currentHour >= 0 && currentHour < 12) {
    greeting = "Buenos días 🌅"
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = "Buenas tardes 🌄"
  } else {
    greeting = "Buenas noches 🌃"
  }

  const userNumber = m.sender.split('@')[0]

  const reactionMessage = await conn.reply(
    m.chat,
    `${greeting} @${userNumber},\nEstoy buscando el video solicitado.\n¡Gracias por usar MediaHub!`,
    m,
    { mentions: [m.sender] }
  )

  await conn.sendMessage(
    m.chat,
    { react: { text: '📀', key: reactionMessage.key } },
    { quoted: m }
  )

  try {
    const searchResults = await yts(text)
    if (!searchResults?.videos?.length) throw new Error("No se encontraron resultados en YouTube.")

    const videoInfo = searchResults.videos[0]
    const { title, timestamp: duration, views, ago, url: videoUrl, image } = videoInfo

    const minutes = durationToMinutes(duration || "0:00")
    if (minutes > 80) {
      await conn.sendMessage(
        m.chat,
        { react: { text: '🔴', key: reactionMessage.key } },
        { quoted: m }
      )
      return await conn.reply(
        m.chat,
        `⚠️ *Límite de duración superado*\n\nEl video dura *${duration}* y el límite es de *1 hora y 20 minutos (80 min)*.\nPor favor, intenta con un video más corto.`,
        m
      )
    }

    const description = `⌘━─━─[ *MediaHub* ]─━─━⌘
➷ *Título:* ${title}
➷ *Duración:* ${duration || "Desconocida"}
➷ *Vistas:* ${views.toLocaleString()}
➷ *Publicado:* ${ago}
➷ *URL:* ${videoUrl}

> _*© Prohibido la copia, Código Oficial de MediaHub™*_`

    await conn.sendMessage(
      m.chat,
      { image: { url: image }, caption: description },
      { quoted: m }
    )

    let downloadData = await getVideoDownloadUrl(videoUrl)
    if (!downloadData || !downloadData.url) {
      await conn.sendMessage(
        m.chat,
        { react: { text: '🔴', key: reactionMessage.key } },
        { quoted: m }
      )
      throw new Error("No se pudo descargar el video desde la API.")
    }

    await conn.sendMessage(
      m.chat,
      { react: { text: '🟢', key: reactionMessage.key } },
      { quoted: m }
    )

    await conn.sendMessage(
      m.chat,
      {
        video: { url: downloadData.url },
        caption: `🎬 *${downloadData.title}*\n📥 Resolución: ${downloadData.resolution}`
      },
      { quoted: m }
    )

  } catch (error) {
    console.error("❌ Error:", error)
    await conn.reply(
      m.chat,
      `🚨 *Error:* ${error.message || "Error desconocido"}`,
      m
    )
  }
}

handler.help = ['pasavid <texto>']
handler.tags = ['mediahub']
handler.command = /^pasavid$/i

export default handler