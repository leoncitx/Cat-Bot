import { WAMessageStubType } from "@whiskeysockets/baileys";
import fetch from "node-fetch";

export async function before(m, { conn, groupMetadata }) {
  try {
    // Si no es un tipo de mensaje de stub o no es un grupo, salimos.
    if (!m.messageStubType || !m.isGroup) return true;

    // Objeto fkontak para simular un mensaje citado, útil para la apariencia del bot.
    const fkontak = {
      key: {
        participants: "0@s.whatsapp.net",
        remoteJid: "status@broadcast",
        fromMe: false,
        id: "Halo",
      },
      message: {
        contactMessage: {
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${
            conn.user.jid.split("@")[0]
          }:${conn.user.jid.split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
        },
      },
      participant: "0@s.whatsapp.net",
    };

    // Verificamos si el chat tiene la bienvenida activada en la base de datos.
    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat || !chat.bienvenida) return true;

    let userJid;
    // Determinamos el JID del usuario afectado según el tipo de stub de mensaje.
    switch (m.messageStubType) {
      case WAMessageStubType.GROUP_PARTICIPANT_ADD:
      case WAMessageStubType.GROUP_PARTICIPANT_REMOVE:
        userJid = m.messageStubParameters?.[0];
        break;
      case WAMessageStubType.GROUP_PARTICIPANT_LEAVE:
        userJid = m.key.participant;
        break;
      default:
        return true; // Si no es un tipo de evento que nos interese, salimos.
    }

    if (!userJid) return true; // Si no pudimos obtener el JID del usuario, salimos.

    const user = `@${userJid.split("@")[0]}`; // Formateamos el JID para mencionarlo.
    const groupName = groupMetadata.subject; // Obtenemos el nombre del grupo.
    const groupDesc = groupMetadata.desc || "📜 Sin descripción disponible"; // Obtenemos la descripción del grupo.

    // Intentamos obtener la foto de perfil del usuario.
    const ppUrl = await conn
      .profilePictureUrl(userJid, "image")
      .catch(() => null);
    let imgBuffer = null;
    if (ppUrl) {
      try {
        imgBuffer = await fetch(ppUrl).then((res) => res.buffer());
      } catch (e) {
        console.error("❌ Error al descargar la foto de perfil:", e);
      }
    }

    // Si no se pudo obtener la foto de perfil, usamos una imagen de respaldo.
    if (!imgBuffer) {
      try {
        // Asegúrate de reemplazar esta URL con una imagen de respaldo real y accesible
        imgBuffer = await fetch("https://i.ibb.co/L8f30Y0/no-profile-pic.jpg").then(
          (res) => res.buffer()
        );
      } catch (e) {
        console.error("❌ Error al descargar imagen de respaldo:", e);
      }
    }

    // --- Manejo del evento de 'AÑADIR PARTICIPANTE' ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      const welcomeText = `🎉 *¡HOLA ${user}!* 🎉\n\nBienvenido/a a *${groupName}*.\n\n📚 *Sobre nosotros:*\n_${groupDesc}_\n\n🌟 ¡Esperamos que disfrutes tu estancia!`;

      // Enviamos el mensaje de bienvenida con la imagen.
      await conn.sendMessage(
        m.chat,
        {
          image: imgBuffer,
          caption: welcomeText,
          mentions: [userJid],
        },
        { quoted: fkontak }
      );

      // --- Intentamos enviar el audio de bienvenida ---
      try {
        console.log("🔊 Intentando enviar audio de bienvenida...");
        await conn.sendMessage(
          m.chat,
          {
            audio: { url: "https://qu.ax/sjtTL.opus" }, // Asegúrate de que esta URL es correcta y el archivo es un Opus válido.
            mimetype: "audio/ogg", // MIME type para archivos .opus (Ogg Opus)
            ptt: false, // false para enviar como archivo de audio, true para nota de voz
          },
          { quoted: fkontak }
        );
        console.log("✅ Audio de bienvenida enviado (o intento finalizado).");
      } catch (err) {
        console.error("❌ Error al enviar el audio de bienvenida:", err);
        console.error("Detalles del error del audio:", err.stack); // Muestra la traza completa del error
        // Opcional: Podrías enviar un mensaje de texto alternativo si el audio falla.
        // await conn.sendMessage(m.chat, { text: "¡Hola! Bienvenido al grupo." });
      }
    }

    // --- Manejo del evento de 'SALIR DEL GRUPO' ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      const goodbyeText = `🚶‍♂️ *¡Adiós ${user}!* 😔\n\nGracias por haber formado parte de *${groupName}*. ¡Vuelve cuando quieras!`;
      await conn.sendMessage(
        m.chat,
        {
          image: imgBuffer,
          caption: goodbyeText,
          mentions: [userJid],
        },
        { quoted: fkontak }
      );
    }

    // --- Manejo del evento de 'EXPULSIÓN DEL GRUPO' ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      const kickText = `🚨 *${user} ha sido expulsado del grupo* 🚨\n\nMantengamos un ambiente respetuoso en *${groupName}*`;
      await conn.sendMessage(
        m.chat,
        {
          image: imgBuffer,
          caption: kickText,
          mentions: [userJid],
        },
        { quoted: fkontak }
      );
    }
  } catch (error) {
    console.error("❌ Error general en el sistema de bienvenida/despedida:", error);
    console.error("Detalles del error general:", error.stack);
  }
}
