import axios from "axios";
import { writeFileSync, unlinkSync, readFileSync} from "fs";
import { exec} from "child_process";
import path from "path";

const handler = async (m, { conn, text, command}) => {
  if (!text) return m.reply(`🌀 Kirim nama sticker pack!\nContoh:.${command} akame`);

  m.reply("🌀 Prosesss Bossquuu");

  try {
    const res = await axios.get(`https://apii.baguss.web.id/tools/getstickpack?apikey=bagus&query=${encodeURIComponent(text)}`);
    const data = res.data;

    if (!data.success ||!data.stickers || data.stickers.length === 0)
      return m.reply("❌ Stiker tidak ditemukan.");

    const randomStickerUrl = data.stickers[Math.floor(Math.random() * data.stickers.length)];
    const imageResponse = await axios.get(randomStickerUrl.split("?")[0], { responseType: "arraybuffer"});

    const inputPath = path.join(__dirname, "temp.png");
    const outputPath = path.join(__dirname, "temp.webp");
    writeFileSync(inputPath, imageResponse.data);

    exec(
      `ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease" -c:v libwebp -preset default -an -vsync 0 "${outputPath}"`,
      async (err) => {
        if (err) {
          console.error("❌ Gagal convert ke sticker:", err);
          return m.reply("❌ Gagal convert stiker.");
}

        const stickerBuffer = readFileSync(outputPath);
        await conn.sendMessage(m.chat, { sticker: stickerBuffer}, { quoted: m});

        unlinkSync(inputPath);
        unlinkSync(outputPath);
}
);
} catch (err) {
    console.error(err);
    m.reply("❌ Terjadi kesalahan saat mengambil atau mengonversi stiker.");
}
};

handler.command = ["getsic"];
handler.tags = ["tools"];
handler.help = ["getsic"];
export default handler;