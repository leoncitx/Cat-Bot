import fs from "fs";
import axios from "axios";
import FormData from "form-data";

const handler = async (m, { mime, quoted, command, prefix, text, isPrem}) => {
  const idUser = m.sender.split("@")[0];

  if (command === "hdvideo") {
    if (!quoted ||!/video/.test(mime)) return m.reply("❗ Responde a un video para convertirlo a HD");

    let [res, fpsText] = text?.trim().toLowerCase().split(" ");
    let fps = 60;

    if (fpsText && fpsText.endsWith("fps")) {
      fps = parseInt(fpsText.replace("fps", ""));
      if (isNaN(fps) || fps < 30 || fps> 240) {
        return m.reply("❗ FPS debe estar entre 30 y 240 (ejemplo: 60fps)");
}
}

    const resolutions = {
      "480": "480",
      "720": "720",
      "1080": "1080",
      "2k": "1440",
      "4k": "2160",
      "8k": "4320"
};

    if (!resolutions[res]) {
      return m.reply(`Ejemplo de uso:\n${prefix + command} 720\n${prefix + command} 1080 60fps`);
}

    const targetHeight = resolutions[res];
    const inputFile = `input_${idUser}.mp4`;
    const outputFile = `hdvideo_${idUser}.mp4`;

    m.reply(`⏳ Procesando video a ${res.toUpperCase()} ${fps}FPS...`);

    try {
      const downloaded = await DimzBot.downloadAndSaveMediaMessage(quoted, inputFile);

      const form = new FormData();
      form.append("video", fs.createReadStream(downloaded));
      form.append("resolution", targetHeight);
      form.append("fps", fps);

      const response = await axios.post("http://193.149.164.168:4167/hdvideo", form, {
        headers: form.getHeaders(),
        responseType: "stream",
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
});

      const filePath = `./temp/${outputFile}`;
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        const buffer = fs.readFileSync(filePath);
        await DimzBot.sendMessage(m.chat, {
          video: buffer,
          caption: `✅ Video convertido a ${res.toUpperCase()} ${fps}FPS`
}, { quoted: m});

        fs.unlinkSync(downloaded);
        fs.unlinkSync(filePath);
});

      writer.on("error", () => m.reply("❌ Error al guardar el video procesado"));
} catch (err) {
      console.error(err);
      m.reply("❌ Ocurrió un error al procesar el video");
}
}

  if (command === "hd") {
    if (!quoted ||!/image/.test(mime)) return m.reply("❗ Responde a una imagen para mejorar su calidad");

    m.reply("⏳ Procesando imagen, espera un momento...");

    try {
      const inputName = `input_${idUser}.jpg`;
      const outputName = `hdfoto_${idUser}.jpg`;

      const pathMedia = await DimzBot.downloadAndSaveMediaMessage(quoted, inputName);
      const imageUrl = await uptoibb(pathMedia);

      const filePath = `./temp/${outputName}`;
      const res = await axios.post("http://193.149.164.168:4167/hdfoto", { imageUrl}, {
        headers: { "Content-Type": "application/json"},
        responseType: "stream",
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
});

      const writer = fs.createWriteStream(filePath);
      res.data.pipe(writer);

      writer.on("finish", async () => {
        const buffer = fs.readFileSync(filePath);
        await DimzBot.sendMessage(m.chat, {
          image: buffer,
          caption: "✅ Imagen mejorada en calidad (HD)"
}, { quoted: m});

        fs.unlinkSync(pathMedia);
        fs.unlinkSync(filePath);
});

      writer.on("error", () => m.reply("❌ Error al guardar la imagen procesada"));
} catch (e) {
      console.error(e);
      m.reply(`❌ Error al procesar la imagen. Usa: ${prefix + command}`);
}
}
};

handler.command = ["hdvideo"];
handler.help = ["hdvideo <resolución> [fps]"];
handler.tags = ["tools"];
handler.limit = true;

export default handler;