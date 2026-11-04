import { sendTelegramMessage } from "../../../../utils/sendTelegram";

export const dynamic = "force-dynamic";
export const maxDuration = 30; 

// 1. Criamos um "molde" para o TypeScript parar de reclamar
interface ShopeeProduct {
  offerLink?: string;
  productName?: string;
  priceMax?: string | number;
  priceMin?: string | number;
  ratingStar?: string | number;
  sales?: number | string;
}

async function processarEnvio(req: Request) {
  try {
    // 2. VERIFICAÇÃO DE SEGURANÇA
    const secret = process.env.CRON_SECRET;
    const url = new URL(req.url);
    const providedSecret = url.searchParams.get("secret");

    if (secret && providedSecret !== secret) {
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized - Parâmetro secret incorreto ou ausente na URL" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. BUSCA OFERTAS DA SHOPEE
    const shopeeResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/shopee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!shopeeResponse.ok) throw new Error(`Erro ao buscar ofertas: ${shopeeResponse.status}`);
    
    const json = await shopeeResponse.json();
    const produtos = json?.data?.data?.productOfferV2?.nodes || [];

    if (!produtos.length) {
      return new Response(JSON.stringify({ ok: false, error: "Nenhum produto encontrado" }), { status: 404 });
    }

    // 4. SELEÇÃO DE 20 PRODUTOS (Embaralhado para não repetir)
    const produtosEmbaralhados = produtos.sort(() => 0.5 - Math.random());
    const produtosParaEnviar = produtosEmbaralhados.slice(0, 20);

    // 5. DISPARO EM MASSA (PROMISE.ALL)
    // Agora usamos a interface ShopeeProduct no lugar do "any"
    const promessasDeEnvio = produtosParaEnviar.map((produto: ShopeeProduct) => {
      const priceMax = typeof produto.priceMax === "string" ? parseFloat(produto.priceMax) : produto.priceMax || 0;
      const priceMin = typeof produto.priceMin === "string" ? parseFloat(produto.priceMin) : produto.priceMin || 0;

      const message = `
🔗 <a href="${produto.offerLink}">COMPRAR AGORA</a>
🛍️ <b>${produto.productName || "Produto sem nome"}</b>
${priceMax == priceMin ? "" : `💸 De: R$ ${priceMax.toFixed(2)}`}
🔥 Por: <b>R$ ${priceMin.toFixed(2)}</b>
⭐ Avaliação: ${produto.ratingStar || "0"} (${produto.sales || 0} vendas)
🔗 <a href="t.me/achadinhosshopeetops">CANAL DE OFERTAS</a>
`.trim();

      return sendTelegramMessage(message).catch((err) => {
        console.error("Erro em uma das mensagens:", err);
        return null; 
      });
    });

    const resultados = await Promise.all(promessasDeEnvio);
    const enviadosComSucesso = resultados.filter((r) => r !== null).length;

    return new Response(
      JSON.stringify({
        ok: true,
        enviados: enviadosComSucesso,
        message: `Disparo concluído: ${enviadosComSucesso}/20 mensagens entregues.`
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(req: Request) { return processarEnvio(req); }
export async function POST(req: Request) { return processarEnvio(req); }