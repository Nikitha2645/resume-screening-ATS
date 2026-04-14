import React from 'react';
import styles from './StatCard.module.css';

const StatCard = ({ title, value, icon, color = 'var(--primary-orange)' }) => {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <h4 className={styles.title}>{title}</h4>
        <div className={styles.value}>{value}</div>
      </div>
      <div className={styles.iconWrapper} style={{ backgroundColor: `${color}15`, color: color }}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
