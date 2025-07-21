import { WAMessageStubType } from "@whiskeysockets/baileys";
import fetch from "node-fetch";

export async function before(m, { conn, groupMetadata }) {
  try {
    // Asegúrate de que solo se procesen mensajes de grupo que tengan un tipo de "stub" (evento del sistema).
    if (!m.messageStubType || !m.isGroup) {
      return true;
    }

    // Define un contacto falso para citar los mensajes, evitando errores si no hay un mensaje real para citar.
    const fkontak = {
      key: {
        participants: "0@s.whatsapp.net",
        remoteJid: "status@broadcast",
        fromMe: false,
        id: "Halo",
      },
      message: {
        contactMessage: {
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${conn.user.jid.split('@')[0]}:${conn.user.jid.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
        },
      },
      participant: "0@s.whatsapp.net",
    };

    // Accede a la configuración del chat desde la base de datos global.
    const chat = global.db?.data?.chats?.[m.chat];
    // Si no hay configuración para este chat, sal de la función.
    if (!chat) {
      return true;
    }

    // Extrae el JID (Jabber ID) del usuario afectado por el evento.
    const userJid = m.messageStubParameters[0];
    // Formatea el JID del usuario para mostrarlo en el mensaje.
    const user = `@${userJid.split("@")[0]}`;
    // Obtiene el nombre y la descripción del grupo. Si no hay descripción, usa un texto predeterminado.
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || "📜 Sin descripción disponible";

    // Intenta obtener la foto de perfil del usuario. Si falla, usa una imagen por defecto.
    const ppUrl = await conn.profilePictureUrl(userJid, "image").catch(
      () => "https://files.catbox.moe/6dewf4.jpg"
    );
    // Descarga la imagen de perfil y la convierte en un buffer.
    const imgBuffer = await fetch(ppUrl).then(res => res.buffer()).catch(() => null);

    // --- Lógica para la Bienvenida ---
    // Comprueba si la bienvenida está activada para este chat y si el evento es de adición de participante.
    if (chat.bienvenida && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      const welcomeText = `🎉 *¡HOLA ${user}!* 🎉\n\nBienvenido/a a *${groupName}*.\n\n📚 *Sobre nosotros:*\n_${groupDesc}_\n\n🌟 ¡Esperamos que disfrutes tu estancia!`;

      // Envía el mensaje de bienvenida con la imagen y el texto.
      await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: welcomeText,
        mentions: [userJid], // Menciona al usuario en el mensaje.
      }, { quoted: fkontak }); // Cita el mensaje con el contacto falso.

      // Intenta enviar un audio de bienvenida.
      try {
        await conn.sendMessage(m.chat, {
          audio: { url: "https://qu.ax/dvPOt.opus" },
          mimetype: "audio/ogg; codecs=opus", // Especifica el MIME type correcto para .opus
          ptt: false // Indica que no es un "push to talk" (audio grabado).
        }, { quoted: fkontak });
        console.log("✅ Audio de bienvenida enviado correctamente.");
      } catch (error) {
        console.error("❌ Error al enviar el audio de bienvenida:", error);
        await m.reply("⚠️ El audio de bienvenida no se pudo enviar."); // Notifica al usuario si el audio falla.
      }
    }

    // --- Lógica para la Salida Voluntaria ---
    // Comprueba si la bienvenida está activada y si el evento es de salida de participante.
    if (chat.bienvenida && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      const goodbyeText = `🚶‍♂️ *¡Adiós ${user}!* 😔\n\nGracias por haber formado parte de *${groupName}*. ¡Vuelve cuando quieras!`;

      // Envía el mensaje de despedida.
      await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: goodbyeText,
        mentions: [userJid],
      }, { quoted: fkontak });

      // Intenta enviar un audio de despedida.
      try {
        await conn.sendMessage(m.chat, {
          audio: { url: "https://cdn.russellxz.click/98d99914.mp3" },
          mimetype: "audio/mpeg",
          ptt: false,
        }, { quoted: fkontak });
        console.log("✅ Audio de despedida enviado correctamente.");
      } catch (error) {
        console.error("❌ Error al enviar el audio de despedida:", error);
      }
    }

    // --- Lógica para la Expulsión ---
    // Comprueba si la bienvenida está activada y si el evento es de remoción de participante.
    if (chat.bienvenida && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      const kickText = `🚨 *${user} ha sido expulsado del grupo* 🚨\n\nMantengamos un ambiente respetuoso en *${groupName}*`;

      // Envía el mensaje de expulsión.
      await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: kickText,
        mentions: [userJid],
      }, { quoted: fkontak });

      // Intenta enviar un audio de expulsión.
      try {
        await conn.sendMessage(m.chat, {
          audio: { url: "https://qu.ax/AGEns.mp3" },
          mimetype: "audio/mpeg",
          ptt: false,
        }, { quoted: fkontak });
        console.log("✅ Audio de expulsión enviado correctamente.");
      } catch (error) {
        console.error("❌ Error al enviar el audio de expulsión:", error);
      }
    }
  } catch (error) {
    // Captura cualquier error general en el proceso y lo registra.
    console.error("❌ Error general en el sistema de bienvenida/despedida:", error);
  }
}
