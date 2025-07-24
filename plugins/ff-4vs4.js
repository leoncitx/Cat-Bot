import fg from 'api-dylux'
import fetch from 'node-fetch'
import axios from 'axios'

let handler = async (m, { conn, args, command, usedPrefix}) => {
  if (!args[0]) throw `
𝟒 𝐕𝐄𝐑𝐒𝐔𝐒 𝟒

⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎                       •
🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎:
🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀:

➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃:
➥ 𝐉𝐔𝐆𝐀𝐃𝐎𝐑𝐄𝐒:

      𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 1

    👑 ┇
    🥷🏻 ┇
    🥷🏻 ┇
    🥷🏻 ┇

    ㅤʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄𝐒:
    🥷🏻 ┇
    🥷🏻 ┇
`

  await conn.sendMessage(m.chat, {
    image: { url: 'https://cdn.russellxz.click/16b3faeb.jpeg'},
    caption: `𝟒 𝐕𝐒 𝟒\n\n⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎\n🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎: ${args[0]}\n🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀: ${args[0]}\n\n➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃: \n➥ 𝐉𝐔𝐆𝐀𝐃𝐎𝐑𝐄𝐒:\n\n👑 ┇ \n🥷🏻 ┇  \n🥷🏻 ┇ \n🥷🏻 ┇ \n\nʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄𝐒:\n🥷🏻 ┇ \n🥷🏻 ┇`
}, { quoted: m})
}

handler.help = ['4vs4']
handler.tags = ['freefire']
handler.command = /^(vs4|4vs4|masc4)$/i
handler.group = true

export default handler