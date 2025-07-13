const { getAudioUrl } = require("google-tts-api");

const handler = async (msg, { conn, text, usedPrefix }) => {
  try {
    // Reacción inicial para indicar que el comando está siendo procesado
    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: "🗣️", key: msg.key }
    });

    let textToSay = (text || "").trim();

    // Intenta obtener el texto del mensaje citado si no se proporcionó texto directamente
    if (!textToSay && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation) {
      textToSay = msg.message.extendedTextMessage.contextInfo.quotedMessage.conversation.trim();
    }

    // Si aún no hay texto, envía un mensaje de uso correcto
    if (!textToSay) {
      return await conn.sendMessage(msg.key.remoteJid, {
        text: `⚠️ *Uso correcto del comando:*\n\n📌 Ejemplo: *${usedPrefix}tts Hola mi amor* o responde a un mensaje con *${usedPrefix}tts*`
      }, { quoted: msg });
    }

    // Indica que el bot está grabando audio
    await conn.sendPresenceUpdate('recording', msg.key.remoteJid);

    // Obtiene la URL de audio usando la función getAudioUrl
    const ttsUrl = getAudioUrl(textToSay, {
      lang: "es", // Idioma español
      slow: false,
      host: "https://translate.google.com"
    });

    // Envía el audio como una nota de voz (PTT)
    await conn.sendMessage(msg.key.remoteJid, {
      audio: { url: ttsUrl },
      ptt: true, // Reproducir como nota de voz
      mimetype: 'audio/mpeg',
      fileName: `tts.mp3`
    }, { quoted: msg });

    // Reacción final de éxito
    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: "✅", key: msg.key }
    });

  } catch (err) {
    console.error("❌ Error en el comando tts:", err);
    
    // Envía un mensaje de error si algo falla
    await conn.sendMessage(msg.key.remoteJid, {
      text: "❌ Ocurrió un error al procesar el texto a voz. Intenta más tarde."
    }, { quoted: msg });

    // Reacción final de error
    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: "❌", key: msg.key }
    });
  }
};

// Define el comando
handler.command = ['tts'];
module.exports = handler;
