import { proto } from '@whiskeysockets/baileys';

const salas = {};
let contadorSalas = 1;

const reglasPvP = `📋 *REGLAS GENERALES PVP*
1. Sin doble vector ❌
2. Sin lanzapapas 🧨
3. Sin curas ⚕️
4. No granadas ni minas 💣
5. No emulador ni hacks 💻
6. Solo M10/MP40 y Desert 🧨
7. Respeto obligatorio 🤝
`;

const handler = async (m, { conn, command, args, usedPrefix }) => {
  const chatId = m.chat;

  if (command === 'cancelarsala') {
    const sala = salas[chatId];
    if (!sala) return m.reply('❌ No hay ninguna sala activa en este chat.');
    if (m.sender !== sala.creador) return m.reply('❌ Solo el creador de la sala puede cancelarla.');
    delete salas[chatId];
    return await conn.sendMessage(chatId, {
      text: `❌ *${sala.id} fue cancelada por el creador*\n\nGracias por participar.`,
      mentions: [m.sender],
    });
  }

  const input = args[0];
  const match = input?.toLowerCase().match(/^(\d+)vs(\d+)$/);

  if (!match) {
    return m.reply(`❌ Formato incorrecto.\nUsa: *${usedPrefix + command} 4vs4* o *${usedPrefix + command} 10vs10*`);
  }

  const num1 = parseInt(match[1]);
  const num2 = parseInt(match[2]);
  const total = num1 + num2;

  if (total < 2) return m.reply(`❌ Número total muy bajo. Mínimo deben ser 2 jugadores.`);

  if (salas[chatId]) return m.reply('⚠️ Ya hay una sala activa en este chat.');

  const nombreSala = `Sala #${contadorSalas++} - ${input.toUpperCase()}`;
  const creador = m.sender;

  const mensaje = await conn.sendMessage(chatId, {
    text: `🎮 *${nombreSala}*\n👤 *Creada por:* @${creador.split('@')[0]}\n\n${reglasPvP}\n👥 *Jugadores (0/${total})*\n_Reacciona con 👍 para unirte_`,
    mentions: [creador],
  });

  salas[chatId] = {
    id: nombreSala,
    tipo: input,
    jugadores: [],
    creador,
    mensajeID: mensaje.key.id,
    total,
    chatId: chatId
  };
};

// **Nuevo listener para las reacciones**
export const reactionListener = async (reaction, { conn }) => {
  const chatId = reaction.chat;
  const sala = Object.values(salas).find(s => s.mensajeID === reaction.key.id);

  if (!sala || reaction.reaction !== '👍' || sala.chatId !== chatId) return;

  const jugador = reaction.sender;
  if (sala.jugadores.includes(jugador)) return;

  sala.jugadores.push(jugador);

  const nombres = await Promise.all(
    sala.jugadores.map(u => conn.getName(u).catch(() => '@' + u.split('@')[0]))
  );

  const lista = nombres.map((n, i) => `*${i + 1}.* ${n}`).join('\n');
  const texto = `🎮 *${sala.id}*\n👤 *Creada por:* @${sala.creador.split('@')[0]}\n\n${reglasPvP}\n👥 *Jugadores (${sala.jugadores.length}/${sala.total})*\n${lista}\n\n_Reacciona con 👍 para unirte_`;

  await conn.sendMessage(chatId, {
    edit: {
      remoteJid: chatId,
      id: sala.mensajeID,
    },
    text: texto,
    mentions: sala.jugadores,
  });

  if (sala.jugadores.length >= sala.total) {
    const mitad = Math.floor(sala.total / 2);
    const mezclado = sala.jugadores.sort(() => Math.random() - 0.5);
    const rojo = mezclado.slice(0, mitad);
    const azul = mezclado.slice(mitad);

    const nombresRojo = await Promise.all(rojo.map(u => conn.getName(u).catch(() => '@' + u.split('@')[0])));
    const nombresAzul = await Promise.all(azul.map(u => conn.getName(u).catch(() => '@' + u.split('@')[0])));

    const listaRojo = nombresRojo.map(n => `@${n.split('@')[0]}`).join('\n');
    const listaAzul = nombresAzul.map(n => `@${n.split('@')[0]}`).join('\n');

    await conn.sendMessage(chatId, {
      text: `✅ *${sala.id} COMPLETA*\n\n🔴 *Equipo Rojo:*\n${listaRojo}\n\n════════════════════\n\n🔵 *Equipo Azul:*\n${listaAzul}`,
      mentions: [...rojo, ...azul],
    });

    delete salas[chatId];
  }
};

handler.help = ['pvp <4vs4|10vs10|100vs100>', 'cancelarsala'];
handler.tags = ['ff'];
handler.command = /^pvp$|^cancelarsala$/i;

export default handler;
