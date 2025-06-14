
const handler = async (m, { isOwner, isAdmin, conn, text, participants, args}) => {
  let chat = global.db.data.chats[m.chat];
  let emoji = chat.emojiTag || '🔥';

  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
}

  const pesan = args.join` ` || "¡Atención, equipo! 🚨";
  const groupMetadata = await conn.groupMetadata(m.chat);
  const groupName = groupMetadata.subject;

  // Definir banderas por prefijo de número 📍
  const countryFlags = {
    '52': '🇲🇽', '57': '🇨🇴', '54': '🇦🇷', '34': '🇪🇸', '55': '🇧🇷', '1': '🇺🇸',
    '44': '🇬🇧', '91': '🇮🇳', '502': '🇬🇹', '56': '🇨🇱', '51': '🇵🇪', '58': '🇻🇪',
    '505': '🇳🇮', '593': '🇪🇨', '504': '🇭🇳', '591': '🇧🇴', '53': '🇨🇺', '503': '🇸🇻',
    '507': '🇵🇦', '595': '🇵🇾'
};

  // Función para obtener la bandera del país 🌍
  const getCountryFlag = (id) => {
    const phoneNumber = id.split('@')[0];
    let phonePrefix = phoneNumber.slice(0, 3);
    if (phoneNumber.startsWith('1')) return '🇺🇸'; // Excepción para EE.UU.
    if (!countryFlags[phonePrefix]) phonePrefix = phoneNumber.slice(0, 2);
    return countryFlags[phonePrefix] || '🏳️'; // Bandera neutral si no está en la lista
};

  let teks = `🎉 *${groupName}*\n\n👥 *Integrantes: ${participants.length}*\n${pesan}\n\n📢 *Lista de miembros:*\n`;

  for (const mem of participants) {
    teks += `${emoji} ${getCountryFlag(mem.id)} @${mem.id.split('@')[0]}\n`;
}

  teks += `\n🚀 *¡Barboza MD siempre activo!* 🔥`;

  await conn.sendMessage(m.chat, { text: teks, mentions: participants.map((a) => a.id)});
};

handler.help = ['todos'];
handler.tags = ['group'];
handler.command = /^(tagall|invocar|marcar|todos|invocación)$/i;
handler.admin = true;
handler.group = true;

export default handler;