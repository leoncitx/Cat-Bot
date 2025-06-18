
let registroFF = {};

const handler = async (msg, { conn}) => {
  const chatId = msg.key.remoteJid;

  const textoInicial = `🔥 *Registro 4vs4 - Free Fire* 🔥

❤️ Reacciona para jugar como *Titular*
👍🏻 Reacciona para ser *Suplente*

Los primeros 4 con ❤️ serán los titulares.`;

  const mensaje = await conn.sendMessage(chatId, { text: textoInicial}, { quoted: msg});

  const mensajeId = mensaje.key.id;
  registroFF[mensajeId] = { titulares: [], suplentes: [], key: mensaje.key};

  conn.ev.on("messages.reaction", async reaction => {
    if (!reaction.key || reaction.key.id!== mensajeId) return;

    const participante = reaction.sender || reaction.participant;
    const usuario = participante.split("@")[0];
    const emoji = reaction.reaction;

    const registro = registroFF[mensajeId];
    if (!registro) return;

    // Evitar duplicados en listas
    registro.titulares = registro.titulares.filter(p => p!== participante);
    registro.suplentes = registro.suplentes.filter(p => p!== participante);

    // Agregar jugadores según reacción
    if (emoji === "❤️" && registro.titulares.length < 4) {
      registro.titulares.push(participante);
} else if (emoji === "👍🏻") {
      registro.suplentes.push(participante);
}

    // Generar lista actualizada
    const listaTitulares = registro.titulares.map((u, i) => `*${i + 1}.* @${u.split("@")[0]}`).join("\n") || "_Vacante_";
    const listaSuplentes = registro.suplentes.map((u, i) => `*${i + 1}.* @${u.split("@")[0]}`).join("\n") || "_Nadie aún_";

    const textoActualizado = `🔥 *Registro 4vs4 - Free Fire* 🔥

❤️ Reacciona para jugar como *Titular*
👍🏻 Reacciona para ser *Suplente*

🎯 *Titulares:*
${listaTitulares}

🪑 *Suplentes:*
${listaSuplentes}`;

    await conn.sendMessage(chatId, {
      text: textoActualizado,
      edit: registro.key, // Editar el mismo mensaje si es posible
      mentions: [...registro.titulares,...registro.suplentes]
});
});
};

handler.command = ["4vs4"];
handler.tags = ["juegos"];
handler.help = ["4vs4"];
module.exports = handler;
