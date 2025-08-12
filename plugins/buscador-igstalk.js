import axios from 'axios'
 
const Mollygram = async (username) => {
  const { data } = await axios.get(`https://media.mollygram.com/?url=${encodeURIComponent(username)}`, {
    headers: {
      'accept': '*/*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'origin': 'https://mollygram.com',
      'referer': 'https://mollygram.com/',
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
    }
  })
  const html = data.html
  const getMatch = (regex) => html.match(regex)?.[1]?.trim() || null
 
  const profilePic = getMatch(/<img[^>]*class="[^"]*rounded-circle[^"]*"[^>]*src="([^"]+)"/i) || getMatch(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*rounded-circle[^"]*"/i)
  
  return {
    username: getMatch(/<h4 class="mb-0">([^<]+)<\/h4>/),
    fullname: getMatch(/<p class="text-muted">([^<]+)<\/p>/),
    bio: getMatch(/<p class="text-dark"[^>]*>([^<]+)<\/p>/),
    profilePic,
    posts: getMatch(/<div[^>]*>\s*<span class="d-block h5 mb-0">([^<]+)<\/span>\s*<div[^>]*>posts<\/div>/i),
    followers: getMatch(/<div[^>]*>\s*<span class="d-block h5 mb-0">([^<]+)<\/span>\s*<div[^>]*>followers<\/div>/i),
    following: getMatch(/<div[^>]*>\s*<span class="d-block h5 mb-0">([^<]+)<\/span>\s*<div[^>]*>following<\/div>/i)
  }
}
 
let handler = async (m, { conn, args }) => {
  if (!args[0]) throw '*Example :* .igstalk mycyll.7'
  
  const yatta = await Mollygram(args[0])
  
  const text = `*Username :* ${yatta.username}\n*Full name :* ${yatta.fullname}\n*Bio :* ${yatta.bio}\n*Posts :* ${yatta.posts}\n*Follower :* ${yatta.followers}\n*Follow :* ${yatta.following}`
  
  if (yatta.profilePic) {
    await conn.sendMessage(m.chat, { image: { url: yatta.profilePic }, caption: text }, { quoted: m })
  } else {
    await m.reply(text)
  }
}
 
handler.help = ['igstalk']
handler.command = ['igstalk']
handler.tags = ['tools']
 
export default handler