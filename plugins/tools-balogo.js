/* CODIGO 100% CREADO POR IZUMI CORE
• CODIGO PARA MODIFICAR LA IMAGEN DE PERFIL DE LA CUENTA DONDE ESTA EL BOT
• NO CAMBIES LOS CRÉDITOS
• https://whatsapp.com/channel/0029VaJxgcB0bIdvuOwKTM2Y
*/
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  const quoted = m.quoted && m.quoted.message && m.quoted.message.imageMessage
  const direct = m.message && m.message.imageMessage
  if (!quoted && !direct) 
    return m.reply('➤ \`ACCION MAL USADA\` ❗\n\n> 𝖲𝗂𝗀𝗎𝖾 𝖾𝗌𝗍𝗈𝗌 𝗉𝖺𝗌𝗈𝗌: 𝖤𝗇𝗏𝗂𝖺 𝗅𝖺 𝗂𝗆𝖺𝗀𝖾𝗇 𝗆𝖺𝗌 𝖾𝗅 𝖼𝗈𝗆𝖺𝗇𝖽𝗈 𝗈 𝗃𝗎𝗇𝗍𝗈 𝖼𝗈𝗇 𝖾𝗅 𝖼𝗈𝗆𝖺𝗇𝖽𝗈, 𝖭𝗈 𝖿𝗎𝗇𝖼𝗂𝗈𝗇𝖺 𝗋𝖾𝗌𝗉𝗈𝗇𝖽𝗂𝖾𝗇𝖽𝗈 𝖺𝗅𝖺 𝗂𝗆𝖺𝗀𝖾𝗇..\n\n» 𝖤𝗃𝖾𝗆𝗉𝗅𝗈 𝖽𝖾 𝗎𝗌𝗈:\nimage + #setppbot')

const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      locationMessage: {
        name: "FOTO DE PERFIL BOT ✅",
        jpegThumbnail: await (await fetch('https://iili.io/F0WZNEX.th.png')).buffer(),
        vcard:
          "BEGIN:VCARD\n" +
          "VERSION:3.0\n" +
          "N:;Unlimited;;;\n" +
          "FN:Unlimited\n" +
          "ORG:Unlimited\n" +
          "TITLE:\n" +
          "item1.TEL;waid=19709001746:+1 (970) 900-1746\n" +
          "item1.X-ABLabel:Unlimited\n" +
          "X-WA-BIZ-DESCRIPTION:ofc\n" +
          "X-WA-BIZ-NAME:Unlimited\n" +
          "END:VCARD"
      }
    },
    participant: "0@s.whatsapp.net"
  };
  const msg = quoted ? m.quoted : m
  const media = msg.message.imageMessage
  const stream = await downloadContentFromMessage(media, 'image')

  await conn.updateProfilePicture(conn.user.jid, { stream })
  await conn.sendMessage(
    m.chat,
    { text: '➤ `ORDENES RECIBIDAS` ✅\n\n𝖫𝖺 𝗂𝗆𝖺𝗀𝖾𝗇 𝖽𝖾 𝗉𝖾𝗋𝖿𝗂𝗅 𝖽𝖾𝗅 𝖻𝗈𝗍 𝗌𝖾 𝗁𝖺 𝖺𝖼𝗍𝗎𝖺𝗅𝗂𝗓𝖺𝖽𝗈 𝖼𝗈𝗋𝗋𝖾𝖼𝗍𝖺𝗆𝖾𝗇𝗍𝖾.' },
    { quoted: fkontak }
  )
}

handler.tags = ['owner']
handler.help = ['setppbot']
handler.command = ['setppbot','cambiarfotobot']
handler.owner = true

export default handler