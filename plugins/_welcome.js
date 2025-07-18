import { WAMessageStubType } from "@whiskeysockets/baileys";
import fetch from "node-fetch";

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (!m.messageStubType || !m.isGroup) return true;

    let ppUrl = await conn.profilePictureUrl(m.messageStubParameters[0], "image").catch(
      () => "https://files.catbox.moe/6dewf4.jpg"
    );
    let imgBuffer = await fetch(ppUrl).then(res => res.buffer()).catch(() => null);

    let chat = global.db?.data?.chats?.[m.chat];
    if (!chat) return true;

    const botName = "sᥲsᥙkᥱ ᑲ᥆𝗍 mძ 🌀";
    const user = `@${m.messageStubParameters[0].split("@")[0]}`;
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || "🌎 Sin descripción";

    // 🎉 Bienvenida
    if (chat.bienvenida && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      const welcomeText = `🎊 *¡Bienvenido, ${user}!* 🎊\n✨ *Has entrado a* ${groupName}.\n📢 *Descripción:* ${groupDesc}\n🚀 *Disfruta tu estancia y sigue las reglas!*`;
      const audioUrl = "https://qu.ax/dvPOt.opus"; // Your audio link

      await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: welcomeText,
        mentions: [m.messageStubParameters[0]]
      });

      // --- Important: Ensure the audio is sent correctly ---
      // For .opus files, 'audio/ogg; codecs=opus' is often more reliable
      // You can also try 'audio/mp4' if converting to an M4A/AAC format
      try {
        await conn.sendMessage(m.chat, {
          audio: { url: audioUrl },
          mimetype: 'audio/ogg; codecs=opus', // Corrected mimetype for better compatibility
          ptt: true // Set to true for a voice note
        });
        console.log(`Audio de bienvenida enviado para ${user}`);
      } catch (audioError) {
        console.error(`❌ Error al enviar el audio de bienvenida para ${user}:`, audioError);
      }
    }

    if (chat.bienvenida && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      const goodbyeText = `👋 *${user} ha decidido salir del grupo.*\n✨ *Esperamos verte nuevamente en* ${groupName}!`;

      await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: goodbyeText,
        mentions: [m.messageStubParameters[0]]
      });
    }

    if (chat.bienvenida && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      const kickText = `🚨 *${user} ha sido expulsado del grupo!* 🚨\n❌ *Eliminado de* ${groupName}.\n⚡ *Sigue las normas para evitar futuras sanciones.*`;

      await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: kickText,
        mentions: [m.messageStubParameters[0]]
      });
    }
  } catch (error) {
    console.error("❌ Error general en bienvenida/despedida:", error);
  }
}
