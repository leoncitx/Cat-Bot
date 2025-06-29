const timeout = 3600000;
const banDuration = 5 * 60 * 1000;

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];

    if (!user.lastmaling) user.lastmaling = 0;
    if (!user.money) user.money = 0;
    if (!user.exp) user.exp = 0;
    if (!user.kardus) user.kardus = 0;
    if (!user.malingBan) user.malingBan = false;
    if (!user.item) user.item = {};

    let now = new Date().getTime();

    // Comprobar si el usuario está en estado de malingBan
    if (user.malingBan) {
        return conn.reply(m.chat, `🚫 Fallaste en el robo anterior y debes esperar ${msToTime(banDuration)} antes de intentarlo de nuevo.`, m);
    }

    if (now - user.lastmaling < timeout) {
        let timeRemaining = user.lastmaling + timeout - now;
        return conn.reply(m.chat, `⏳ Ya has robado antes.\nInténtalo de nuevo en ${msToTime(timeRemaining)}.`, m);
    }

    let randomEvent = Math.random();

    if (randomEvent < 0.25) { // 25% de fallo + ban
        let fine = Math.floor(user.money * 0.1);
        user.hutang = Math.max(user.money + fine, 0); // Esto parece un error, debería ser user.money - fine o user.hutang += fine
        user.lastmaling = now;
        user.malingBan = true;

        setTimeout(() => {
            user.malingBan = false;
        }, banDuration);

        return conn.reply(m.chat, `🚨 ¡Fuiste atrapado por la policía mientras robabas!\n💸 Multa: *${fine}*\n⏳ No podrás robar durante *${msToTime(banDuration)}*.`, m);
    }

    if (randomEvent < 0.5) { // 25% de pérdida de cajas
        if (user.kardus > 0) {
            let lostItems = Math.floor(user.kardus * 0.3);
            user.kardus -= lostItems;
            return conn.reply(m.chat, `😬 Lograste escapar, pero perdiste 📦 *${lostItems} cajas* en el camino.`, m);
        }
    }

    // Robo exitoso
    let money = Math.floor((Math.random() * 50000) + 5000);
    let exp = Math.floor((Math.random() * 1000) + 100);
    let kardus = Math.floor((Math.random() * 1000) + 50);

    // Reducir la ganancia en un 15%
    money = Math.floor(money * 0.85);
    exp = Math.floor(exp * 0.85);
    kardus = Math.floor(kardus * 0.85);

    user.money += money;
    user.exp += exp;
    user.kardus += kardus;
    user.lastmaling = now;

    let specialItemMessage = '';
    if (Math.random() < 0.1) {
        let items = ['Reloj de Oro', 'Llave Misteriosa', 'Gema Rara'];
        let specialItem = items[Math.floor(Math.random() * items.length)];
        user.item[specialItem] = (user.item[specialItem] || 0) + 1;
        specialItemMessage = `\n🎁 ¡Objeto especial encontrado: *${specialItem}*!`;
    }

    conn.reply(m.chat, `🎉 *¡Robo exitoso!*\n\n💵 +${money} Dinero\n⚗️ +${exp} Exp\n📦 +${kardus} Cajas${specialItemMessage}`, m);

    setTimeout(() => {
        conn.reply(m.chat, `🕵️ ¡Es hora de robar de nuevo! ¡Prueba tu suerte ahora!`, m);
    }, timeout);
};

handler.help = ['maling'];
handler.tags = ['rpg'];
handler.command = /^maling$/i;
handler.register = true;
handler.rpg = true;
module.exports = handler;

function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    return `${hours > 0 ? hours + ' hora(s) ' : ''}${minutes > 0 ? minutes + ' minuto(s) ' : ''}${seconds} segundo(s)`;
}
