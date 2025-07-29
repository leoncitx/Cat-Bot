import fetch from "node-fetch";
import axios from 'axios';

const handler = async (m, { isOwner, isAdmin, conn, text, participants, args}) => {
  const chat = global.db.data.chats[m.chat] || {};
  const emoji = chat.emojiTag || '🤖';

  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw new Error('No tienes permisos para usar este comando.');
}

  const customMessage = args.join(' ');
  const groupMetadata = await conn.groupMetadata(m.chat);
  const groupName = groupMetadata.subject;

  const textOptions = [
    "𝙀𝙩𝙞𝙦𝙪𝙚𝙩𝙖 𝙂𝙚𝙣𝙚𝙧𝙖𝙡 𝙓 𝙂𝙚𝙣𝙚𝙨𝙞𝙨",
    "𝙈𝙚𝙣𝙘𝙞𝙤𝙣 𝙂𝙚𝙣𝙚𝙧𝙖𝙡",
    "𝙀𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙣𝙙𝙤 𝙖 𝙡𝙤𝙨 𝙉𝙋𝘾"
  ];
  const imgOptions = [
    "https://iili.io/FKVDVAN.jpg",
    "https://iili.io/FKVbUrJ.jpg"
  ];

  const msjRandom = textOptions[Math.floor(Math.random() * textOptions.length)];
  const img = imgOptions[Math.floor(Math.random() * imgOptions.length)];

  const thumb = Buffer.from(
    (await axios.get(img, { responseType: 'arraybuffer'})).data
);

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
};

  let messageText = `*${groupName}*\n\n*Integrantes: ${participants.length}*\n${customMessage}\n┌──⭓ *Despierten*\n`;
  for (const mem of participants) {
    messageText += `${emoji} @${mem.id.split('@')[0]}\n`;
}
  messageText += `└───────⭓\n\n𝘚𝘶𝘱𝘦𝘳 𝘉𝘰𝘵 𝘞𝘩𝘢𝘵𝘴𝘈𝘱𝘱 🚩`;

  const audioUrl = 'https://cdn.russellxz.click/a8f5df5a.mp3';

  await conn.sendMessage(m.chat, {
    image: { url: img},
    caption: messageText,
    mentions: participants.map(a => a.id)
}, { quoted: izumi});

  await conn.sendMessage(m.chat, {
    audio: { url: audioUrl},
    mimetype: 'audio/mp4',
    ptt: true
}, { quoted: izumi});
};

handler.help = ['todos'];
handler.tags = ['group'];
handler.command = /^(tagall|invocar|marcar|todos|invocación)$/i;
handler.admin = false;
handler.group = true;

export default handler;