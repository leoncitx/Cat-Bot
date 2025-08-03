import axios from 'axios'
import FormData from 'form-data'

let handler = async (m, { conn}) => {
  m.reply('⏳ Procesando imagen en HD...')
  try {
    let mensaje = m.quoted || m
    let tipoMime = (mensaje.msg || mensaje).mimetype || mensaje.mimetype || mensaje.mediaType || ''

    if (!tipoMime) throw '⚠️ Responde a una imagen con el comando:.hd'
    if (!/image\/(jpe?g|png)/.test(tipoMime)) throw `⚠️ El formato ${tipoMime} no está soportado`

    let imagen = await mensaje.download?.()
    if (!imagen) throw '❌ No se pudo descargar la imagen'

    let imagenHD = await mejorarImagen(imagen)

    await conn.sendMessage(m.chat, {
      image: imagenHD,
      caption: '✅ Imagen mejorada con éxito'
}, { quoted: m})

} catch (error) {
    m.reply(`❌ Error: ${error.message}`)
}
}

handler.help = ['hd <responde a imagen>']
handler.tags = ['inteligencia_artificial']
handler.command = ['hd2']

export default handler

// Función para mejorar calidad de imagen
async function mejorarImagen(bufferImagen) {
  try {
    const form = new FormData()
    form.append('image', bufferImagen, {
      filename: 'imagen.jpg',
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
    const urlResultado = data?.image_url || data?.url
    if (!urlResultado) throw '❌ Error al mejorar la imagen'

    const imagenMejorada = await axios.get(urlResultado, { responseType: 'arraybuffer'})
    return Buffer.from(imagenMejorada.data)

} catch (err) {
    throw `❌ Error en mejora: ${typeof err === 'string'? err: err.message}`
}
}