import axios from 'axios'
import FormData from 'form-data'

let handler = async (m, { conn }) => {
  m.reply('wett')
  try {
    let q = m.quoted || m
    let mime = (q.msg || q).mimetype || q.mimetype || q.mediaType || ''
    if (!mime) throw 'replay gambar dengan teks :  .hd'
    if (!/image\/(jpe?g|png)/.test(mime)) throw `pormat ${mime} gk suprot`
    let img = await q.download?.()
    if (!img) throw 'gagal mendownload gambar'
    let buffer = await upscale(img)
    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: '*Donee kak*'
    }, { quoted: m })
  } catch (e) {
    m.reply(`Eror kak : ${e.message}`)
  }
}

handler.help = ['hd2 <reply img>']
handler.tags = ['ai']
handler.command = ['hd']

export default handler

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
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
    }
    const { data } = await axios.post('https://picupscaler.com/api/generate/handle', form, { headers })
const resultUrl = data?.image_url || data?.url
if (!resultUrl) throw 'upscale gagal'
const imgRes = await axios.get(resultUrl, { responseType: 'arraybuffer' })
return Buffer.from(imgRes.data)
  } catch (err) {
    throw `upscale eror : ${typeof err === 'string' ? err : err.message}`
  }
}