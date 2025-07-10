"use client";

import { FormEvent, useState } from "react";
import db from "../../../../utils/firebase";
import { addDoc, collection } from "firebase/firestore";
import styles from "./Form.module.css";

interface OfferProps {
  title: string;
  price: number;
  discount: number;
  description: string;
  offerLink: string;
  imageUrl: string;
}

export default function Form() {
  const [offer, setOffer] = useState<OfferProps>({
    title: "",
    price: 0,
    discount: 0,
    description: "",
    offerLink: "",
    imageUrl: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await addDoc(collection(db, "Offers"), {
      title: offer.title,
      price: offer.price,
      discount: offer.discount,
      description: offer.description,
      offerLink: offer.offerLink,
      imageUrl: offer.imageUrl,
    });

    setOffer({
      title: "",
      price: 0,
      discount: 0,
      description: "",
      offerLink: "",
      imageUrl: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={`${styles.form_content}`}>
        <div className={styles.form_control}>
          <label htmlFor="title" className={styles.form_label}>
            Título
          </label>
          <input
            type="text"
            id="title"
            placeholder="Digite o título da oferta"
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
            placeholder="Digite o preço da oferta"
            step={`any`}
            className={styles.form_input}
            onChange={(e) =>
              setOffer({ ...offer, price: Number(e.target.value) })
            } // no frontend, converte para string
          />
        </div>
        <div className={styles.form_control}>
          <label htmlFor="discount" className={styles.form_label}>
            Desconto
          </label>
          <input
            type="number"
            id="discount"
            placeholder="Digite o desconto da oferta"
            step={`any`}
            className={styles.form_input}
            onChange={(e) =>
              setOffer({ ...offer, discount: Number(e.target.value) })
            } // no frontend, converte para string
          />
        </div>
      </div>

      <div className={styles.form_control_description}>
        <label htmlFor="description" className={styles.form_label}>
          Descrição
        </label>
        <textarea
          name="description"
          id="description"
          placeholder="Descreva a oferta"
          className={styles.form_textarea}
          onChange={(e) => setOffer({ ...offer, description: e.target.value })}
        ></textarea>
      </div>
      <div className={styles.form_control}>
        <label htmlFor="offerLink" className={styles.form_label}>
          Link da Oferta
        </label>
        <input
          type="text"
          id="offerLink"
          placeholder="Digite o link da oferta"
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
          placeholder="Digite o link da imagem"
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
