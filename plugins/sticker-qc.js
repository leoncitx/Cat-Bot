import { sticker } from '../lib/sticker.js';
import axios from 'axios';

const emoji = '🔥';
const emoji2 = '🎖️';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    let text;
    // Determine the text to be used for the quote
    if (args.length >= 1) {
        text = args.slice(0).join(" ");
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text;
    } else {
        return conn.reply(m.chat, `${emoji} Please provide text or quote a message to create a sticker!`, m);
    }

    if (!text) {
        return conn.reply(m.chat, `${emoji} Please provide text or quote a message to create a sticker!`, m);
    }

    // Determine the mentioned user or sender
    const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    const mentionRegex = new RegExp(`@${who.split('@')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g');
    
    // Remove mention from the text for the quote
    const mishi = text.replace(mentionRegex, '').trim();

    // Enforce character limit
    if (mishi.length > 40) {
        return conn.reply(m.chat, `${emoji2} The text cannot exceed 40 characters.`, m);
    }

    let pp;
    let nombre;

    try {
        pp = await conn.profilePictureUrl(who);
    } catch {
        pp = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'; // Default profile picture
    }

    try {
        nombre = await conn.getName(who);
    } catch {
        nombre = 'Unknown'; // Default name
    }

    const obj = {
        "type": "quote",
        "format": "png",
        "backgroundColor": "#000000",
        "width": 512,
        "height": 768,
        "scale": 2,
        "messages": [{
            "entities": [],
            "avatar": true,
            "from": {
                "id": 1,
                "name": `${nombre}`,
                "photo": { url: `${pp}` }
            },
            "text": mishi,
            "replyMessage": {}
        }]
    };

    try {
        // !!! IMPORTANT: Replace 'https://bot.lyo.su/quote/generate' with a working API endpoint !!!
        const json = await axios.post('https://api.example.com/generate-quote-sticker', obj, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Ensure the API response structure matches what you expect (e.g., json.data.result.image)
        if (!json.data || !json.data.result || !json.data.result.image) {
            return conn.reply(m.chat, `${emoji} Error: Could not generate sticker. The API response was unexpected.`, m);
        }

        const buffer = Buffer.from(json.data.result.image, 'base64');
        let stiker = await sticker(buffer, false, global.botname, global.nombre);

        if (stiker) {
            return conn.sendFile(m.chat, stiker, 'quote_sticker.webp', '', m);
        } else {
            return conn.reply(m.chat, `${emoji} Failed to create sticker.`, m);
        }

    } catch (error) {
        console.error('Error generating quote sticker:', error);
        return conn.reply(m.chat, `${emoji} An error occurred while trying to generate the sticker. Please check the API endpoint or try again later.`, m);
    }
};

handler.help = ['qc'];
handler.tags = ['sticker'];
handler.group = true;
handler.register = true;
handler.command = ['qc'];

export default handler;
