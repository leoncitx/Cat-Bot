import fetch from 'node-fetch';

const handler = async (m, { conn, args }) => {
  if (!args.length) {
    return m.reply('✏️ Escribe el texto que quieres usar en el logo.\n*Ejemplo:* `.balogo Asuna Project`');
  }

  const text = args.join(' ');
  const apiUrl = `https://api.nekorinn.my.id/maker/blue-archive-logo?text=${encodeURIComponent(text)}`;

  try {
    m.reply('🛠️ Estamos preparando tu diseño... esto tomará solo un momento.');

    const res = await fetch(apiUrl);
    
    // Check if the response was NOT successful
    if (!res.ok) {
      // Try to get more detailed error information from the API's response body
      const errorText = await res.text(); 
      console.error('API responded with an error:', res.status, res.statusText, errorText);
      
      // Provide a more specific error message to the user
      return m.reply(`📵 No pudimos generar tu diseño. La API respondió con un error: ${res.status} ${res.statusText}. Detalles: ${errorText.substring(0, 150)}...`);
    }

    const buffer = await res.buffer();
    await conn.sendFile(m.chat, buffer, 'logo.jpg', `🖋️ *Diseño generado para:* _${text}_`, m);
  } catch (err) {
    console.error('Error al intentar conectar o procesar el logo:', err);
    m.reply('📵 Hubo un problema al intentar conectar con el servicio o procesar tu diseño. Intenta de nuevo más tarde.');
  }
};

handler.command = ['balogo'];
export default handler;
