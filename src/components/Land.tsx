import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Header from "./Header";
import ProjectsList from "./ProjectsList";
import Editor from "./Editor";
import Output from "./Output";
import styles from "../app/page.module.css";

type Project = {
  title: string;
  code: string;
};

export default function Land() {
  const { data: session } = useSession();
  const [isActive, setIsActive] = useState(false);
  const [code, setCode] = useState('<?php\n//Your php code goes here...\n//To save code first press on new file...\n?>');
  const [output, setOutput] = useState('');
  const [projects, setProjects] = useState<{ [key: number]: Project }>({});
  const [currentKey, setCurrentKey] = useState<number | null>(null);
  const [isNewProject, setIsNewProject] = useState(true);
  const [newKey, setNewKey] = useState<number | null>(null);
  const [editTitleKey, setEditTitleKey] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');

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
    } catch (error) {
      setOutput(`Error fetching projects: ${error}`);
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
        body: JSON.stringify({ code, email: session?.user?.email, key: currentKey }),
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
    setIsNewProject(false);
    setCode(projects[key].code);
    setNewTitle(projects[key].title);
  };

  const handleNewProjectClick = () => {
    setIsNewProject(true);

    const keys = Object.keys(projects).map(Number);
    const uniqueKey = keys.length > 0 ? Math.max(...keys) + 1 : 1;

    setNewKey(uniqueKey);
    setCurrentKey(uniqueKey);
    setCode('<?php\n//This is a new file.\n//Start by writing your php code...\n?>');
    setNewTitle('');
  };

  const saveCode = () => {
    if (isNewProject) {
      saveNewProject();
    } else {
      saveExistingProject();
    }
  };

  const saveNewProject = async () => {
    if (newKey === null) {
      setOutput('Error: No project key available to save.');
      return;
    }
  
    const payload = { code, email: session?.user?.email, key: newKey };
  
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
    if (currentKey === null) {
      setOutput('Error: No project selected to save.');
      return;
    }
  
    try {
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

  const modifyTitle = async (key: number, newTitle: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/modify-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session?.user?.email, key, newTitle }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setOutput(result.message || 'Title updated successfully!');
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
      <Header isActive={isActive} handleAuthButtonClick={handleAuthButtonClick} />
      <main className={styles.main}>
        <div className={styles.mainRow}>
          <ProjectsList
            projects={projects}
            handleNewProjectClick={handleNewProjectClick}
            handleProjectClick={handleProjectClick}
            modifyTitle={modifyTitle}
            setEditTitleKey={setEditTitleKey}
            setNewTitle={setNewTitle}
            newTitle={newTitle}
            editTitleKey={editTitleKey}
          />
          <Editor code={code} setCode={setCode} runCode={runCode} saveCode={saveCode} />
        </div>
        <Output output={output} />
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
