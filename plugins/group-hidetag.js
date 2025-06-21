import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import * as fs from 'fs'; // Not used in the provided logic, consider removing if not needed elsewhere.

const handler = async (m, { conn, text, participants, isOwner, isAdmin }) => {
  // Define a constant for the watermark to avoid repetition
  const WATERMARK = '\n\n> _BOT - BARBOZA 🌪️_';
  // Define a default thumbnail URL for externalAdReply
  const DEFAULT_THUMBNAIL = 'https://telegra.ph/file/03d1e7fc24e1a72c60714.jpg';

  // Extract JIDs of all participants
  const mentionedJids = participants.map((p) => conn.decodeJid(p.id));

  try {
    // Determine the message to be re-sent or quoted
    const quotedMessage = m.quoted ? m.quoted : m;
    const quotedMessageType = quotedMessage.mtype;
    const quotedMessageContent = quotedMessage.msg || quotedMessage.text;

    // Handle different types of quoted messages
    let messageContent;
    if (quotedMessageType === 'extendedTextMessage') {
      messageContent = {
        extendedTextMessage: {
          text: (text || quotedMessageContent.text || '') + WATERMARK,
          contextInfo: { mentionedJid: mentionedJids },
        },
      };
    } else {
      // For other message types (image, video, audio, sticker), re-send with caption/watermark
      const media = await quotedMessage.download?.();
      const options = { mentions: mentionedJids, quoted: m };

      switch (quotedMessageType) {
        case 'imageMessage':
          messageContent = { image: media, caption: (text || '') + WATERMARK, ...options };
          break;
        case 'videoMessage':
          messageContent = { video: media, caption: (text || '') + WATERMARK, mimetype: 'video/mp4', ...options };
          break;
        case 'audioMessage':
          messageContent = { audio: media, caption: WATERMARK, mimetype: 'audio/mpeg', fileName: `Hidetag.mp3`, ...options };
          break;
        case 'stickerMessage':
          messageContent = { sticker: media, ...options };
          break;
        default:
          // Fallback for unhandled types or simple text messages
          messageContent = { extendedTextMessage: { text: (text || m.text || '') + WATERMARK, contextInfo: { mentionedJid: mentionedJids } } };
          break;
      }
    }

    // Generate and relay the message
    const generatedMessage = generateWAMessageFromContent(m.chat, messageContent, { quoted: m, userJid: conn.user.id });
    await conn.relayMessage(m.chat, generatedMessage.message, { messageId: generatedMessage.key.id });

  } catch (error) {
    console.error('Error in hidetag handler:', error);
    // Fallback if the primary method fails, using an externalAdReply for a more visual tag
    const more = String.fromCharCode(8206);
    const masss = more.repeat(850) + WATERMARK;

    await conn.relayMessage(
      m.chat,
      {
        extendedTextMessage: {
          text: masss,
          contextInfo: {
            mentionedJid: mentionedJids,
            externalAdReply: {
              thumbnail: DEFAULT_THUMBNAIL,
              sourceUrl: global.canal, // Assuming global.canal is defined elsewhere
              renderV2: true, // Use the new rendering engine for externalAdReply
            },
          },
        },
      },
      {}
    );
  }
};

// ---
// Handler Configuration
// ---
handler.help = ['hidetag'];
handler.tags = ['group'];
handler.command = /^(hidetag|notify|notificar|noti|n|hidetah|hidet)$/i;
handler.group = true;
handler.botAdmin = true; // Corrected from Botadmin to botAdmin for consistency

export default handler;
