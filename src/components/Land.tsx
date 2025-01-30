"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { FaFolder } from "react-icons/fa6";
import { RxCornerBottomLeft } from "react-icons/rx";
import { FiFilePlus } from "react-icons/fi";
import CodeMirror from '@uiw/react-codemirror';
import { php } from '@codemirror/lang-php';
import { dracula } from '@uiw/codemirror-theme-dracula';
import styles from "../app/page.module.css";

type Project = {
  title: string;
  code: string;
};

export default function Land() {
  const { data: session } = useSession();
  const [isActive, setIsActive] = useState(false);
  const [code, setCode] = useState('<?php\n// Write your PHP code here...\n?>');
  const [output, setOutput] = useState('');
  const [projects, setProjects] = useState<{ [key: number]: Project }>({});
  const [currentKey, setCurrentKey] = useState<number | null>(null);
  const [isNewProject, setIsNewProject] = useState(true); // Initially true
  const [newKey, setNewKey] = useState<number | null>(null);
  let keyCounter = Object.keys(projects).length;

  useEffect(() => {
    if (session?.user?.email) {
      fetchProjects(session.user.email);
    }
  }, [session]);

  const fetchProjects = async (email: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/projects?email=${email}`);
      if (!response.ok) {
        throw new Error(`Error fetching projects: ${response.statusText}`);
      }
      const data: { [key: number]: Project } = await response.json();
      setProjects(data);
      keyCounter = Object.keys(data).length; // Set the keyCounter based on fetched projects
      console.log('Projects fetched:', data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleAuthButtonClick = () => {
    setIsActive(!isActive);
    if (session) {
      signOut();
    } else {
      signIn('google');
    }
  };

  const runCode = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, email: session?.user?.email, key: currentKey }), // Include key
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error);
      }
      setOutput(result.output);
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      } else {
        setOutput('An unknown error occurred.');
      }
    }
  };

  const handleProjectClick = (key: number) => {
    setCurrentKey(key);
    setIsNewProject(false); // Mark as not a new project
    console.log('Project clicked. isNewProject:', false); // Log the new state after setting
    setCode(projects[key].code);
  };

  const handleNewProjectClick = () => {
    setIsNewProject(true);
    console.log('New project clicked. isNewProject:', true);
    
    const keys = Object.keys(projects).map(Number);
    const uniqueKey = keys.length > 0 ? Math.max(...keys) + 1 : 1;
  
    setNewKey(uniqueKey); 
    setCurrentKey(uniqueKey);
    setCode('<?php\n// Write your PHP code here...\n?>'); // Reset CodeMirror to original state
  };
  

  const saveCode = () => {
    console.log('Save button clicked. isNewProject before saving:', isNewProject);
    if (isNewProject) {
      saveNewProject();
    } else {
      saveExistingProject();
    }
    console.log('Save button clicked. isNewProject after saving:', isNewProject);
  };
  
  const saveNewProject = async () => {
    const payload = { code, email: session?.user?.email, key: newKey }; // Construct the payload
    console.log('Creating new project with payload:', payload); // Log the payload
  
    try {
      const response = await fetch('http://localhost:3001/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error);
      }
  
      setOutput(result.message || 'New project saved successfully!');
      fetchProjects(session?.user?.email as string);
  
      if (result.key) {
        setIsNewProject(false);
        setCurrentKey(result.key);
        console.log('New project saved successfully. isNewProject:', false);
        setNewKey(null);
      }
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      } else {
        setOutput('An unknown error occurred.');
      }
    }
  };
  
  
  const saveExistingProject = async () => {
    try {
      console.log('Save existing project. isNewProject:', isNewProject);
      const response = await fetch('http://localhost:3001/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, email: session?.user?.email, key: currentKey }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error);
      }
  
      setOutput(result.message || 'Code saved successfully!');
      fetchProjects(session?.user?.email as string);
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      } else {
        setOutput('An unknown error occurred.');
      }
    }
  };  
  
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
              <h2 onClick={handleNewProjectClick}><FiFilePlus /></h2>
            </div>
            <div className={styles.savesContent}>
              {Object.keys(projects).map((key) => (
                <h2
                  key={key}
                  className={styles.saveItem}
                  onClick={() => handleProjectClick(Number(key))}
                >
                  <RxCornerBottomLeft /> {projects[Number(key)].title}
                </h2>
              ))}
            </div>
          </div>
          <div className={styles.codeBase}>
            <div className={styles.codeBaseHeader}>
              <button className={styles.runButton} onClick={runCode}>Run Code</button>
              <button className={styles.saveButton} onClick={saveCode}>Save Code</button>
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
