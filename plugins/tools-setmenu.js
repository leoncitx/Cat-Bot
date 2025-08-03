import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import readline from 'readline'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text.includes('|')) return m.reply(`Gunakan : .sonu judul | lirik lagu | mood | genre | gender`)
    let [title, lyrics, mood, genre, gender] = text.split('|').map(v => v.trim())

    if (!title) return m.reply('Judul lagunya kagak boleh kosong bree 😂')
    if (!lyrics) return m.reply('Lirik lagunya mana? Mau generate lagu kan? Yaa mana liriknya 😂')
    if (lyrics.length > 1500) return m.reply('Lirik lagu kagak boleh lebih dari 1500 karakter yak bree 🗿')

    m.reply('waitt')

    const deviceId = uuidv4()
    const userHeaders = {
      'user-agent': 'NB Android/1.0.0',
      'content-type': 'application/json',
      'accept': 'application/json',
      'x-platform': 'android',
      'x-app-version': '1.0.0',
      'x-country': 'ID',
      'accept-language': 'id-ID',
      'x-client-timezone': 'Asia/Jakarta',
    }

    const msgId = uuidv4()
    const time = Date.now().toString()

    const registerHeaders = {
      ...userHeaders,
      'x-device-id': deviceId,
      'x-request-id': msgId,
      'x-message-id': msgId,
      'x-request-time': time
    }

    const fcmToken = 'eqnTqlxMTSKQL5NQz6r5aP:APA91bHa3CvL5Nlcqx2yzqTDAeqxm_L_vIYxXqehkgmTsCXrV29eAak6_jqXv5v1mQrdw4BGMLXl_BFNrJ67Em0vmdr3hQPVAYF8kR7RDtTRHQ08F3jLRRI'

    const reg = await axios.put('https://musicai.apihub.today/api/v1/users', {
      deviceId,
      fcmToken
    }, { headers: registerHeaders })

    const userId = reg.data.id

    const createHeaders = {
      ...registerHeaders,
      'x-client-id': userId
    }

    const body = {
      type: 'lyrics',
      name: title,
      lyrics
    }
    if (mood) body.mood = mood
    if (genre) body.genre = genre
    if (gender) body.gender = gender

    const create = await axios.post('https://musicai.apihub.today/api/v1/song/create', body, { headers: createHeaders })
    const songId = create.data.id

    const checkHeaders = {
      ...userHeaders,
      'x-client-id': userId
    }

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    let attempt = 0
    let found = null

    while (true) {
      const check = await axios.get('https://musicai.apihub.today/api/v1/song/user', {
        params: {
          userId,
          isFavorite: false,
          page: 1,
          searchText: ''
        },
        headers: checkHeaders
      })

      found = check.data.datas.find(song => song.id === songId)

      if (!found) {
        rl.close()
        return m.reply("Lagunya belum jadi keknya bree, soalnya kagak ada 😂")
      }

      readline.cursorTo(process.stdout, 0)
      process.stdout.write(`🔄 [${++attempt}] Status: ${found.status} | Proses: ${found.url ? '✅ Done' : '⏳ Loading...'}`)

      if (found.url) {
        rl.close()

        await conn.sendMessage(m.chat, {
          audio: { url: found.url },
          mimetype: 'audio/mpeg',
          fileName: `${found.name}.mp3`,
          ptt: false,
          contextInfo: {
            forwardingScore: 999999,
            isForwarded: true,
            externalAdReply: {
              title: `Suno Music AI`,
              body: `${found.name} | Status : ${found.status}`,
              mediaType: 1,
              previewType: 0,
              renderLargerThumbnail: true,
              thumbnailUrl: found.thumbnail_url,
              sourceUrl: found.url
            }
          }
        }, { quoted: m })

        return
      }

      await delay(3000)
    }

  } catch (e) {
    return m.reply(`Eror kak : ${e?.message || e}`)
  }
}

handler.command = ['sonu']
handler.tags = ['ai']
handler.help = ['sonu <judul | lirik | mood | genre | gender>']
export default handler