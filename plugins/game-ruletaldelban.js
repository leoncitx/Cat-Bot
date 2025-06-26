let handler = async (m, { conn, groupMetadata }) => {
    // Check if the bot has restrictions enabled
    let bot = global.db.data.settings[conn.user.jid] || {};
    if (!bot.restrict) {
        return m.reply(`⚠️ This command can only be used by the owner.`);
    }

    // Check if the command is used in a group
    if (!m.isGroup) {
        return m.reply(`⚠️ This command can only be used in groups.`);
    }

    // Bot creator's phone number (replace with the actual number if different)
    const botCreatorNumber = '584246582666'; 

    // Function to check if a participant is an admin, superadmin, group owner, or the bot creator
    const isAdminOrCreator = (participant) => {
        return participant.admin === 'admin' || participant.admin === 'superadmin' || participant.id === groupMetadata.owner || participant.id.includes(botCreatorNumber);
    };

    // Filter participants: exclude the bot itself, admins, superadmins, the group owner, and the bot creator
    let candidates = groupMetadata.participants
        .filter(v => v.id !== conn.user.jid && !isAdminOrCreator(v))
        .map(v => v.id);

    // Check if there are any eligible candidates for removal
    if (candidates.length === 0) {
        return m.reply(`⚠️ No candidates found for the roulette, or all are administrators/moderators/bot creator.`);
    }

    // Determine how many users to remove (maximum 10, or fewer if not enough candidates)
    const numToRemove = Math.min(10, candidates.length);

    // Select random users to remove
    const usersToRemove = [];
    for (let i = 0; i < numToRemove; i++) {
        const randomIndex = Math.floor(Math.random() * candidates.length);
        usersToRemove.push(candidates[randomIndex]);
        candidates.splice(randomIndex, 1); // Remove the selected user from the list to avoid duplicates
    }

    // Format mentions for the message
    let format = a => '@' + a.split('@')[0];

    // Notify the chosen users and proceed with their removal
    const mentionsText = usersToRemove.map(user => `*${format(user)}*`).join(', ');
    await conn.sendMessage(m.chat, {
        text: `*☠️ The following users have been chosen by the death roulette: ${mentionsText}*`,
        mentions: usersToRemove
    });

    // Wait 2 seconds before removing the users
    await delay(2000);
    await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
};

handler.command = /^(ruletaban)$/i; // Command to trigger the function
handler.group = true; // Command can only be used in groups
handler.tags = ['game']; // Categorize the command

export default handler;

// Simple delay function
const delay = time => new Promise(res => setTimeout(res, time));
