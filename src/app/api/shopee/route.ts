import { time } from "console";
import * as CryptoJS from "crypto-js";
import { auth } from "../../../../utils/auth";

export async function POST(request: Request) {
  const { id } = await request.json();

  const payload = {
    query:
      "{\nbrandOffer{\n    nodes{\n        commissionRate\n        offerName\n    }\n}\n}",
  };
  const timestamp = Date.now();
  const appid = process.env.NEXT_PUBLIC_SHOPEE_APP_ID!;
  const demo = process.env.NEXT_PUBLIC_SHOPEE_APP_SECRET!;

  const signature = SHA256(appid + timestamp + payload + demo).toString()
  const query = payload.query;

  const headers = {
    "Content-Type": "application/json",
    authorization: CryptoJS.SHA256,
    timestamp: timestamp,
    appid: appid,
    demo: demo,
    signature: signature

  };
  
  
  
  const res = await fetch("https://open-api.affiliate.shopee.com.br/graphql", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      query: `
        query Product($id: String!) {
          product(id: $id) {
            id
            title
            description
            price
            discount
            imageUrl
            offerLink
          }
        }
      `,
      operationName: "Product",
      variables: {
        id,
      },
    }),
  });

  const data = await res.json();
  return Response.json({ data });
}
