import React, { Dispatch, SetStateAction } from "react";
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
  projects: { [key: string]: Project };
  handleNewProjectClick: () => void;
  handleProjectClick: (key: string) => void;
  modifyTitle: (key: string, newTitle: string) => void;
  newTitle: string;
  setNewTitle: (title: string) => void;
  editTitleKey: string | null;
  setEditTitleKey: Dispatch<SetStateAction<string | null>>;
}

export default function ProjectsList({
  projects,
  handleNewProjectClick,
  handleProjectClick,
  modifyTitle,
  newTitle,
  setNewTitle,
  editTitleKey,
  setEditTitleKey,
}: ProjectsListProps) {
  return (
    <div className={styles.savesContainer}>
      <div className={styles.savesHeader}>
        <h2>
          <FaFolder /> Projects
        </h2>
        <h2 className={styles.addFile} onClick={handleNewProjectClick}>
          <FiFilePlus />
        </h2>
      </div>
      <div className={styles.savesContent}>
        {Object.keys(projects).map((key) => (
          <div key={key} className={styles.saveItemContainer}>
            {editTitleKey === key ? (
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
                    modifyTitle(key, newTitle);
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
                  onClick={() => handleProjectClick(key)}
                >
                  <RxCornerBottomLeft /> {projects[key].title}
                  <TbEdit
                    className={styles.editIcon}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the click from triggering handleProjectClick
                      setEditTitleKey(key);
                      setNewTitle(projects[key].title);
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
