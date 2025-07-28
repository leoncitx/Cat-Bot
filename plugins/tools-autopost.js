
import fs from 'fs';
import path from 'path';
import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob} from "formdata-node";
import { fileTypeFromBuffer} from "file-type";

global.emoji = '🔮';
global.emoji2 = '🔮';

let handler = async (m, { conn}) => {
  if (!m.quoted ||!/image/.test(m.quoted.mimetype)) {
    return m.reply(`${emoji} Por favor, responde a una imagen con el comando *seticono* para actualizar el ícono del menú.`, m);
}

  try {
    const media = await m.quoted.download();

    const filetype = await fileTypeFromBuffer(media);
    if (!filetype ||!filetype.mime.startsWith('image/')) {
      return m.reply(`${emoji2} El archivo enviado no es una imagen válida.`, m);
}

    let url;
    try {
      const sunflare = await uploadToSunflare(media);
      url = sunflare.url;
} catch (e) {
      const russell = await uploadToRussellXZ(media);
      url = russell.url;
}

    // Guardar como ícono en config global
    let botData = global.db.data.settings[conn.user.jid] || {};
    botData.icono = url;
    global.db.data.settings[conn.user.jid] = botData;

    await conn.sendFile(m.chat, media, 'icono.jpg', `${emoji} Ícono actualizado correctamente.`, m);

} catch (e) {
    m.reply(`🧿 Error: ${e.message}`);
}
};

handler.help = ['seticono'];
handler.tags = ['tools'];
handler.command = ['seticono'];
handler.rowner = true;

export default handler;

async function uploadToSunflare(buffer) {
  const { ext, mime} = await fileTypeFromBuffer(buffer) || { ext: 'bin', mime: 'application/octet-stream'};
  const blob = new Blob([buffer], { type: mime});
  const randomName = crypto.randomBytes(5).toString('hex') + '.' + ext;

  let folder = 'icons';
  const arrayBuffer = await blob.arrayBuffer();
  const base64Content = Buffer.from(arrayBuffer).toString('base64');

  const resp = await fetch('https://cdn-sunflareteam.vercel.app/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({
      folder,
      filename: randomName,
      base64Content
})
});

  const result = await resp.json();
  if (resp.ok && result?.url) {
    return { url: result.url, name: randomName};
} else {
    throw new Error(result?.error || 'Error cdn.sunflare');
}
}

async function uploadToRussellXZ(buffer) {
  const form = new FormData();
  form.set("file", new Blob([buffer], { type: 'image/jpeg'}), "icono.jpg");

  const resp = await fetch("https://cdn.russellxz.click/upload.php", {
    method: "POST",
    body: form
});

  const result = await resp.json();
  if (resp.ok && result?.url) {
    return { url: result.url};
} else {
    throw new Error(result?.error || 'Error cdn.russellxz');
}
}