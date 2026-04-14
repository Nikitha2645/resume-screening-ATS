import React from 'react';
import styles from './ATSScoreCircle.module.css';

const ATSScoreCircle = ({ score, size = 120 }) => {
  const radius = (size - 10) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = 'var(--primary-orange)';
  if (score >= 90) color = '#10B981'; // Green
  else if (score < 70) color = '#EF4444'; // Red

  return (
    <div className={styles.container} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={styles.svg}>
        <circle
          className={styles.bgCircle}
          stroke="#E5E7EB"
          strokeWidth="8"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={styles.progressCircle}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ 
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset
          }}
        />
      </svg>
      <div className={styles.textContainer}>
        <span className={styles.score} style={{ color }}>{score}</span>
        <span className={styles.label}>/ 100</span>
      </div>
    </div>
  );
};

export default ATSScoreCircle;
