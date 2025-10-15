// app/api/send-telegram/route.ts
import { sendTelegramMessage } from "../../../../utils/sendTelegram";

let ultimoIndiceEnviado = 0;

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // ✅ SE quiser manter a validação opcional por SECRET:
    const secret = process.env.TELEGRAM_SECRET;
    const url = new URL(req.url);
    const providedSecret = url.searchParams.get("secret");

    if (secret && providedSecret !== secret) {
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // ✅ Buscar os produtos
    const shopeeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/shopee`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    if (!shopeeResponse.ok) {
      throw new Error(
        `Erro ao buscar ofertas: ${shopeeResponse.status} ${shopeeResponse.statusText}`
      );
    }

    const json = await shopeeResponse.json();
    const produtos = json?.data?.data?.productOfferV2?.nodes || [];

    if (!produtos.length) {
      return new Response(
        JSON.stringify({ ok: false, error: "Nenhum produto encontrado" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    console.log(`📦 Encontrados ${produtos.length} produtos.`);
    console.log(`📊 Último índice enviado: ${ultimoIndiceEnviado}`);

    const produtosParaEnviar = [];
    for (let i = 0; i < 20; i++) {
      const index = (ultimoIndiceEnviado + i) % produtos.length;
      produtosParaEnviar.push(produtos[index]);
    }

    ultimoIndiceEnviado = (ultimoIndiceEnviado + 20) % produtos.length;

    let enviadosComSucesso = 0;

    for (const [index, produto] of produtosParaEnviar.entries()) {
      try {
        const priceMax =
          typeof produto.priceMax === "string"
            ? parseFloat(produto.priceMax)
            : produto.priceMax || 0;

        const priceMin =
          typeof produto.priceMin === "string"
            ? parseFloat(produto.priceMin)
            : produto.priceMin || 0;

        const message = `
🔗 <a href="${produto.offerLink}">COMPRAR AGORA</a>
🛍️ <b>${produto.productName || "Produto sem nome"}</b>
${priceMax == priceMin ? "" : `💸 De: R$ ${priceMax.toFixed(2)}`}
🔥 Por: <b>R$ ${priceMin.toFixed(2)}</b>
⭐ Avaliação: ${produto.ratingStar || "0"} (${produto.sales || 0} vendas)
`.trim();

        await sendTelegramMessage(message);
        enviadosComSucesso++;
        console.log(`✅ Mensagem ${index + 1}/20 enviada`);

        if (index < 4) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Erro ao enviar mensagem ${index + 1}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        total: produtos.length,
        enviados: enviadosComSucesso,
        proximoIndice: ultimoIndiceEnviado,
        message: `Enviadas ${enviadosComSucesso} de 20 mensagens. Próximo índice: ${ultimoIndiceEnviado}`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: unknown) {
    console.error("💥 Erro crítico:", error);

    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
