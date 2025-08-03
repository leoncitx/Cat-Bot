import axios from 'axios'
import cheerio from 'cheerio'
import mime from 'mime-types'

let handler = async (m, { conn, text}) => {
  if (!text) return m.reply(`📌 Ejemplo:\n.mediafire https://www.mediafire.com/file/xfk1u8yl4uqbizx/nulis.zip/file`)
  if (!/mediafire\.com/.test(text)) return m.reply(`❌ El enlace no es válido. Solo se aceptan links de *mediafire.com*`)

  try {
    const { data} = await axios.get('https://api.nekorinn.my.id/tools/rynn-stuff-v2', {
      params: {
        method: 'GET',
        url: text,
        accessKey: '3ebcf782818cfa0b7265086f112ae25c0954afec762aa05a2eac66580c7cb353'
}
})

    const $ = cheerio.load(data.result.response)
    const raw = $('div.dl-info')

    const filename = $('.dl-btn-label').attr('title') || raw.find('div.intro div.filename').text().trim()
    const extension = filename.split('.').pop()
    const mimetype = mime.lookup(extension.toLowerCase()) || 'application/octet-stream'

    const filesize = raw.find('ul.details li:nth-child(1) span').text().trim()
    const fecha = raw.find('ul.details li:nth-child(2) span').text().trim()
    const urlCodificada = $('a#downloadButton').attr('data-scrambled-url')

    if (!urlCodificada) return m.reply('❌ No se pudo obtener el enlace de descarga.')

    const urlDescarga = Buffer.from(urlCodificada, 'base64').toString()
    const pesoMB = parseFloat(filesize) * (filesize.toLowerCase().includes('gb')? 1024: 1)

    const mensaje = `
📦 *Archivo MediaFire*
📁 *Nombre:* ${filename}
📄 *Tipo:* ${mimetype}
📦 *Tamaño:* ${filesize}
🗓️ *Subido:* ${fecha}
`.trim()

    const contextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        mediaUrl: urlDescarga,
        mediaType: 1,
        renderLargerThumbnail: true,
        thumbnailUrl: global.thumb || 'https://telegra.ph/file/7e6802b6c40fcf8fc4aa5.jpg',
        title: filename,
        body: `${filesize} | Subido: ${fecha}`,
        sourceUrl: urlDescarga
}
}

    if (pesoMB <= 100) {
      await conn.sendMessage(m.chat, {
        document: { url: urlDescarga},
        fileName: filename,
        mimetype,
        caption: mensaje,
        contextInfo
}, { quoted: m})
} else {
      await conn.sendMessage(m.chat, {
        text: mensaje,
        contextInfo
}, { quoted: m})
}

} catch (error) {
    console.error(error)
    m.reply(`❌ Error al procesar el enlace: ${error.message}`)
}
}

handler.command = ['mediafire', 'mf', 'mfdl']
handler.help = ['mediafire <enlace>']
handler.tags = ['descargas']

export default handler