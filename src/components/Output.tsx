import styles from "../app/page.module.css";

interface OutputProps {
  output: string;
}

export default function Output({ output }: OutputProps) {
  return (
    <div className={styles.outputContainer}>
      <h2>Output:</h2>
      <pre className={styles.terminal}>{output}</pre>
    </div>
  );
}
