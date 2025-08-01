import Link from "next/link";
import styles from "./Nav.module.css";
import Login from "@/components/Admin/Login/page";

export default function Nav() {

    const rotas = {
        home: "/",
        login: "/admin"
    }


  return (
    <nav className={styles.menu_principal}>
      <div>NAVBRAND</div>
      <div className={styles.menu_content}>
        <ul className={styles.menu_list}>
          <li className={styles.menu_item}>
            <Link href={rotas.home}>Home</Link>
          </li>
          <li className={styles.menu_item}>
            <Login />
          </li>
        </ul>
      </div>
    </nav>
  );
}
