let handler = async (m, { conn, groupMetadata}) => {
    // Check if the bot's restrict setting is enabled.
    // If not, it means only the owner can use this command.
    let bot = global.db.data.settings[conn.user.jid] || {};
    if (!bot.restrict) return m.reply(`⚠️ Solo el propietario puede usar este comando.`);

    // Ensure the command is used within a group.
    if (!m.isGroup) return m.reply(`🥕 Este comando solo se puede usar en grupos.`);

    // Define the bot creator's number. This is hardcoded.
    const botCreatorNumber = '584246582666';

    // Helper function to check if a participant is an admin or the bot creator.
    const isAdminOrCreator = (participant) => {
        return participant.admin === 'admin' || participant.admin === 'superadmin' || participant.id === groupMetadata.owner || participant.id === botCreatorNumber;
    };

    // Filter participants who are not the bot itself, and are not admins or the creator.
    // This creates a list of eligible users to be removed.
    let psmap = groupMetadata.participants
        .filter(v => v.id !== conn.user.jid && !isAdminOrCreator(v))
        .map(v => v.id); // Get just the IDs

    // If no eligible users are found, send a reply.
    if (psmap.length === 0) return m.reply(`⚠️ No hay usuarios elegibles para ser eliminados.`);

    // Shuffle the array of eligible users and select up to 50 random ones.
    let shuffled = psmap.sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, 50); // Adjust this number if you want to change the quantity

    // If no users were selected after shuffling (unlikely if psmap wasn't empty, but good for safety).
    if (selected.length === 0) return m.reply(`⚠️ No se encontraron suficientes usuarios para eliminar.`);

    // Loop through the selected users to remove them.
    for (let user of selected) {
        let format = a => '@' + a.split('@')[0]; // Formats the user ID for mention.
        await conn.sendMessage(m.chat, {
            text: `*${format(user)} ☠️ La ruleta ha hablado, adiós...*`,
            mentions:[user] // Ensures the user is mentioned in the message.
        });

        // Wait 2 seconds before removing the user to give time for the message to be seen.
        await delay(2000);
        // Attempt to remove the user from the group.
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
    }
};

// Define the command name.
handler.command = /^(ruletaban2)$/i;
// Specifies that this command can only be used in groups.
handler.group = true;
// Tags for categorization (useful for help menus).
handler.tags = ['game'];
// Requires the user executing the command to be an admin.
handler.admin = true;
// Requires the bot itself to be an admin in the group.
handler.botAdmin = true;

// Export the handler.
export default handler;

// Simple delay utility function.
const delay = time => new Promise(res => setTimeout(res, time));
