import axios from 'axios'
import FormData from 'form-data'

let handler = async (m, { conn}) => {
  m.reply('⏳ Procesando imagen...')
  try {
    let q = m.quoted || m
    let mime = (q.msg || q).mimetype || q.mimetype || q.mediaType || ''
    if (!mime) throw 'Responde a una imagen con el texto:.hd'
    if (!/image\/(jpe?g|png)/.test(mime)) throw `Formato ${mime} no soportado`
    let img = await q.download?.()
    if (!img) throw 'Error al descargar la imagen'
    let buffer = await upscale(img)
    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: '*✅ Imagen mejorada con éxito*'
}, { quoted: m})
} catch (e) {
    m.reply(`❌ Error: ${e.message}`)
}
}

handler.help = ['hd2 <responde a una imagen>']
handler.tags = ['ai']
handler.command = ['hd']

export default handler

// Función para mejorar la imagen con IA
async function upscale(imageBuffer) {
  try {
    const form = new FormData()
    form.append('image', imageBuffer, {
      filename: 'upload.jpg',
      contentType: 'image/jpeg'
})
    form.append('user_id', 'undefined')
    form.append('is_public', 'true')

    const headers = {
...form.getHeaders(),
      'Accept': '*/*',
      'Origin': 'https://picupscaler.com',
      'Referer': 'https://picupscaler.com/',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
}

    const { data} = await axios.post('https://picupscaler.com/api/generate/handle', form, { headers})
    const resultUrl = data?.image_url || data?.url
    if (!resultUrl) throw 'Error al generar la imagen mejorada'
    const imgRes = await axios.get(resultUrl, { responseType: 'arraybuffer'})
    return Buffer.from(imgRes.data)

} catch (err) {
    throw `Error en la mejora: ${typeof err === 'string'? err: err.message}`
}
}