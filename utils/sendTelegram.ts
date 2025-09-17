export async function sendTelegramMessage(message: string): Promise<unknown> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    if (!botToken) {
      throw new Error('❌ TELEGRAM_BOT_TOKEN não configurado no ambiente');
    }

    if (!chatId) {
      throw new Error('❌ TELEGRAM_CHAT_ID não configurado no ambiente');
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
        disable_notification: false,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('❌ Erro na API do Telegram:', data);
      throw new Error(`Telegram API error: ${data.description || 'Erro desconhecido'}`);
    }

    console.log('✅ Mensagem enviada com sucesso para o Telegram');
    return data;

  } catch (error) {
    console.error('💥 Erro ao enviar mensagem para Telegram:', error);
    throw error;
  }
}