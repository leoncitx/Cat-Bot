let handler = async (m, { conn, args, command, usedPrefix }) => {
  const chatId = m.chat;
  global.db = global.db || {};
  global.db.data = global.db.data || { chats: {} };
  global.db.data.chats[chatId] = global.db.data.chats[chatId] || {};
  const chat = global.db.data.chats[chatId];

  if (!m.isGroup) {
    return m.reply(
      `╭─⬣「 *MediaHub* 」⬣
│  ≡◦ 🚫 *¡Error!*
│  ≡◦ Este comando solo funciona en grupos.
╰─⬣
> © MediaHub™`
    );
  }

  if (args[0] === 'on') {
    chat.antiarabes = true;
    return m.reply(
      `╭─⬣「 *MediaHub* 」⬣
│  ≡◦ 🛡️ *Modo Anti-Árabes Activado*
│  ≡◦ Usuarios con números extranjeros serán expulsados.
╰─⬣
> © MediaHub™`
    );
  }

  if (args[0] === 'off') {
    chat.antiarabes = false;
    return m.reply(
      `╭─⬣「 *MediaHub* 」⬣
│  ≡◦ ⚠️ *Modo Anti-Árabes Desactivado*
│  ≡◦ Ya no se filtrarán usuarios por prefijo.
╰─⬣
> © MediaHub™`
    );
  }

  return m.reply(
    `╭─⬣「 *MediaHub* 」⬣
│  ≡◦ 🧩 *Uso Correcto:*
│  ≡◦ ${usedPrefix + command} on
│  ≡◦ ${usedPrefix + command} off
╰─⬣
> © MediaHub™`
  );
};

// 🔒 Filtro que expulsa automáticamente si el número es extranjero
handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner }) {
  if (!m.isGroup) return;
  const chat = global.db?.data?.chats?.[m.chat];
  if (!chat?.antiarabes) return;

  if (isBotAdmin && !isAdmin && !isOwner) {
    const forbiddenPrefixes = [
      "212", // Marruecos
      "265", // Malawi
      "234", // Nigeria
      "258", // Mozambique
      "263", // Zimbabue
      "93",  // Afganistán
      "967", // Yemen
      "92",  // Pakistán
      "254", // Kenia
      "213", // Argelia
      "20",  // Egipto
      "971", // Emiratos Árabes Unidos
      "966", // Arabia Saudita
      "90",  // Turquía
      "98",  // Irán
      "218", // Libia
      "963", // Siria
      "964", // Irak
      "93",  // Afganistán
      "62"   // Indonesia
    ];

    for (let prefix of forbiddenPrefixes) {
      if (m.sender.startsWith(prefix)) {
        await m.reply(
          `╭─⬣「 *MediaHub* 」⬣
│  ≡◦ ❌ *Acceso Restringido*
│  ≡◦ Este grupo es solo para usuarios autorizados.
│  ≡◦ @${m.sender.split("@")[0]} fue expulsado.
╰─⬣
> © MediaHub™`,
          null,
          { mentions: [m.sender] }
        );
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
        return false;
      }
    }
  }
};

handler.help = ['antiarabes [on/off]'];
handler.tags = ['grupos'];
handler.command = ['antiarabes'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;