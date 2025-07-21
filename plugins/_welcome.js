import { WAMessageStubType } from "@whiskeysockets/baileys";

export async function before(m, { conn, groupMetadata }) {
  try {
    if (!m.messageStubType || !m.isGroup) {
      return true;
    }

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

    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat || !chat.bienvenida) {
      return true;
    }

    let userJid;
    let welcomeText = "";
    let goodbyeText = "";
    let kickText = "";

    switch (m.messageStubType) {
      case WAMessageStubType.GROUP_PARTICIPANT_ADD:
      case WAMessageStubType.GROUP_PARTICIPANT_REMOVE:
        userJid = m.messageStubParameters[0];
        break;
      case WAMessageStubType.GROUP_PARTICIPANT_LEAVE:
        userJid = m.key.participant;
        break;
      default:
        return true;
    }

    if (!userJid) {
      console.warn("❌ Could not determine user JID for stub type:", m.messageStubType);
      return true;
    }

    const user = `@${userJid.split("@")[0]}`;
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || "📜 Sin descripción disponible";

    const ppUrl = await conn.profilePictureUrl(userJid, "image").catch(() => null);
    let imgBuffer = null;
    if (ppUrl) {
      try {
        imgBuffer = await fetch(ppUrl).then(res => res.buffer());
      } catch (e) {
        console.error("❌ Error fetching profile picture:", e);
      }
    }
    
    if (!imgBuffer) {
        try {
            imgBuffer = await fetch("https://example.com/default_profile_pic.jpg").then(res => res.buffer()); 
        } catch (e) {
            console.error("❌ Error fetching fallback image:", e);
        }
    }

    switch (m.messageStubType) {
      case WAMessageStubType.GROUP_PARTICIPANT_ADD:
        welcomeText = `🎉 *¡HOLA ${user}!* 🎉\n\nBienvenido/a a *${groupName}*.\n\n📚 *Sobre nosotros:*\n_${groupDesc}_\n\n🌟 ¡Esperamos que disfrutes tu estancia!`;
        await conn.sendMessage(m.chat, {
          image: imgBuffer,
          caption: welcomeText,
          mentions: [userJid],
        }, { quoted: fkontak });
        break;

      case WAMessageStubType.GROUP_PARTICIPANT_LEAVE:
        goodbyeText = `🚶‍♂️ *¡Adiós ${user}!* 😔\n\nGracias por haber formado parte de *${groupName}*. ¡Vuelve cuando quieras!`;
        await conn.sendMessage(m.chat, {
          image: imgBuffer,
          caption: goodbyeText,
          mentions: [userJid],
        }, { quoted: fkontak });
        break;

      case WAMessageStubType.GROUP_PARTICIPANT_REMOVE:
        kickText = `🚨 *${user} ha sido expulsado del grupo* 🚨\n\nMantengamos un ambiente respetuoso en *${groupName}*`;
        await conn.sendMessage(m.chat, {
          image: imgBuffer,
          caption: kickText,
          mentions: [userJid],
        }, { quoted: fkontak });
        break;
    }

  } catch (error) {
    console.error("❌ Error general en el sistema de bienvenida/despedida:", error);
  }
}
