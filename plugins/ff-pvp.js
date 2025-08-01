import { proto} from '@whiskeysockets/baileys';

const salas = new Map();
let contador = 1;

const reglas = `
📋 *REGLAS GENERALES PVP*
1️⃣ Sin doble vector
2️⃣ Sin lanzapapas
3️⃣ Sin curas
4️⃣ Sin granadas/minas
5️⃣ Sin emulador/hacks
6️⃣ Solo M10/MP40 y Desert
7️⃣ Respeto obligatorio
`;

async function crearSala(m, { conn, args, command}) {
  const input = args[0]?.toLowerCase();
  const match = /^(\d+)vs(\d+)$/.exec(input);
  const chatId = m.chat;

  if (!match) {
    return m.reply('❌ Formato inválido. Ej: *pvp 4vs4*');
}

  if (salas.has(chatId)) {
    return m.reply('⚠️ Ya existe una sala activa.');
}

  const total = parseInt(match[1]) + parseInt(match[2]);
  const salaId = `Sala #${contador++} - ${input.toUpperCase()}`;
  const creador = m.sender;

  const msg = await conn.sendMessage(chatId, {
    text: `🎮 *${salaId}*\n👤 Creador: @${creador.split('@')[0]}\n${reglas}\n👥 Jugadores (0/${total})\n_Reacciona con 👍 para unirte_`,
    mentions: [creador],
});

  salas.set(chatId, {
    id: salaId,
    jugadores: [],
    creador,
    total,
    msgId: msg.key.id,
});
}

async function cancelarSala(m, { conn}) {
  const sala = salas.get(m.chat);
  if (!sala) return m.reply('❌ No hay ninguna sala activa.');
  if (m.sender!== sala.creador) return m.reply('❌ Solo el creador puede cancelarla.');

  salas.delete(m.chat);
  return conn.sendMessage(m.chat, {
    text: `❌ *${sala.id} ha sido cancelada.*`,
    mentions: [m.sender],
});
}

export const reactionListener = async (reaction, { conn}) => {
  const sala = [...salas.values()].find(s => s.msgId === reaction.key.id);
  if (!sala || reaction.reaction!== '👍') return;

  if (!sala.jugadores.includes(reaction.sender)) {
    sala.jugadores.push(reaction.sender);
}

  const nombres = await Promise.all(
    sala.jugadores.map(u => conn.getName(u).catch(() => '@' + u.split('@')[0]))
);

  const lista = nombres.map((n, i) => `*${i + 1}.* ${n}`).join('\n');
  const texto = `🎮 *${sala.id}*\n👤 Creador: @${sala.creador.split('@')[0]}\n${reglas}\n👥 Jugadores (${sala.jugadores.length}/${sala.total})\n${lista}\n\n_Reacciona con 👍 para unirte_`;

  await conn.sendMessage(reaction.chat, {
    edit: { remoteJid: reaction.chat, id: sala.msgId},
    text: texto,
    mentions: sala.jugadores,
});

  if (sala.jugadores.length>= sala.total) {
    // repartir equipos y cerrar sala
    salas.delete(reaction.chat);
}
};

const handler = async (m, ctx) => {
  const cmd = ctx.command.toLowerCase();
  if (cmd === 'pvp') await crearSala(m, ctx);
  else if (cmd === 'cancelarsala') await cancelarSala(m, ctx);
};

handler.help = ['pvp <4vs4>', 'cancelarsala'];
handler.tags = ['ff'];
handler.command = /^pvp$|^cancelarsala$/i;

export default handler;