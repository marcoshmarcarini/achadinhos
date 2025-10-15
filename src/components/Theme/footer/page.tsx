import Image from "next/image"

export default function Footer(){
    return(
        <footer className={`flex items-center justify-center gap-2 py-[25px] absolute bottom-0 left-0 right-0`}>
            <Image src={`/img/achadinhos.png`} width={25} height={25} alt={`Achadinhos`} />
            <p>Desenvolvido por <a href="https://www.instagram.com/marcoshmarcarini" target="_blank">Marcos Henrique Marcarini Junior</a>. &copy; 2025</p>
        </footer>
    )
}