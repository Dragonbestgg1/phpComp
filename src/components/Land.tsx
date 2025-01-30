"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { FaFolder } from "react-icons/fa6";
import { RxCornerBottomLeft } from "react-icons/rx";
import { FiFilePlus } from "react-icons/fi";
import CodeMirror from '@uiw/react-codemirror';
import { php } from '@codemirror/lang-php';
import { dracula } from '@uiw/codemirror-theme-dracula';
import styles from "../app/page.module.css";

export default function Land() {
  const { data: session } = useSession();
  const [isActive, setIsActive] = useState(false);
  const [code, setCode] = useState('<?php\n// Write your PHP code here...\n?>');
  const [output, setOutput] = useState('');

  const handleAuthButtonClick = () => {
    setIsActive(!isActive);
    if (session) {
      signOut();
    } else {
      signIn('google');
    }
  };

  // const runCode = async () => {
  //   try {
  //     const response = await fetch('http://localhost:3001/api/run', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ code }),
  //     });
  //     const result = await response.json();
  //     if (!response.ok) {
  //       throw new Error(result.error);
  //     }
  //     setOutput(result.output);
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       setOutput(`Error: ${error.message}`);
  //     } else {
  //       setOutput('An unknown error occurred.');
  //     }
  //   }
  // };  

  return (
    <div className={styles.page}>
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
      <main className={styles.main}>
        <div className={styles.mainRow}>
          <div className={styles.savesContainer}>
            <div className={styles.savesHeader}>
              <h2><FaFolder /> Projects</h2>
              <h2><FiFilePlus /></h2>
            </div>
            <div className={styles.savesContent}>
              <h2 className={styles.saveItem}><RxCornerBottomLeft /> Test 1</h2>
              <h2 className={styles.saveItem}><RxCornerBottomLeft /> Test 2</h2>
              <h2 className={styles.saveItem}><RxCornerBottomLeft /> Test 3</h2>
              <h2 className={styles.saveItem}><RxCornerBottomLeft /> Test 4</h2>
            </div>
          </div>
          <div className={styles.codeBase}>
            <div className={styles.codeBaseHeader}>
              {/* <button className={styles.runButton} onClick={runCode}>Run Code</button> */}
            </div>
            <div className={styles.codeBaseContainer}>
              <CodeMirror
                value={code}
                extensions={[php()]}
                theme={dracula}
                onChange={(value) => {
                  setCode(value);
                }}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLine: true,
                  syntaxHighlighting: true,
                }}
              />
            </div>
          </div>
        </div>
        <div className={styles.outputContainer}>
          <h2>Output:</h2>
          <pre>{output}</pre>
        </div>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
