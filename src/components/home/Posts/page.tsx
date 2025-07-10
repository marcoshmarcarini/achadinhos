"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import db from "../../../../utils/firebase";
import styles from "./Posts.module.css";

interface OfferProps {
  title: string;
  price: number;
  discount: number;
  description: string;
  offerLink: string;
  imageUrl: string;
}

export default function Posts() {
  const [offer, setOffer] = useState<OfferProps[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      const colecao = collection(db, "Offers");
      const querySnapshot = await getDocs(colecao);
      const offersData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        title: doc.data().title,
        price: doc.data().price,
        discount: doc.data().discount,
        description: doc.data().description,
        offerLink: doc.data().offerLink,
        imageUrl: doc.data().imageUrl,
      }));
      setOffer(offersData);
    };

    loadPosts();
  }, []);

  return (
    <div>
      <h1>Posts</h1>
      <div className={styles.container}>
        {offer ? (
          offer.map((offer, id) => (
            <div key={id} className={styles.cardOffer}>
              <div className={styles.imageContainer}>
                <Image
                  src={offer.imageUrl}
                  alt={offer.title}
                  width={500}
                  height={500}
                  className={styles.image}
                  quality={100}
                />
              </div>
              <span
                className={`${styles.discount} bg-orange-100 text-orange-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-orange-900 dark:text-orange-300`}
              >
                {offer.discount}%
              </span>
              <div className={styles.info_content}>
                <div className={styles.info}>
                  <p className={styles.title}>{offer.title}</p>
                  <p className={styles.price}>
                    R$ {offer.price.toFixed(2).replace(".", ",")}
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
