
let registroFF = {}

const handler = async (m, { conn, args, command, usedPrefix}) => {
  if (!args[0]) {
    const textoInicial = `🔥 *8 𝐕𝐄𝐑𝐒𝐔𝐒 8 - Registro Automático* 🔥

⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎:
🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎:
🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀:

➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃:
➥ 𝐉𝐔𝐆𝐀𝐃𝐎𝐑𝐄𝐒:

🎯 *Reacciona para registrarte:*
❤️ Titular ┃ 👍🏻 Suplente`;

    const mensaje = await conn.sendMessage(m.chat, { text: textoInicial}, { quoted: m});
    const mensajeId = mensaje.key.id;

    registroFF[mensajeId] = {
      titulares: [],
      suplentes: [],
      key: mensaje.key
};

    conn.ev.on("messages.reaction", async reaction => {
      if (!reaction.key || reaction.key.id!== mensajeId) return;

      const participante = reaction.sender || reaction.participant;
      const emoji = reaction.reaction;

      const registro = registroFF[mensajeId];
      if (!registro) return;

      // Elimina de ambas listas
      registro.titulares = registro.titulares.filter(u => u!== participante);
      registro.suplentes = registro.suplentes.filter(u => u!== participante);

      if (emoji === "❤️" && registro.titulares.length < 8) {
        registro.titulares.push(participante);
} else if (emoji === "👍🏻") {
        registro.suplentes.push(participante);
}

      const escuadra1 = registro.titulares.slice(0, 4).map((u, i) => `${i === 0? "👑": "🥷🏻"} ┇ @${u.split("@")[0]}`).join("\n") || "_Vacío_";
      const escuadra2 = registro.titulares.slice(4, 8).map((u, i) => `${i === 0? "👑": "🥷🏻"} ┇ @${u.split("@")[0]}`).join("\n") || "_Vacío_";
      const suplentes = registro.suplentes.map((u, i) => `🥷🏻 ┇ @${u.split("@")[0]}`).join("\n") || "_Nadie aún_";

      const textoActualizado = `🔥 *8 𝐕𝐄𝐑𝐒𝐔𝐒 8 - Registro Automático* 🔥

🎯 *Titulares registrados con ❤️*
*𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 1*
${escuadra1}

*𝐄𝐒𝐂𝐔𝐀𝐃𝐑𝐀 2*
${escuadra2}

🪑 *𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄𝐒 (👍🏻):*
${suplentes}`;

      await conn.sendMessage(m.chat, {
        text: textoActualizado,
        edit: registro.key,
        mentions: [...registro.titulares,...registro.suplentes]
});
});

    return;
}
};

handler.help = ["8vs8"];
handler.tags = ["freefire"];
handler.command = /^(vs8|8vs8|masc8)$/i;
handler.group = true;
handler.admin = true;

export default handler;