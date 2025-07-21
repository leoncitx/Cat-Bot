
import { WAMessageStubType } from "@whiskeysockets/baileys";
import fetch from "node-fetch";

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (!m.messageStubType || !m.isGroup) return true;

    const fkontak = {
      key: {
        participants: "0@s.whatsapp.net",
        remoteJid: "status@broadcast",
        fromMe: false,
        id: "Halo"
      },
      message: {
        contactMessage: {
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${conn.user.jid.split('@')[0]}:${conn.user.jid.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
        }
      },
      participant: "0@s.whatsapp.net"
    };

    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat) return true;

    const user = `@${m.messageStubParameters[0].split("@")[0]}`;
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || "📜 Sin descripción disponible";

    const ppUrl = await conn.profilePictureUrl(m.messageStubParameters[0], "image").catch(
      () => "https://files.catbox.moe/6dewf4.jpg"
    );
    const imgBuffer = await fetch(ppUrl).then(res => res.buffer()).catch(() => null);

    // Bienvenida
    if (chat.bienvenida && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      const welcomeText = `🎉 *¡HOLA ${user}!* 🎉\n\nBienvenido/a a *${groupName}*.\n\n📚 *Sobre nosotros:*\n_${groupDesc}_\n\n🌟 ¡Esperamos que disfrutes tu estancia y te diviertas mucho! No olvides leer las **reglas** del grupo para una mejor convivencia.`;
      const welcomeAudioUrl = "https://qu.ax/dvPOt.opus";

      await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: welcomeText,
        mentions: [m.messageStubParameters[0]]
      }, { quoted: fkontak });

      try {
        // Obtenemos el buffer del audio antes de enviarlo
        const audioBuffer = await fetch(welcomeAudioUrl).then(res => res.buffer());
        await conn.sendMessage(m.chat, {
          audio: audioBuffer, // Pasamos el buffer directamente
          mimetype: 'audio/ogg', // Asegúrate de que el MIME type sea correcto para .opus
          ptt: false // Cambia a 'true' si quieres que sea un mensaje de voz
        });
      } catch (audioError) {
        console.error("❌ Error al enviar el audio de bienvenida:", audioError);
      }
    }

    // Salida voluntaria
    if (chat.bienvenida && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      const goodbyeText = `🚶‍♂️ *¡Adiós ${user}!* 😔\n\nNos entristece verte partir de *${groupName}*.\n\n✨ ¡Gracias por haber sido parte de nuestra comunidad! Siempre serás bienvenido/a de vuelta.`;
      const exitAudioUrl = "https://cdn.russellxz.click/98d99914.mp3";

      await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: goodbyeText,
        mentions: [m.messageStubParameters[0]]
      }, { quoted: fkontak });

      try {
        const audioBuffer = await fetch(exitAudioUrl).then(res => res.buffer());
        await conn.sendMessage(m.chat, {
          audio: audioBuffer,
          mimetype: 'audio/mp3', // Asegúrate de que el MIME type sea correcto para .mp3
          ptt: false
        });
      } catch (audioError) {
        console.error("❌ Error al enviar el audio de despedida:", audioError);
      }
    }

    // Expulsión del grupo
    if (chat.bienvenida && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      const kickText = `🚨 *¡${user} ha sido ELIMINADO del grupo!* 🚨\n\n💥 Ya no forma parte de *${groupName}*.\n\n🚫 Este es un recordatorio importante: las reglas están para cumplirse. ¡Mantengamos un ambiente positivo!`;
      const kickAudioUrl = "https://cdn.russellxz.click/98d99914.mp3";

      await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: kickText,
        mentions: [m.messageStubParameters[0]]
      }, { quoted: fkontak });

      try {
        const audioBuffer = await fetch(kickAudioUrl).then(res => res.buffer());
        await conn.sendMessage(m.chat, {
          audio: audioBuffer,
          mimetype: 'audio/mp3',
          ptt: false
        });
      } catch (audioError) {
        console.error("❌ Error al enviar el audio de expulsión:", audioError);
      }
    }
  } catch (error) {
    console.error("❌ Error en la función de bienvenida/despedida:", error);
  }
}
