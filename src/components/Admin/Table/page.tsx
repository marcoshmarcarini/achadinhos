"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import db from "../../../../utils/firebase";
import styles from "./Table.module.css";

interface OfferProps {
  title: string;
  price: number;
  discount: number;
  description: string;
  offerLink: string;
  imageUrl: string;
}

export default function Table() {
  const [offer, setOffer] = useState<OfferProps[]>([]);

  useEffect(() => {
    const fetchOffers = async () => {
      const offersCollection = collection(db, "Offers");
      const offersSnapshot = await getDocs(offersCollection);
      const offersData = offersSnapshot.docs.map((doc) => ({
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
    fetchOffers();
  }, []);

  return (
    <table
      className={`${styles.table_offers} w-full text-sm text-left border rounded-sm rtl:text-right text-gray-500 dark:text-gray-400`}
    >
      <thead
        className={`rounded-sm text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400`}
      >
        <tr>
          <th scope="col" className={`px-6 py-3`}>
            Imagem
          </th>
          <th scope="col" className={`px-6 py-3`}>
            Título
          </th>
          <th scope="col" className={`px-6 py-3`}>
            Preço
          </th>
          <th scope="col" className={`px-6 py-3`}>
            Desconto
          </th>
          <th scope="col" className={`px-6 py-3`}>
            Descrição
          </th>
          <th scope="col" className={`px-6 py-3`}>
            Link da Oferta
          </th>
        </tr>
      </thead>
      <tbody>
        {offer && offer.length > 0 ? (
          offer.map((offer, id) => (
            <tr
              key={id}
              className={`${styles.trow} bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200`}
            >
              <td className={`${styles.tdata} px-6 py-4`}>
                <Image
                  src={
                    offer.imageUrl
                      ? offer.imageUrl
                      : "https://picsum.photos/100"
                  }
                  alt={offer.title}
                  width={150}
                  height={150}
                />
              </td>
              <td className={`${styles.tdata} px-6 py-4`}>{offer.title}</td>
              <td className={`${styles.tdata} px-6 py-4`}>
                R${offer.price ? offer.price.toFixed(2).replace(".", ",") : 0}
              </td>
              <td className={`${styles.tdata} px-6 py-4`}>
                <span>{offer.discount } %</span>
              </td>
              <td className={styles.tdata_description}>{offer.description}</td>
              <td className={`${styles.tdata} px-6 py-4`}>
                <Link
                  href={offer.offerLink ? offer.offerLink : "#"}
                  className={`${styles.link} text-white bg-[#FF9119] hover:bg-[#FF9119]/80 focus:ring-4 focus:outline-none focus:ring-[#FF9119]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:hover:bg-[#FF9119]/80 dark:focus:ring-[#FF9119]/40 me-2 mb-2`}
                  rel="noopener noreferrer"
                  title={offer.offerLink}
                  target="_blank"
                >
                  Obter Oferta
                </Link>
              </td>
            </tr>
          ))
        ) : (
          <tr className={styles.trow}>
            <td className={styles.tdata}>
              <p className={styles.loading}>Carregando...</p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
