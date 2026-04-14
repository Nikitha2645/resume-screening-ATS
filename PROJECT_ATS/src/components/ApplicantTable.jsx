import React from 'react';
import axios from 'axios';
import styles from './ApplicantTable.module.css';

const ApplicantTable = ({ applicants, onRowClick, onStatusUpdate }) => {
  console.log("Applicants in Table:", applicants);

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'SHORTLISTED': return styles.statusGreen;
      case 'INTERVIEWED': return styles.statusBlue;
      case 'REJECTED': return styles.statusRed;
      case 'APPLIED': return styles.statusOrange;
      default: return styles.statusOrange;
    }
  };

  const handleResumeView = (fileUrl) => {
    if (!fileUrl) {
        console.error("No file URL provided");
        alert("No resume available for this applicant.");
        return;
    }
    console.log("Opening resume:", fileUrl);
    const formattedUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
    window.open(`http://localhost:8080${formattedUrl}`, "_blank");
  };

  const handleStatusAction = async (id, newStatus) => {
    if (!onStatusUpdate) return;
    try {
        await axios.put(`http://localhost:8080/api/applications/${id}/status`, { status: newStatus });
        onStatusUpdate(id, newStatus);
    } catch (err) {
        console.error("Error updating status:", err);
        alert("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase() || 'APPLIED';
    let className = styles.statusApplied;
    if (s === 'SHORTLISTED') className = styles.statusReview;
    if (s === 'INTERVIEWED') className = styles.statusInterview;
    if (s === 'REJECTED') className = styles.statusRejected;
    
    return <span className={`${styles.badge} ${className}`}>{status || 'Applied'}</span>;
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Stage</th>
            <th>Applied Date</th>
            <th>Keywords / Tags</th>
            <th>ATS Match</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applicants.length === 0 ? (
            <tr>
              <td colSpan="6" className={styles.emptyCell}>
                No candidates found matching your criteria.
              </td>
            </tr>
          ) : (
            applicants.map((app) => (
              <tr 
                key={app.id} 
                onClick={() => onRowClick && onRowClick(app)}
                className={styles.clickableRow}
              >
                <td className={styles.nameCell}>
                  <div className={styles.avatar}>{app.studentName?.charAt(0) || 'A'}</div>
                  <div className={styles.nameInfo}>
                    <div className={styles.mainName}>{app.studentName}</div>
                    <div className={styles.subText}>{app.email}</div>
                  </div>
                </td>
                <td>{getStatusBadge(app.status)}</td>
                <td className={styles.dateCell}>{app.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td>
                  <div className={styles.tagsContainer}>
                    {app.skills ? app.skills.split(',').slice(0, 3).map((s, i) => (
                      <span key={i} className={styles.skillTag}>{s.trim()}</span>
                    )) : <span className={styles.emptyTag}>-</span>}
                  </div>
                </td>
                <td>
                  <div className={styles.scoreContainer}>
                    <div className={styles.scoreProgress}>
                      <div 
                        className={styles.scoreLevel} 
                        style={{ 
                          width: `${app.score}%`,
                          backgroundColor: app.score >= 80 ? '#10b981' : app.score >= 60 ? '#f59e0b' : '#ef4444'
                        }}
                      ></div>
                    </div>
                    <span className={styles.scoreVal}>{app.score}%</span>
                  </div>
                </td>
                <td className={styles.actionCell} onClick={(e) => e.stopPropagation()}>
                   <button 
                    className={styles.viewLink}
                    onClick={() => handleResumeView(app.fileUrl)}
                  >Resume</button>
                  {app.status === 'APPLIED' && (
                    <>
                      <button className={styles.checkBtn} onClick={() => handleStatusAction(app.id, 'SHORTLISTED')}>Review</button>
                      <button className={styles.rejectBtn} onClick={() => handleStatusAction(app.id, 'REJECTED')}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicantTable;
