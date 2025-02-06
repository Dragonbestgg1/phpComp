import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Header from './Header';
import ProjectsList from './ProjectsList';
import Editor from './Editor';
import Output from './Output';
import styles from '../page.module.css';

type Project = {
  title: string;
  code: string;
};

export default function Land() {
  const [isActive, setIsActive] = useState(false);
  const [code, setCode] = useState('<?php\n//Your PHP code goes here...\n//To save code, first press on "New File"...\n?>');
  const [output, setOutput] = useState('');
  const [projects, setProjects] = useState<{ [key: string]: Project }>({});
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [isNewProject, setIsNewProject] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [editTitleKey, setEditTitleKey] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const { data: session, status } = useSession();

  const fetchProjects = useCallback(async () => {
    if (!session?.user?.email) {
      setOutput("Error: No active session.");
      return;
    }
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error(`Error fetching projects: ${response.statusText}`);
      }
      const data = await response.json();
      setProjects(data.projects || {});
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchProjects();
    }
  }, [session, status, fetchProjects]);

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
      const response = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || "Error running code");
      }
  
      setOutput(result.output);
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      } else {
        setOutput("An unknown error occurred.");
      }
    }
  };

  const handleProjectClick = (key: string) => {
    setCurrentKey(key);
    setIsNewProject(false);
    setCode(projects[key].code);
    setNewTitle(projects[key].title);
  };

  const handleNewProjectClick = () => {
    setIsNewProject(true);

    const keys = Object.keys(projects).map(Number);
    const uniqueKey = keys.length > 0 ? (Math.max(...keys) + 1).toString() : "1";

    setNewKey(uniqueKey);
    setCurrentKey(uniqueKey);
    setCode(
      '<?php\n//This is a new file.\n//Start by writing your PHP code...\n?>'
    );
    setNewTitle("");
  };

  const saveCode = () => {
    if (isNewProject) {
      saveNewProject();
    } else {
      saveExistingProject();
    }
  };

  const saveNewProject = async () => {
    if (!session?.user?.email) {
      setOutput("Error: No active session.");
      return;
    }
    if (newKey === null) {
      setOutput("Error: No project key available to save.");
      return;
    }

    const payload = { code, key: newKey, title: newTitle || "New Project" };

    try {
      const response = await fetch("/api/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error saving new project");
      }

      setOutput(result.message || "New project saved successfully!");
      fetchProjects();

      if (result.key) {
        setIsNewProject(false);
        setCurrentKey(result.key);
        setNewKey(null);
      }
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      } else {
        setOutput("An unknown error occurred.");
      }
    }
  };

  const saveExistingProject = async () => {
    if (!session?.user?.email) {
      setOutput("Error: No active session.");
      return;
    }
    if (currentKey === null) {
      setOutput("Error: No project selected to save.");
      return;
    }

    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          key: currentKey,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error saving project");
      }

      setOutput(result.message || "Code saved successfully!");
      fetchProjects();
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      } else {
        setOutput("An unknown error occurred.");
      }
    }
  };

  const modifyTitle = async (key: string, newTitle: string) => {
    try {
      const response = await fetch("/api/modify-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, newTitle }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error modifying title");
      }

      setOutput(result.message || "Title updated successfully!");
      fetchProjects();
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      } else {
        setOutput("An unknown error occurred.");
      }
    }
  };

  return (
    <div className={styles.page}>
      <Header
        isActive={isActive}
        handleAuthButtonClick={handleAuthButtonClick}
      />
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
          <Editor
            code={code}
            setCode={setCode}
            runCode={runCode}
            saveCode={saveCode}
          />
        </div>
        <Output output={output} />
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
