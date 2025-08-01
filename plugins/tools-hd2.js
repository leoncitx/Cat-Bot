import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import Jimp from 'jimp'
import FormData from 'form-data'
import { fileURLToPath } from 'url'
import imgLarger from '../lib/upscale.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const handler = async (m, { conn }) => {

try {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || q.mediaType || ""

if (!/^image\/(jpe?g|png)$/.test(mime)) {
      return m.reply('🪐 Responde a una imagen.')
    }

    await conn.sendMessage(m.chat, { text: `⏳ Mejorando su imagen, por favor espere.`, quoted: m })

    const buffer = await q.download()
    const image = await Jimp.read(buffer)
    image.resize(800, Jimp.AUTO)

    const tempPath = path.join(__dirname, `tmp_${Date.now()}.jpg`)
    await image.writeAsync(tempPath)

    const uguuUrl = await uploadToUguu(tempPath)
    if (!uguuUrl) throw new Error('No se pudo subir la imagen para mejorarla.')

    const downloaded = await fetch(uguuUrl).then(r => r.buffer())

    const result = await imgLarger(downloaded)
    if (!result.status) throw new Error(result.message)

    await conn.sendFile(m.chat, result.url, 'hd.jpg', '✅ Imagen mejorada.', m)

  } catch (err) {
    console.error(err)
    conn.reply(m.chat, `❌ *Error:* ${err.message}`, m)
  }
}

handler.command = ['hd2']

export default handler

async function uploadToUguu(filePath) {
  const form = new FormData()
  form.append('files[]', fs.createReadStream(filePath))

  try {
    const res = await fetch('https://uguu.se/upload.php', {
      method: 'POST',
      headers: form.getHeaders(),
      body: form
    })

    const json = await res.json()
    await fs.promises.unlink(filePath)
    return json.files?.[0]?.url || null
  } catch (err) {
    await fs.promises.unlink(filePath)
    return null
  }
}