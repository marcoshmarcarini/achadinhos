import { sendTelegramMessage } from "../../../../utils/sendTelegram";

export async function POST() {
  // Fetch as ofertas (você já tem isso pronto no seu projeto!)
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/shopee`, { method: "POST" });
  const json = await response.json();
  const produtos = json?.data?.data?.productOfferV2?.nodes;

  for (const produto of produtos.slice(0, 5)) {
    const message = `
        🛍️ <b>${produto.productName}</b>

        💸 De: R$${produto.priceMax}
        🔥 Por: <b>R$${produto.priceMin}</b>
        ⭐ Avaliação: ${produto.ratingStar} (${produto.sales} vendas)

        🔗 <a href="${produto.offerLink}">COMPRAR AGORA</a>
        `;

    await sendTelegramMessage(message);
  }

  return new Response(JSON.stringify({ ok: true }));
}
