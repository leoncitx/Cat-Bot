
import axios from 'axios'
import cheerio from 'cheerio'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Masukin usename, contoh : cscstalk ZenzzXD')
  await m.reply('wett')
  try {
    let username = text.trim()
    let result = await cscstalk(username)
    if (!result || !result.profile) return m.reply('gagal mengambil data 😂')

    let txt = `*Profile Codeshare*\n`
    txt += `• Username : ${result.profile.username}\n`
    txt += `• Bio : ${result.profile.bio || '-'}\n`
    txt += `• Followers : ${result.profile.followers}\n`
    txt += `• Following : ${result.profile.following}\n\n`

    if (result.snippets.length) {
      txt += `*Total snippet ${result.snippets.length}*\n`
      result.snippets.forEach((snip, i) => {
        txt += `${i + 1}. ${snip.title} | bahasa : (${snip.language})\n`
        txt += `   ${snip.date} | ${snip.views} views\n`
        txt += `   ${snip.url}\n`
      })
    } else {
      txt += `gaada snippet di akun ini`
    }

    let thumb = result.profile.avatar || result.profile.banner || null
    if (thumb) {
      await conn.sendFile(m.chat, thumb, '_jen.jpg', txt, m)
    } else {
      m.reply(txt)
    }
  } catch (e) {
    m.reply(`Eror kak : ${e.message}`)
  }
}

handler.help = ['cscstalk <username>']
handler.command = ['cscstalk']
handler.tags = ['stalker']

export default handler

async function cscstalk(username) {
  const url = `https://codeshare.cloudku.click/profile?user=${username}`
  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
    }
  })

  const $ = cheerio.load(data)
  const banner = $('#banner-preview').attr('src')
  const avatar = $('#avatar-preview').attr('src')
  const bio = $('.profile-bio').text().trim()
  const followers = $('.profile-stats .stat-item').first().find('strong').text().trim()
  const following = $('.profile-stats .stat-item').last().find('strong').text().trim()

  const snippets = []
  $('.snippets-grid .snippet-card').each((i, el) => {
    const title = $(el).find('h3').text().trim()
    const date = $(el).find('.snippet-meta time').text().trim()
    const lang = $(el).find('.lang-tag').text().trim()
    const views = $(el).find('.card-stats span').text().trim()
    const link = $(el).find('a').attr('href')
    snippets.push({
      title,
      date,
      language: lang,
      views: parseInt(views || '0'),
      url: link ? (link.startsWith('http') ? link : `https://codeshare.cloudku.click/${link}`) : null
    })
  })

  return {
    profile: {
      username,
      banner: banner ? (banner.startsWith('http') ? banner : `https://codeshare.cloudku.click/${banner}`) : null,
      avatar: avatar ? (avatar.startsWith('http') ? avatar : `https://codeshare.cloudku.click/${avatar}`) : null,
      bio,
      followers: parseInt(followers || '0'),
      following: parseInt(following || '0')
    },
    snippets
  }
}