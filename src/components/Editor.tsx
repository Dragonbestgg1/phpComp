// Editor.tsx

import CodeMirror from '@uiw/react-codemirror';
import { php } from '@codemirror/lang-php';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { VscDebugRerun } from "react-icons/vsc";
import { IoIosSave } from "react-icons/io";
import styles from "../app/page.module.css";

interface EditorProps {
  code: string;
  setCode: (value: string) => void;
  runCode: () => void;
  saveCode: () => void;
}

export default function Editor({ code, setCode, runCode, saveCode }: EditorProps) {
  return (
    <div className={styles.codeBase}>
      <div className={styles.codeBaseHeader}>
        <button className={styles.runButton} onClick={runCode}>Run Code <VscDebugRerun /></button>
        <button className={styles.saveButton} onClick={saveCode}>Save Code <IoIosSave /></button>
      </div>
      <div className={styles.codeBaseContainer}>
        <CodeMirror
          value={code}
          extensions={[php()]}
          theme={dracula}
          onChange={(value) => setCode(value)}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            syntaxHighlighting: true,
          }}
        />
      </div>
    </div>
  );
}
