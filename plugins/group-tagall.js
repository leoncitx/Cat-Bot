import fetch from "node-fetch";

const handler = async (m, { isOwner, isAdmin, conn, text, participants, args }) => {
  const chat = global.db.data.chats[m.chat] || {};
  const emoji = chat.emojiTag || '🤖';

  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw new Error('You do not have permission to use this command.');
  }

  const customMessage = args.join(' ');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const groupName = groupMetadata.subject;

  const countryFlags = {
    '52': '🇲🇽', '57': '🇨🇴', '54': '🇦🇷', '34': '🇪🇸', '55': '🇧🇷', '1': '🇺🇸', '44': '🇬🇧', '91': '🇮🇳',
    '502': '🇬🇹', '56': '🇨🇱', '51': '🇵🇪', '58': '🇻🇪', '505': '🇳🇮', '593': '🇪🇨', '504': '🇭🇳',
    '591': '🇧🇴', '53': '🇨🇺', '503': '🇸🇻', '507': '🇵🇦', '595': '🇵🇾'
  };

  const getCountryFlag = (id) => {
    const phoneNumber = id.split('@')[0];
    if (phoneNumber.startsWith('1')) return '🇺🇸';
    
    let prefix = phoneNumber.substring(0, 3);
    if (!countryFlags[prefix]) {
      prefix = phoneNumber.substring(0, 2);
    }
    
    return countryFlags[prefix] || '🏳️‍🌈';
  };

  let messageText = `*${groupName}*\n\n*Integrantes: ${participants.length}*\n${customMessage}\n┌──⭓ *Despierten*\n`;
  for (const mem of participants) {
    messageText += `${emoji} ${getCountryFlag(mem.id)} @${mem.id.split('@')[0]}\n`;
  }
  messageText += `└───────⭓\n\n𝘚𝘶𝘱𝘦𝘳 𝘉𝘰𝘵 𝘞𝘩𝘢𝘵𝘴𝘈𝘱𝘱 🚩`;

 const imageUrl = 'https://files.catbox.moe/1j784p.jpg';

  const fkontak = {
    key: {
      remoteJid: m.chat,
      fromMe: false,
      id: m.key.id
    },
    message: {
      contactMessage: {
        displayName: conn.getName(m.sender),
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${conn.getName(m.sender)}\nTEL;type=WA:${m.sender}\nEND:VCARD`
      }
    }
  };

  await conn.sendMessage(m.chat, {
    image: { url: imageUrl },
    caption: messageText,
    mentions: participants.map(a => a.id)
  }, { quoted: fkontak });
};

handler.help = ['todos'];
handler.tags = ['group'];
handler.command = /^(tagall|invocar|marcar|todos|invocación)$/i;
handler.admin = true;
handler.group = true;

export default handler;
