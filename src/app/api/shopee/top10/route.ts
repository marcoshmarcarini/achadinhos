import { NextResponse } from "next/server";

export async function POST() {
  try {
    // 🔥 Chama sua API Shopee principal
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/shopee`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }
    );

    const json = await response.json();
    const nodes = json?.data?.data?.productOfferV2?.nodes;

    if (!Array.isArray(nodes)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 500 });
    }

    // 👉 Pega Top 10 por maior desconto
    const top10 = [...nodes]
      .sort((a, b) => b.priceDiscountRate - a.priceDiscountRate)
      .slice(0, 10);

    // 🔹 Formata para Telegram
    const mensagensTelegram = top10.map((p, index) => {
      return `🔥 Oferta #${index + 1}
📌 ${p.productName}
💰 De: R$${Number(p.priceMax).toFixed(2).replace(".", ",")}
➡️ Por: R$${Number(p.priceMin).toFixed(2).replace(".", ",")}
⭐ Avaliação: ${p.ratingStar} | 📦 Vendas: ${p.sales}
🔗 ${p.offerLink}`;
    });

    return NextResponse.json({
      top10,
      telegram: mensagensTelegram,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao buscar ofertas", details: err },
      { status: 500 }
    );
  }
}
