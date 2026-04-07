import { NextResponse } from "next/server";

export async function GET() {
  try {
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

    // O "Super Filtro" de Achadinhos (Gatilhos de alta conversão)
    const prioridadeCasa = [
      // Cozinha e Rotina Saudável
      "cozinha", "processador", "airfryer", "fritadeira", "panela", "pote", "marmita", 
      "balança", "térmica", "garrafa", "liquidificador", "moedor", "escorredor", "faca",
      // Organização e Limpeza
      "organizador", "limpeza", "mop", "vassoura", "aspirador", "cesto", "cabide", 
      "sapateira", "prateleira", "suporte", "gancho", "caixa", "dispenser",
      // Conforto, Casa e Família
      "banheiro", "lençol", "toalha", "tapete", "luminária", "lancheira", "umidificador", 
      "ventilador", "espelho", "travesseiro", "cobertor",
      // Ferramentas e Praticidade (Apelo unissex)
      "ferramenta", "parafusadeira", "furadeira", "chave", "alicate", "tomada", 
      "extensão", "adaptador", "sensor", "led", "smart", "interruptor", "campainha"
    ];
    
    // Filtro de Segurança (Brand Safety)
    const termosNegativos = ["vibrador", "sex", "adulto", "shampoo escurecedor", "calcinha", "cueca"];

    const top20 = [...nodes]
      .filter(item => {
        const nome = item.productName.toLowerCase();
        // Remove itens indesejados
        return !termosNegativos.some(termo => nome.includes(termo));
      })
      .sort((a, b) => {
        const nomeA = a.productName.toLowerCase();
        const nomeB = b.productName.toLowerCase();

        // Se o nome do produto contiver alguma palavra da nossa lista VIP, ele ganha +30 pontos no ranking de desconto
        const pesoA = prioridadeCasa.some(p => nomeA.includes(p)) ? 30 : 0;
        const pesoB = prioridadeCasa.some(p => nomeB.includes(p)) ? 30 : 0;

        return (b.priceDiscountRate + pesoB) - (a.priceDiscountRate + pesoA);
      })
      .slice(0, 20)
      .map((item) => ({
        nome: item.productName, 
        preco_original: item.priceMax, 
        preco_desconto: item.priceMin, 
        percentual_desconto: item.priceDiscountRate,
        link_afiliado: item.offerLink, 
        imagem_url: item.imageUrl
      }));

    return NextResponse.json(top20, { status: 200 });
    
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao buscar ofertas", details: String(err) }, 
      { status: 500 }
    );
  }
}