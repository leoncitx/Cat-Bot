
let jugadoresConfirmados = [];
let suplentes = [];

const handler = async (msg, { conn}) => {
  const chatId = msg.key.remoteJid;

  // Mensaje inicial con instrucciones
  const texto = `🎮 *4 vs 4 | Free Fire*

Reacciona para unirte al equipo:
❤️ — Para jugar (Titulares)
👍🏻 — Para suplente

⏳ Los primeros 4 con ❤️ serán titulares.
`;

  const m = await conn.sendMessage(chatId, { text: texto}, { quoted: msg});

  // Reacciona al propio mensaje para que otros sigan el ejemplo (opcional)
  await conn.sendMessage(chatId, { react: { text: "❤️", key: m.key}});

  // Escucha reacciones por 2 minutos
  const reacciones = conn.ev.on("messages.reaction", async reaction => {
    if (!reaction.key || reaction.key.id!== m.key.id) return;

    const user = reaction.sender || reaction.participant;
    const emoji = reaction.reaction;

    // Titulares
    if (emoji === "❤️") {
      if (!jugadoresConfirmados.includes(user) && jugadoresConfirmados.length < 4) {
        jugadoresConfirmados.push(user);
}
}

    // Suplentes
    if (emoji === "👍🏻") {
      if (!suplentes.includes(user) &&!jugadoresConfirmados.includes(user)) {
        suplentes.push(user);
}
}
});

  // Espera 2 minutos para cerrar lista
  setTimeout(async () => {
    conn.ev.off("messages.reaction", reacciones); // Dejar de escuchar

    let titulares = jugadoresConfirmados.map((u, i) => `*${i + 1}.* @${u.split("@")[0]}`).join("\n");
    let listaSuplente = suplentes.map((u, i) => `*${i + 1}.* @${u.split("@")[0]}`).join("\n");

    const resumen = `✅ *Equipos Confirmados* ✅

🎯 *Titulares:*
${titulares || "_Nadie reaccionó_"}

🪑 *Suplentes:*
${listaSuplente || "_Sin suplentes_"}`;

    await conn.sendMessage(chatId, {
      text: resumen,
      mentions: [...jugadoresConfirmados,...suplentes]
});
}, 120000); // 2 minutos
};

handler.command = ["4vs4"];
handler.tags = ["juegos"];
handler.help = ["4vs4"];
module.exports = handler;