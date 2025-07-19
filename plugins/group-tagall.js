const fkontak = {
  key: {
    participants: "0@s.whatsapp.net",
    remoteJid: "status@broadcast",
    fromMe: false,
    id: "Halo"
  },
  message: {
    contactMessage: {
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${conn.user.jid.split('@')[0]}:${conn.user.jid.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
    }
  },
  participant: "0@s.whatsapp.net"
};

const handler = async (m, { isOwner, isAdmin, conn, text, participants, args }) => {
  const chat = global.db.data.chats[m.chat];
  const emoji = chat.emojiTag || '🤖';

  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }

  const mensajePersonalizado = args.join(' ');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const groupName = groupMetadata.subject;

  const countryFlags = {
    '52': '🇲🇽', '57': '🇨🇴', '54': '🇦🇷', '34': '🇪🇸', '55': '🇧🇷', '1': '🇺🇸', '44': '🇬🇧', '91': '🇮🇳',
    '502': '🇬🇹', '56': '🇨🇱', '51': '🇵🇪', '58': '🇻🇪', '505': '🇳🇮', '593': '🇪🇨', '504': '🇭🇳',
    '591': '🇧🇴', '53': '🇨🇺', '503': '🇸🇻', '507': '🇵🇦', '595': '🇵🇾'
  };

  const getCountryFlag = (id) => {
    const phoneNumber = id.split('@')[0];
    let phonePrefix = phoneNumber.slice(0, 3);

    if (phoneNumber.startsWith('1')) return '🇺🇸';

    if (!countryFlags[phonePrefix]) {
      phonePrefix = phoneNumber.slice(0, 2);
    }
    
    return countryFlags[phonePrefix] || '🏳️‍🌈';
  };

  let textoMensaje = `*${groupName}*\n\n*Integrantes: ${participants.length}*\n${mensajePersonalizado}\n┌──⭓ *Despierten*\n`;
  for (const mem of participants) {
    textoMensaje += `${emoji} ${getCountryFlag(mem.id)} @${mem.id.split('@')[0]}\n`;
  }
  textoMensaje += `└───────⭓\n\n𝘚𝘶𝘱𝘦𝘳 𝘉𝘰𝘵 𝘞𝘩𝘢𝘵𝘴𝘈𝘱𝘱 🚩`;

  const imageUrl = 'https://files.catbox.moe/1j784p.jpg';

  await conn.sendMessage(m.chat, { 
    image: { url: imageUrl }, 
    caption: textoMensaje, 
    mentions: participants.map((a) => a.id) 
  });
};

handler.help = ['todos'];
handler.tags = ['group'];
handler.command = /^(tagall|invocar|marcar|todos|invocación)$/i;
handler.admin = true;
handler.group = true;

export default handler;
