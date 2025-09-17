import { sendTelegramMessage } from "../../../../utils/sendTelegram";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Handler para OPTIONS (CORS)
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  });
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    
    if (!process.env.TELEGRAM_SECRET || secret !== process.env.TELEGRAM_SECRET) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: "Unauthorized - Secret inválido" 
        }), 
        { 
          status: 401,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD'
          }
        }
      );
    }

    // Busca as ofertas da Shopee
    const shopeeResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/shopee`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!shopeeResponse.ok) {
      throw new Error(`Erro ao buscar ofertas: ${shopeeResponse.status} ${shopeeResponse.statusText}`);
    }

    const json = await shopeeResponse.json();
    const produtos = json?.data?.data?.productOfferV2?.nodes || [];

    if (!produtos.length) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: "Nenhum produto encontrado na Shopee" 
        }), 
        { 
          status: 404,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD'
          }
        }
      );
    }

    console.log(`📦 Encontrados ${produtos.length} produtos. Enviando top 5...`);

    // Envia top 5 ofertas com delay entre mensagens
    const produtosParaEnviar = produtos.slice(0, 5);
    let enviadosComSucesso = 0;

    for (const [index, produto] of produtosParaEnviar.entries()) {
      try {
        // Converte preços para número e formata corretamente
        const priceMax = typeof produto.priceMax === 'string' 
          ? parseFloat(produto.priceMax) 
          : typeof produto.priceMax === 'number' 
            ? produto.priceMax 
            : 0;
        
        const priceMin = typeof produto.priceMin === 'string' 
          ? parseFloat(produto.priceMin) 
          : typeof produto.priceMin === 'number' 
            ? produto.priceMin 
            : 0;

        const message = `
🛍️ <b>${produto.productName || 'Produto sem nome'}</b>

💸 De: R$ ${priceMax.toFixed(2)}
🔥 Por: <b>R$ ${priceMin.toFixed(2)}</b>
⭐ Avaliação: ${produto.ratingStar || '0'} (${produto.sales || 0} vendas)

🔗 <a href="${produto.offerLink}">COMPRAR AGORA</a>
        `.trim();

        await sendTelegramMessage(message);
        enviadosComSucesso++;
        
        console.log(`✅ Mensagem ${index + 1}/${produtosParaEnviar.length} enviada`);

        // Delay de 1 segundo entre mensagens para evitar rate limiting
        if (index < produtosParaEnviar.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`❌ Erro ao enviar mensagem ${index + 1}:`, error);
        // Continua para as próximas mensagens mesmo se uma falhar
      }
    }

    return new Response(
      JSON.stringify({ 
        ok: true, 
        total: produtos.length,
        enviados: enviadosComSucesso,
        message: `Enviadas ${enviadosComSucesso} de ${produtosParaEnviar.length} mensagens com sucesso`
      }), 
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD'
        }
      }
    );

  } catch (error: unknown) {
    console.error("💥 Erro crítico no send-telegram:", error);
    
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error instanceof Error ? error.message : "Erro desconhecido"
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD'
        }
      }
    );
  }
}

// Para testes manuais via GET
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    
    if (!process.env.TELEGRAM_SECRET || secret !== process.env.TELEGRAM_SECRET) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: "Unauthorized - Secret inválido para GET" 
        }), 
        { 
          status: 401,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD'
          }
        }
      );
    }
    
    console.log("🔍 Teste GET acionado - simulando POST...");
    return POST(req);
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any | unknown) {
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: "Erro no método GET" + error.message 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD'
        }
      }
    );
  }
}

// Suporte a HEAD para health checks
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
      'Content-Type': 'application/json'
    }
  });
}