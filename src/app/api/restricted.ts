import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]/route";
import { NextApiRequest, NextApiResponse } from "next";


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    res.send({
      content:
        "Este é um conteúdo protegido. Vocé pode acessar o conteúdo, porque está logado.",
    });
  } else {
    res.send({
      error: "Vocé deve estar logado para verificar o conteúdo protegido.",
    });
  }
};

export default handler;
