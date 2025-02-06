import { useSession } from "next-auth/react";
import styles from "../page.module.css";

interface HeaderProps {
  isActive: boolean;
  handleAuthButtonClick: () => void;
}

export default function Header({ isActive, handleAuthButtonClick }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.title}>VTDT Code Editor</h1>
        <div className={styles.modalButton}>
          <button
            className={`${styles.button} ${isActive ? styles.active : ""}`}
            onClick={handleAuthButtonClick}
          >
            <span>{session ? 'Log Out' : 'Log in with Google'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
