
import fg from 'api-dylux'
import fetch from 'node-fetch'
import axios from 'axios'

let handler = async (m, { conn, args, command, usedPrefix}) => {
  if (!args[0]) throw `
*6 𝐕𝐄𝐑𝐒𝐔𝐒 6*

⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎
🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎:
🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀:

➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃:
➥ 𝐉𝐔𝐆𝐀𝐃𝐎𝐑𝐄𝐒:

      𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 1

    👑 ┇
    🥷🏻 ┇
    🥷🏻 ┇
    🥷🏻 ┇
    🥷🏻 ┇
    🥷🏻 ┇

    ㅤʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄𝐒:
    🥷🏻 ┇
    🥷🏻 ┇
`

  // Mensaje dinámico tipo fkontak (izumi)
  const textOptions = [
    "𝙀𝙩𝙞𝙦𝙪𝙚𝙩𝙖 𝙂𝙚𝙣𝙚𝙧𝙖𝙡 𝙓 𝙂𝙚𝙣𝙚𝙨𝙞𝙨",
    "𝙈𝙚𝙣𝙘𝙞𝙤𝙣 𝙂𝙚𝙣𝙚𝙧𝙖𝙡",
    "𝙀𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙣𝙙𝙤 𝙖 𝙡𝙤𝙨 𝙉𝙋𝘾"
  ]
  const imgOptions = [
    "https://iili.io/FKVDVAN.jpg",
    "https://iili.io/FKVbUrJ.jpg"
  ]

  const msjRandom = textOptions[Math.floor(Math.random() * textOptions.length)]
  const img = imgOptions[Math.floor(Math.random() * imgOptions.length)]
  const thumb = Buffer.from((await axios.get(img, { responseType: 'arraybuffer'})).data)

  const izumi = {
    key: { participants: "0@s.whatsapp.net", fromMe: false, id: "Halo"},
    message: {
      locationMessage: {
        name: msjRandom,
        jpegThumbnail: thumb,
        vcard:
          "BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\n" +
          "item1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\n" +
          "X-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD"
}
},
    participant: "0@s.whatsapp.net"
}

  await conn.sendMessage(m.chat, {
    image: { url: 'https://cdn.russellxz.click/16b3faeb.jpeg'},
    caption: `*6 𝐕𝐒 6*\n\n⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎\n🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎: ${args[0]}\n🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀: ${args[0]}\n\n➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃:\n➥ 𝐉𝐔𝐆𝐀𝐃𝐎𝐑𝐄𝐒:\n\n👑 ┇ \n🥷🏻 ┇\n🥷🏻 ┇\n🥷🏻 ┇\n🥷🏻 ┇\n🥷🏻 ┇\n\nʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄𝐒:\n🥷🏻 ┇\n🥷🏻 ┇`,
    mentions: []
}, { quoted: izumi})
}

handler.help = ['6vs6']
handler.tags = ['freefire']
handler.command = /^(vs6|6vs6|masc6)$/i
handler.group = true
handler.admin = true

export default handler