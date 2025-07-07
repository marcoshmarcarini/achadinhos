import { chromium, Response } from 'playwright-core';

export async function scrapeShopee(keyword: string, limit = 20) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let data: any | null = null;

  // escuta a primeira resposta da API
  page.on('response', async (res: Response) => {
    if (res.url().includes('/api/v4/search/search_items') && res.ok()) {
      data = await res.json();
    }
  });

  await page.goto(
    `https://shopee.com.br/search?keyword=${encodeURIComponent(keyword)}`,
    { waitUntil: 'domcontentloaded' }
  );

  // aguarda até a variável data ser preenchida
  await page.waitForFunction(() => window['__scraped'] === true, null, {timeout: 10000})
    .catch(() => {});          // evita throw se já capturou

  await browser.close();
  if (!data) return [];

  return data.items.slice(0, limit).map((item: any) => ({
    title: item.item_basic.name,
    price: item.item_basic.price / 100000,  // vem em centavos × 10³
    imageUrl: `https://down-br.img.susercontent.com/file/${item.item_basic.image}`,
    productUrl: `https://shopee.com.br/${item.item_basic.name.replace(/\s+/g,'-')}-i.${item.item_basic.shopid}.${item.item_basic.itemid}`,
    createdAt: new Date(),
    source: 'shopee',
  }));
}
