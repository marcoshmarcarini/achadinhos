"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Shopee.module.css";

interface ProdutoProps {
  commissionRate: string;
  imageUrl: string;
  itemId: string;
  offerLink: string;
  priceDiscountRate: number;
  priceMax: string;
  priceMin: string;
  productName: string;
  ratingStar: string;
  sales: number;
}

export default function Shopee() {
  const [produtos, setProdutos] = useState<ProdutoProps[]>([]);
  const [topProdutos, setTopProdutos] = useState<ProdutoProps[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/shopee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await response.json();
      const nodes = json?.data?.data?.productOfferV2?.nodes;

      if (Array.isArray(nodes)) {
        setProdutos(nodes);

        // 👉 Ordena por maior desconto e pega os 10 primeiros
        const top10 = [...nodes]
          .sort((a, b) => b.priceDiscountRate - a.priceDiscountRate)
          .slice(0, 10);

        setTopProdutos(top10);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h2 style={{ textAlign: "center", margin: "20px 0" }}>
        🔥 Top 10 Ofertas de Hoje
      </h2>

      <div className={styles.container}>
        {topProdutos.length > 0 ? (
          topProdutos.map((offer, id) => (
            <div key={id} className={styles.cardOffer}>
              <div className={styles.imageContainer}>
                <Image
                  src={offer.imageUrl}
                  alt={offer.productName}
                  width={500}
                  height={500}
                  className={styles.image}
                  quality={100}
                />
              </div>
              <span className={styles.discount}>
                {offer.priceDiscountRate}%
              </span>
              <div className={styles.info_content}>
                <div className={styles.info}>
                  <p className={styles.title}>{offer.productName}</p>
                  <p className={styles.price}>
                    R$ {Number(offer.priceMin).toFixed(2).replace(".", ",")} - R$ {Number(offer.priceMax).toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <div>
                  <Link href={offer.offerLink} className={styles.button}>
                    Comprar
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Carregando ofertas...</p>
        )}
      </div>
    </div>
  );
}
