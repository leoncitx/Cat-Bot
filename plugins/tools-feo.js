const handler = async (m, { command}) => {
  m.reply("😖 Muy feo");
};

handler.command = ["feo"];
handler.tags = ["premiumsub"];
handler.help = ["feo"];
export default handler;