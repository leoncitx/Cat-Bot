const handler = async (m, {conn, isAdmin, isOwner, args, usedPrefix, command}) => {
  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
}

  const isClose = {
    'open': 'not_announcement',
    'buka': 'not_announcement',
    'on': 'not_announcement',
    '1': 'not_announcement',
    'close': 'announcement',
    'tutup': 'announcement',
    'off': 'announcement',
    '0': 'announcement',
}[(args[0] || '')];

  if (isClose === undefined) {
    const caption = `
*• Ejemplo:*
*${usedPrefix + command} open 1 día 8 horas*
*${usedPrefix + command} close 1 día 8 horas*
📌 *𝙴𝙹𝙴𝙼𝙿𝙻𝙾:* *${usedPrefix + command} close 1 día 8 horas*
*👑𝙿𝙰𝚁𝙰 𝚀𝚄𝙴 𝙴𝙻 𝙶𝚁𝚄𝙿𝙾 𝙴𝚂𝚃𝙴 𝙲𝙴𝚁𝚁𝙰𝙳𝙾 𝙿𝙾𝚁 𝚄𝙽 𝚃𝙸𝙴𝙼𝙿𝙾.*
`;
    m.reply(caption);
    throw false;
}

  const tiempoMs = parseTiempo(args.slice(1).join(" "));
  if (!tiempoMs) {
    m.reply("❗ Por favor indica el tiempo correctamente. Ejemplo: `1 día 8 horas`");
    throw false;
}

  await conn.groupSettingUpdate(m.chat, isClose).then(async () => {
    m.reply(`⚠️ *_Grupo ${isClose == 'announcement'? 'cerrado': 'abierto'} por *${clockString(tiempoMs)}_*`);
});

  setTimeout(async () => {
    const nuevoEstado = isClose == 'announcement'? 'not_announcement': 'announcement';
    await conn.groupSettingUpdate(m.chat, nuevoEstado);
    conn.reply(m.chat, `${nuevoEstado == 'announcement'? '*El grupo se ha abierto, ¡ahora todos pueden hablar!*': '*El grupo ha sido cerrado, ¡solo administradores pueden hablar!*'}`);
}, tiempoMs);
};

function parseTiempo(texto) {
  const dias = (/(\d+)\s*d[ií]a[s]?/.exec(texto) || [])[1] || 0;
  const horas = (/(\d+)\s*h[oó]ra[s]?/.exec(texto) || [])[1] || 0;
  const minutos = (/(\d+)\s*m[inuto]*[s]?/.exec(texto) || [])[1] || 0;

  const ms = (Number(dias) * 86400000) + (Number(horas) * 3600000) + (Number(minutos) * 60000);
  return ms || null;
}

function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

handler.help = ['gctime *<open/close>* *<tiempo>*'];
handler.tags = ['group'];
handler.command = /^(gctime)$/i;
handler.botAdmin = true;
handler.group = true;

export default handler;