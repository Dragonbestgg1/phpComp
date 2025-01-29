"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [isActive, setIsActive] = useState(false);

  const toggleActiveState = () => {
    setIsActive(!isActive);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>VTDT Code Editor</h1>
          <div className={styles.modalButton}>
            <button
              className={`${styles.button} ${isActive ? styles.active : ""}`}
              onClick={toggleActiveState}
            >
              <span>Open Modal</span>
            </button>
          </div>
        </div>
      </header>
      <main className={styles.main}></main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
