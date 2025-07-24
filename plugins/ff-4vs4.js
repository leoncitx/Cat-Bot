const jugadores = new Map()
const escuadra = []
const suplentes = []
const maxJugadores = 4
const maxSuplentes = 2
let mensajeTorneo = null
let chatId = null
let handlerRegistrado = false

function render() {
  return `
🧨 *TORNEO 4 VS 4* ⚔️
──────────────────────────

🕓 *HORARIOS DISPONIBLES*
🇲🇽 México: --
🇨🇴 Colombia: --

🎮 *MODALIDAD:* Clásico / PvP

🎯 *JUGADORES TITULARES*

👑 ${escuadra[0] || '—'}
🥷 ${escuadra[1] || '—'}
🥷 ${escuadra[2] || '—'}
🥷 ${escuadra[3] || '—'}

💤 *SUPLENTES*

🔁 ${suplentes[0] || '—'}
🔁 ${suplentes[1] || '—'}

──────────────────────────
📝 Reacciona con 👍 para jugar
📝 Reacciona con ❤️ para ser suplente
`.trim()
}

async function manejarReaccion(reactionData, conn) {
  if (!mensajeTorneo || !mensajeTorneo.key || !mensajeTorneo.key.id || !mensajeTorneo.key.remoteJid) {
    return;
  }

  const { key, message } = reactionData;

  if (key.id !== mensajeTorneo.key.id || key.remoteJid !== mensajeTorneo.key.remoteJid) {
    return;
  }

  const reaction = message?.reaction?.text;
  const userId = key.participant;
  
  let name = userId;
  try {
    const metadata = await conn.groupMetadata(chatId);
    name = metadata.participants.find(p => p.id === userId)?.name || userId;
  } catch (error) {
    console.error("Error al obtener metadatos del grupo:", error);
  }

  let cambiosRealizados = false;

  if (jugadores.has(userId)) {
      const rolActual = jugadores.get(userId);
      if (reaction === '👍' && rolActual === 'titular') return;
      if (reaction === '❤️' && rolActual === 'suplente') return;

      if (rolActual === 'titular') {
          const index = escuadra.indexOf(name);
          if (index > -1) escuadra.splice(index, 1);
      } else if (rolActual === 'suplente') {
          const index = suplentes.indexOf(name);
          if (index > -1) suplentes.splice(index, 1);
      }
      jugadores.delete(userId);
  }

  if (reaction === '👍') {
    if (escuadra.length < maxJugadores) {
      escuadra.push(name);
      jugadores.set(userId, 'titular');
      cambiosRealizados = true;
    }
  }

  if (reaction === '❤️') {
    if (suplentes.length < maxSuplentes) {
      suplentes.push(name);
      jugadores.set(userId, 'suplente');
      cambiosRealizados = true;
    }
  }

  if (cambiosRealizados) {
    await conn.sendMessage(chatId, { text: render() }, { edit: mensajeTorneo.key });
  }
}

let handler = async (m, { conn }) => {
  chatId = m.chat;

  if (mensajeTorneo) {
      try {
          await conn.sendMessage(chatId, { delete: mensajeTorneo.key });
      } catch (e) {
          console.error("Error al eliminar el mensaje anterior del torneo:", e);
      }
      escuadra.length = 0;
      suplentes.length = 0;
      jugadores.clear();
  }

  const msg = await conn.sendMessage(chatId, { text: render() }, { quoted: m });
  mensajeTorneo = msg;

  if (!handlerRegistrado) {
    conn.ev.on('messages.reaction', async (data) => {
      await manejarReaccion(data, conn);
    });
    handlerRegistrado = true;
  }
};

handler.help = ['4vs4'];
handler.tags = ['game'];
handler.command = /^(4vs4|vs4)$/i;
handler.group = true;

export default handler;
