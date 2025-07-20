const handler = async (m, {conn, isAdmin, isOwner, args, usedPrefix, command}) => {
  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
}

  const isClose = {
    'open': 'not_announcement',
    'close': 'announcement',
    'on': 'not_announcement',
    'off': 'announcement',
    '1': 'not_announcement',
    '0': 'announcement',
    'buka': 'not_announcement',
    'tutup': 'announcement'
}[(args[0] || '').toLowerCase()];

  if (isClose === undefined) {
    const caption = `
📌 *Ejemplos de uso:*
*${usedPrefix + command} close 1 día 8 horas 20 segundos*
*${usedPrefix + command} open 2 horas 30 minutos*

🕒 Puedes usar: días, horas, minutos y segundos.
    `.trim();
    m.reply(caption);
    throw false;
}

  const tiempoMs = parseTiempo(args.slice(1).join(" "));
  if (!tiempoMs) {
    m.reply("⏱️ Indica el tiempo correctamente. Ejemplo: `1 día 2 horas 15 minutos 10 segundos`");
    throw false;
}

  await conn.groupSettingUpdate(m.chat, isClose).then(async () => {
    m.reply(`⚠️ El grupo ha sido *${isClose == 'announcement'? 'cerrado': 'abierto'}* por *${clockString(tiempoMs)}*`);
});

  setTimeout(async () => {
    const nuevoEstado = isClose == 'announcement'? 'not_announcement': 'announcement';
    await conn.groupSettingUpdate(m.chat, nuevoEstado);
    conn.reply(m.chat, `${nuevoEstado == 'announcement'
? '*✅ El grupo se ha abierto, ¡ahora todos pueden enviar mensajes!*'
: '*🔒 El grupo ha sido cerrado, ¡solo administradores pueden hablar!*'}`);
}, tiempoMs);
};

function parseTiempo(texto) {
  const dias = (/(\d+)\s*d[ií]a[s]?/.exec(texto) || [])[1] || 0;
  const horas = (/(\d+)\s*h[oó]ra[s]?/.exec(texto) || [])[1] || 0;
  const minutos = (/(\d+)\s*m[inuto]*[s]?/.exec(texto) || [])[1] || 0;
  const segundos = (/(\d+)\s*s[eé]gundo[s]?/.exec(texto) || [])[1] || 0;

  const ms =
    (Number(dias) * 86400000) +
    (Number(horas) * 3600000) +
    (Number(minutos) * 60000) +
    (Number(segundos) * 1000);

  return ms || null;
}

function clockString(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor(ms / 3600000) % 24;
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  const partes = [];
  if (d) partes.push(`${d}d`);
  if (h) partes.push(`${h}h`);
  if (m) partes.push(`${m}m`);
  if (s) partes.push(`${s}s`);
  return partes.join(' ');
}

handler.help = ['gctime <open/close> <tiempo>'];
handler.tags = ['group'];
handler.command = /^(gctime)$/i;
handler.botAdmin = true;
handler.group = true;

export default handler;