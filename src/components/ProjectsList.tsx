import { FaFolder } from "react-icons/fa6";
import { FiFilePlus } from "react-icons/fi";
import { RxCornerBottomLeft } from "react-icons/rx";
import { TbEdit } from "react-icons/tb";
import { FaCheck } from "react-icons/fa";
import styles from "../app/page.module.css";

interface Project {
  title: string;
  code: string;
}

interface ProjectsListProps {
  projects: { [key: number]: Project };
  handleNewProjectClick: () => void;
  handleProjectClick: (key: number) => void;
  modifyTitle: (key: number, newTitle: string) => void;
  setEditTitleKey: (key: number | null) => void;
  setNewTitle: (title: string) => void;
  newTitle: string;
  editTitleKey: number | null;
}

export default function ProjectsList({
  projects,
  handleNewProjectClick,
  handleProjectClick,
  modifyTitle,
  setEditTitleKey,
  setNewTitle,
  newTitle,
  editTitleKey
}: ProjectsListProps) {
  return (
    <div className={styles.savesContainer}>
      <div className={styles.savesHeader}>
        <h2><FaFolder /> Projects</h2>
        <h2 className={styles.addFile} onClick={handleNewProjectClick}><FiFilePlus /></h2>
      </div>
      <div className={styles.savesContent}>
        {Object.keys(projects).map((key) => (
          <div key={key} className={styles.saveItemContainer}>
            {editTitleKey === Number(key) ? (
              <>
                <input
                  className={styles.editInput}
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <button
                  className={styles.editButton}
                  onClick={() => {
                    modifyTitle(Number(key), newTitle);
                    setEditTitleKey(null);
                  }}
                >
                  <FaCheck />
                </button>
              </>
            ) : (
              <>
                <h2
                  className={styles.saveItem}
                  onClick={() => handleProjectClick(Number(key))}
                >
                  <RxCornerBottomLeft /> {projects[Number(key)].title} 
                  <TbEdit
                    className={styles.editIcon}
                    onClick={() => {
                      setEditTitleKey(Number(key));
                      setNewTitle(projects[Number(key)].title);
                    }}
                  />
                </h2>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
