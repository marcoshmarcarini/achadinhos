'use client'

import { FormEvent, useEffect, useState } from "react";
import db from "../../../../utils/firebase";
import { doc, setDoc } from "firebase/firestore";
import styles from "./Form.module.css";

interface OfferProps {
  title: string;
  price: number;
  description: string;
  offerLink: string;
  imageUrl: string;
}

export default function Form() {
  const [offer, setOffer] = useState<OfferProps>({
    title: "",
    price: 0,
    description: "",
    offerLink: "",
    imageUrl: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.form_control}>
        <label htmlFor="title" className={styles.form_label}>
          Título
        </label>
        <input
          type="text"
          id="title"
          className={styles.form_input}
          value={offer.title}
          onChange={(e) => setOffer({ ...offer, title: e.target.value })}
        />
      </div>
      <div className={styles.form_control}>
        <label htmlFor="price" className={styles.form_label}>
          Preço
        </label>
        <input
          type="number"
          id="price"
          className={styles.form_input}
          value={offer.price}
          onChange={(e) =>
            setOffer({ ...offer, price: Number(e.target.value) })
          } // no frontend, converte para string
        />
      </div>
      <div className={styles.form_control}>
        <label htmlFor="description" className={styles.form_label}>
          Descrição
        </label>
        <textarea
          name="description"
          id="description"
          className={styles.form_textarea}
          onChange={(e) => setOffer({ ...offer, description: e.target.value })}
          placeholder="Descreva a oferta"
        ></textarea>
      </div>
      <div className={styles.form_control}>
        <label htmlFor="offerLink" className={styles.form_label}>
          Link da Oferta
        </label>
        <input
          type="text"
          id="offerLink"
          className={styles.form_input}
          value={offer.offerLink}
          onChange={(e) => setOffer({ ...offer, offerLink: e.target.value })}
        />
      </div>
      <div className={styles.form_control}>
        <label htmlFor="imageUrl" className={styles.form_label}>
          Link da Imagem
        </label>
        <input
          type="text"
          id="imageUrl"
          className={styles.form_input}
          value={offer.imageUrl}
          onChange={(e) => setOffer({ ...offer, imageUrl: e.target.value })}
        />
      </div>

      <div className={styles.form_control}>
        <input type="submit" value="Salvar" className={styles.form_submit} />
      </div>
    </form>
  );
}
