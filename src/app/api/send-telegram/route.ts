import { sendTelegramMessage } from "../../../../utils/sendTelegram";

// Variável em memória (Atenção: Na Vercel isso zera a cada execução fria, o ideal futuro é salvar num banco como Firebase)
let ultimoIndiceEnviado = 0;

export const dynamic = "force-dynamic";
export const maxDuration = 30; 

async function processarEnvio(req: Request) {
  try {
    // 1. VERIFICAÇÃO DE SEGURANÇA (Para testar, acesse: /api/send-telegram?secret=SUA_SENHA_DO_CRON)
    const secret = process.env.CRON_SECRET;
    const url = new URL(req.url);
    const providedSecret = url.searchParams.get("secret");

    if (secret && providedSecret !== secret) {
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized - Parâmetro secret incorreto ou ausente na URL" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. BUSCA OFERTAS DA SHOPEE
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

    // 3. SELEÇÃO DE 20 PRODUTOS
    const produtosParaEnviar = [];
    for (let i = 0; i < 20; i++) {
      const index = (ultimoIndiceEnviado + i) % produtos.length;
      produtosParaEnviar.push(produtos[index]);
    }
    
    ultimoIndiceEnviado = (ultimoIndiceEnviado + 20) % produtos.length;

    // 4. DISPARO EM MASSA (PROMISE.ALL) - A Mágica para não dar Timeout na Vercel!
    const promessasDeEnvio = produtosParaEnviar.map((produto) => {
      const priceMax = typeof produto.priceMax === "string" ? parseFloat(produto.priceMax) : produto.priceMax || 0;
      const priceMin = typeof produto.priceMin === "string" ? parseFloat(produto.priceMin) : produto.priceMin || 0;

      const message = `
🔗 <a href="${produto.offerLink}">COMPRAR AGORA</a>
🛍️ <b>${produto.productName || "Produto sem nome"}</b>
${priceMax == priceMin ? "" : `💸 De: R$ ${priceMax.toFixed(2)}`}
🔥 Por: <b>R$ ${priceMin.toFixed(2)}</b>
⭐ Avaliação: ${produto.ratingStar || "0"} (${produto.sales || 0} vendas)
`.trim();

      return sendTelegramMessage(message).catch(err => {
        console.error("Erro em uma das mensagens:", err);
        return null; // Retorna null para não quebrar o Promise.all inteiro
      });
    });

    // Aguarda todas as mensagens irem para o Telegram SIMULTANEAMENTE (Leva menos de 1 segundo)
    const resultados = await Promise.all(promessasDeEnvio);
    const enviadosComSucesso = resultados.filter(r => r !== null).length;

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