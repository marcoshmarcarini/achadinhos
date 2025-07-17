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

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch("/api/shopee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const json = await response.json();
      console.log("✅ json:", json);

      const nodes = json?.data?.data?.productOfferV2?.nodes;
      console.log("✅ nodes:", nodes);

      if (Array.isArray(nodes)) {
        setProdutos(nodes);
      } else {
        console.error("Formato de dados inválido", json);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <div className={styles.container}>
        {produtos ? (
          produtos.map((offer, id) => (
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
              <span
                className={`${styles.discount} bg-orange-100 text-orange-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-orange-900 dark:text-orange-300`}
              >
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
                  <Link href={`${offer.offerLink}`} className={styles.button}>
                    Comprar
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Carregando...</p>
        )}
      </div>
    </div>
  );
}
