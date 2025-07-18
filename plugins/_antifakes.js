import db from '../lib/database.js'

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
    // Only proceed if it's a group message
    if (!m.isGroup) return false

    let chat = global.db.data.chats[m.chat]

    // Initialize antifake setting if not present for the chat
    if (!chat) {
        global.db.data.chats[m.chat] = { antifake: false };
        chat = global.db.data.chats[m.chat];
    }

    // Check if antifake is enabled for this chat and if the bot is an admin
    if (chat.antifake) { // No need to check isBotAdmin here, it's checked before removing
        const blockedPrefixes = [
            '63', // Philippines
            '90', // Turkey
            '856', // Laos
            '212', // Morocco
            '92', // Pakistan
            '93', // Afghanistan
            '94', // Sri Lanka
            '7',  // Russia/Kazakhstan (Note: This is a large prefix, use with caution)
            '49', // Germany
            '2',  // Various African countries (e.g., Egypt, South Africa) - also a large prefix
            '91', // India
            '48'  // Poland
        ];

        const senderNumber = m.sender.split('@')[0];

        for (const prefix of blockedPrefixes) {
            if (senderNumber.startsWith(prefix)) {
                // If the user's number starts with a blocked prefix
                
                // Ensure user data exists for blocking
                if (!global.db.data.users[m.sender]) {
                    global.db.data.users[m.sender] = {};
                }
                global.db.data.users[m.sender].block = true; // Mark user as blocked in the database

                // Attempt to remove the user only if the bot is an admin
                if (isBotAdmin) {
                    try {
                        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                        console.log(`[ANTIFAKE] Removed and blocked user ${m.sender} from ${m.chat} due to prefix: ${prefix}`);
                        return true; // Stop processing further if user is removed
                    } catch (e) {
                        console.error(`[ANTIFAKE ERROR] Failed to remove user ${m.sender} from ${m.chat}:`, e);
                        // You might want to send a message to the group owner or console if this happens frequently
                        await conn.reply(m.chat, `⚠️ **[ANTIFAKE ERROR]** No pude remover a @${senderNumber} (${prefix}). Asegúrate de que soy **administrador** del grupo.`, m, { mentions: [m.sender] });
                        return true; // Still return true as we've handled the action
                    }
                } else {
                    // Inform that the bot isn't an admin and can't remove
                    console.log(`[ANTIFAKE WARNING] Bot is not admin in ${m.chat}. Cannot remove user ${m.sender} with prefix: ${prefix}`);
                    await conn.reply(m.chat, `⚠️ **[ANTIFAKE WARNING]** Intenté bloquear a @${senderNumber} (${prefix}), pero no pude removerlo. Necesito ser **administrador** del grupo para hacerlo.`, m, { mentions: [m.sender] });
                    return true; // Still return true as we've identified the issue
                }
            }
        }
    }
    return false; // Return false if no action was taken
}

export default handler
