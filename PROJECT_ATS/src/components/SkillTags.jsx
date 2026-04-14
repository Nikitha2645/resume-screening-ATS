import React from 'react';
import styles from './SkillTags.module.css';

const SkillTags = ({ title, skills = [], type = 'matched' }) => {
  return (
    <div className={styles.container}>
      {title && <h4 className={styles.title}>{title}</h4>}
      <div className={styles.tagsContainer}>
        {skills.map((skill, index) => (
          <span 
            key={index} 
            className={`${styles.tag} ${type === 'matched' ? styles.matched : styles.missing}`}
          >
            {skill}
          </span>
        ))}
        {skills.length === 0 && <span className={styles.empty}>None found</span>}
      </div>
    </div>
  );
};

export default SkillTags;
