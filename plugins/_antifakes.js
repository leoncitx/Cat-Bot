import db from '../lib/database.js'

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
    if (!m.isGroup) return false

    let chat = global.db.data.chats[m.chat]

    if (!chat) {
        global.db.data.chats[m.chat] = { antifake: false };
        chat = global.db.data.chats[m.chat];
    }

    if (isBotAdmin && chat.antifake) {
        const blockedPrefixes = [
            '63',
            '90',
            '856',
            '212',
            '92',
            '93',
            '94',
            '7',
            '49',
            '2',
            '91',
            '48'
        ];

        const senderNumber = m.sender.split('@')[0];

        for (const prefix of blockedPrefixes) {
            if (senderNumber.startsWith(prefix)) {
                if (!global.db.data.users[m.sender]) {
                    global.db.data.users[m.sender] = {};
                }
                global.db.data.users[m.sender].block = true;

                try {
                    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                    console.log(`[ANTIFAKE] Removed and blocked user ${m.sender} from ${m.chat} due to prefix: ${prefix}`);
                } catch (e) {
                    console.error(`[ANTIFAKE ERROR] Failed to remove user ${m.sender} from ${m.chat}:`, e);
                }
                return true;
            }
        }
    }
    return false;
}

export default handler
