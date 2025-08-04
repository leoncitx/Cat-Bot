import fetch from 'node-fetch'
import { Sticker } from 'wa-sticker-formatter'

let handler = async (m, { conn, args }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
  
  try {
    const text = args.join(' ')
    if (!text) throw new Error('Contoh: .bratv halo dunia')
    
    const apiUrl = `https://api.ypnk.dpdns.org/api/video/bratv?text=${encodeURIComponent(text)}`
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error('Gagal mengambil video')
    
    const videoBuffer = await res.buffer()
    const sticker = new Sticker(videoBuffer, {
      pack: 'BRAT Video',
      author: 'Yupra AI',
      type: 'crop',
      quality: 50
    })
    
    await conn.sendMessage(m.chat, { 
      sticker: await sticker.toBuffer() 
    }, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply('Gagal membuat sticker video')
  }
}

handler.help = ['bratv <teks>']
handler.tags = ['sticker']
handler.command = /^bratv$/i

export default handler