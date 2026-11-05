import { sendTelegramMessage } from "../../../../utils/sendTelegram";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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
    // 1. VERIFICAÇÃO DE SEGURANÇA
    const secret = process.env.CRON_SECRET;
    const url = new URL(req.url);
    const providedSecret = url.searchParams.get("secret");

    if (secret && providedSecret !== secret) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Unauthorized - Parâmetro secret incorreto",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    // 2. BUSCA OFERTAS DA SHOPEE
    const shopeeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/shopee`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );

    if (!shopeeResponse.ok)
      throw new Error(`Erro ao buscar ofertas: ${shopeeResponse.status}`);

    const json = await shopeeResponse.json();
    const produtosGerais = json?.data?.data?.productOfferV2?.nodes || [];

    if (!produtosGerais.length) {
      return new Response(
        JSON.stringify({ ok: false, error: "Nenhum produto encontrado" }),
        { status: 404 },
      );
    }

    // 3. FILTRO TECH EXCLUSIVO E PREMIUM
    const palavrasTech = [
      "gamer",
      "mouse",
      "teclado",
      "headset",
      "monitor",
      "notebook",
      "ssd",
      "bluetooth",
      "fone",
      "xiaomi",
      "smartphone",
      "smartwatch",
      "rgb",
      "pc",
      "memória",
      "placa de vídeo",
      "console",
      "controle",
      "lenovo",
      "samsung",
      "apple",
      "nintendo",
      "playstation",
      "ryzen",
      "intel",
      "corsair",
      "logitech",
    ];

    const palavrasProibidas = [
      "caneca",
      "garrafa",
      "liquidificador",
      "capinha",
      "película",
      "cabo",
      "meia",
      "cueca",
      "suporte",
      "tripé",
      "luminária",
    ];

    let produtosFiltrados = produtosGerais.filter((produto: ShopeeProduct) => {
      if (!produto.productName) return false;

      // 1. Filtro de Preço Mínimo (Mata 90% dos produtos genéricos baratos)
      const priceMin =
        typeof produto.priceMin === "string"
          ? parseFloat(produto.priceMin)
          : produto.priceMin || 0;
      if (priceMin < 80) return false;

      const nome = produto.productName.toLowerCase();

      // 2. Filtro de Palavras Negativas
      const temPalavraProibida = palavrasProibidas.some((palavra) =>
        nome.includes(palavra),
      );
      if (temPalavraProibida) return false;

      // 3. Filtro de Palavras Tech
      return palavrasTech.some((palavra) => nome.includes(palavra));
    });

    // Se o filtro super restrito achar pouca coisa, baixamos a guarda mas mantemos o preço
    if (produtosFiltrados.length < 5) {
      console.log(
        "Poucas ofertas tech premium. Pegando produtos gerais acima de R$80.",
      );
      produtosFiltrados = produtosGerais.filter((produto: ShopeeProduct) => {
        const priceMin =
          typeof produto.priceMin === "string"
            ? parseFloat(produto.priceMin)
            : produto.priceMin || 0;
        return priceMin >= 80;
      });
    }

    // 4. SELEÇÃO E EMBARALHAMENTO
    const produtosEmbaralhados = produtosFiltrados.sort(
      () => 0.5 - Math.random(),
    );
    // Pega até 20 itens (se o filtro achou apenas 12, ele envia os 12)
    const produtosParaEnviar = produtosEmbaralhados.slice(0, 20);

    // 5. DISPARO EM MASSA
    const promessasDeEnvio = produtosParaEnviar.map(
      (produto: ShopeeProduct) => {
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
🔗 <a href="t.me/achadinhosshopeetops">CANAL DE OFERTAS</a>
`.trim();

        return sendTelegramMessage(message).catch((err) => {
          console.error("Erro em uma das mensagens:", err);
          return null;
        });
      },
    );

    const resultados = await Promise.all(promessasDeEnvio);
    const enviadosComSucesso = resultados.filter((r) => r !== null).length;

    return new Response(
      JSON.stringify({
        ok: true,
        enviados: enviadosComSucesso,
        message: `Disparo concluído: ${enviadosComSucesso} mensagens entregues.`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export async function GET(req: Request) {
  return processarEnvio(req);
}
export async function POST(req: Request) {
  return processarEnvio(req);
}
