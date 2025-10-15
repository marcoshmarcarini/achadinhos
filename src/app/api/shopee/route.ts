import { SHA256 } from "crypto-js";


export async function POST() {
  const payload = {
    query: `
      query ProductOffer {
        productOfferV2(
          listType: 2, 
          sortType: 20,   
          limit: 20,
          page: 1
        ) {
          nodes {
            commissionRate
            imageUrl
            itemId
            priceDiscountRate          
            priceMin
            priceMax
            productName
            sales
            ratingStar
            offerLink
          }
        }
      }
    `,
    operationName: "ProductOffer",
    variables: {}
  };

  const payloadString = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const appid = process.env.NEXT_PUBLIC_SHOPEE_APP_ID!;
  const appSecret = process.env.NEXT_PUBLIC_SHOPEE_APP_SECRET!;

  const baseString = appid + timestamp + payloadString + appSecret;
  const signature = SHA256(baseString).toString();

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `SHA256 Credential=${appid},Timestamp=${timestamp},Signature=${signature}`,
    "Timestamp": timestamp,
    "Appid": appid,
  };

  const res = await fetch("https://open-api.affiliate.shopee.com.br/graphql", {
    method: "POST",
    headers,
    body: payloadString,
  });

  if (!res.ok) {
    const error = await res.text();
    return new Response(JSON.stringify({ error }), { status: res.status });
  }

  const data = await res.json();
  return Response.json({ data });
}
