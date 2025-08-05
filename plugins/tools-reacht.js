import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Contoh : .skiplink https://sub4unlock.co/S9oU0`);
    m.reply('wett')
    try {
        let api = `https://fgsi.koyeb.app/api/tools/skip/sub4unlock?apikey=APIKEY&url=${encodeURIComponent(text)}`;
        let { data: json } = await axios.get(api);

        if (!json.status || !json.data?.linkGo) {
            return m.reply('Lu masukin url apa tu woy 😂');
        }

        await m.reply(`${json.data.linkGo}`);
    } catch (err) {
        m.reply(`Eror kak : ${err.message}`)
    }
};

handler.help = ['skiplinksub4unlock <url>'];
handler.tags = ['tools'];
handler.command = ['sklink', 'skiplinksub4unlock']

export default handler