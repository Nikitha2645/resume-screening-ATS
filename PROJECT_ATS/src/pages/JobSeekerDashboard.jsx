import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import UploadBox from '../components/UploadBox';
import SkillTags from '../components/SkillTags';
import styles from './JobSeeker.module.css';

const DashboardContent = ({ uploadedFile, onUpload, atsScore, isAnalyzing, analysis, uploadError, activeJob, setActiveJob, resetForm }) => {
  const [userName, setUserName] = useState('');
  const [jobs, setJobs] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async (userId) => {
    try {
        const res = await axios.get(`http://localhost:8080/api/notifications/${userId}`);
        setNotifications(res.data);
    } catch (err) {
        console.error("Notifications err:", err);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
        try {
            const res = await axios.get('http://localhost:8080/jobs');
            setJobs(res.data);
        } catch (err) {
            console.error('Error fetching jobs:', err);
        }
    };
    
    const fetchMyApplications = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:8080/api/applications`);
            setUserApplications(res.data.filter(app => app.seekerId === userId));
        } catch (err) {
            console.error('Error fetching applications:', err);
        }
    };

    const currentUser = JSON.parse(localStorage.getItem('user'));
    fetchJobs();
    if (currentUser && currentUser.id) {
        fetchMyApplications(currentUser.id);
    }
  }, [atsScore]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser) {
      if (currentUser.name && currentUser.name.trim() !== '') {
        const nameVal = currentUser.name.trim();
        setUserName(nameVal.charAt(0).toUpperCase() + nameVal.slice(1));
      }
      fetchNotifications(currentUser.id);
    }
  }, []);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h2>Welcome back, {userName || 'User'}! 🚀</h2>
          <p>Find your next role and apply in real-time.</p>
        </div>
        <div style={{ position: 'relative' }}>
            <button 
                className={styles.notificationBtn}
                onClick={() => setShowNotifications(!showNotifications)}
            >
                🔔 {notifications.filter(n => !n.read).length > 0 && <span className={styles.notifBadge}>{notifications.filter(n => !n.read).length}</span>}
            </button>
            {showNotifications && (
                <div className={styles.notifDropdown}>
                    <h4>Notifications</h4>
                    {notifications.length === 0 ? <p>No notifications</p> : (
                        notifications.map(n => (
                            <div key={n.id} className={styles.notifItem}>
                                <p>{n.message}</p>
                                <small>{new Date(n.createdAt).toLocaleString()}</small>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.leftColumn}>
          <div className={styles.profileCard}>
            <div className={styles.avatarLarge}>
               {userName ? userName.charAt(0) : 'U'}
            </div>
            <h3 style={{ margin: '0 0 5px 0' }}>{userName}</h3>
            <p style={{ margin: 0, color: 'var(--text-gray)', fontSize: '0.9rem' }}>Job Seeker • {JSON.parse(localStorage.getItem('user'))?.email}</p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Available Opportunities</h3>
            <div className={styles.jobsList}>
              {jobs.length === 0 ? (
                <p style={{ color: 'var(--text-gray)' }}>No jobs available</p>
              ) : (
                jobs.map(job => {
                  const alreadyApplied = userApplications.some(app => app.jobId === job.id);
                  return (
                    <div key={job.id} className="job-card" style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary-orange)' }}>{job.title}</h4>
                          <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--text-gray)', fontWeight: '500' }}>{job.company}</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)' }}>📍 {job.location}</p>
                        </div>
                        <button 
                           onClick={() => {
                             if (!alreadyApplied) {
                               resetForm();
                               setActiveJob(job);
                             }
                           }}
                           disabled={alreadyApplied}
                           className={styles.applyBtn}
                           style={{ 
                             background: alreadyApplied ? '#f3f4f6' : 'var(--primary-orange)',
                             color: alreadyApplied ? '#9ca3af' : 'white',
                             border: 'none',
                             padding: '8px 16px',
                             borderRadius: '8px',
                             fontWeight: '600',
                             cursor: alreadyApplied ? 'not-allowed' : 'pointer'
                           }}
                        >
                           {alreadyApplied ? 'Applied' : 'Apply Now'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.2rem', fontSize: '1.1rem' }}>Recent Activity</h3>
            <div className={styles.appList}>
              {userApplications.slice(0, 3).map(app => (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{app.role || 'Job Role'}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-gray)' }}>{app.company || 'Company'}</p>
                  </div>
                  <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: app.status === 'SHORTLISTED' ? '#dcfce7' : app.status === 'REJECTED' ? '#fee2e2' : '#fef3c7', color: app.status === 'SHORTLISTED' ? '#166534' : app.status === 'REJECTED' ? '#991b1b' : '#92400e', fontWeight: 'bold' }}>
                    {app.status}
                  </span>
                </div>
              ))}
              {userApplications.length === 0 && <p style={{ color: '#888', fontSize: '0.9rem' }}>No recent applications.</p>}
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          {activeJob ? (
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '2px solid var(--primary-blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                   <h3 style={{ margin: '0 0 5px 0' }}>{activeJob.title}</h3>
                   <p style={{ margin: 0, color: 'var(--text-gray)' }}>{activeJob.company} • {activeJob.location}</p>
                </div>
                <button onClick={() => setActiveJob(null)} className={styles.textBtn}>Close</button>
              </div>

              {atsScore === null && !isAnalyzing ? (
                <div style={{ marginTop: '1.5rem' }}>
                    <div className="job-details-info" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                        <h4 style={{ color: 'var(--primary-blue)', marginBottom: '10px' }}>Job Overview</h4>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#4a5568', margin: '0 0 15px 0' }}>{activeJob.description || 'No description provided.'}</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <h5 style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>Required Skills</h5>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {(activeJob.skills || activeJob.requiredSkills || 'Not specified').split(',').map((s, i) => (
                                        <span key={i} style={{ fontSize: '0.7rem', padding: '3px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontWeight: 'bold' }}>{s.trim()}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h5 style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>Location & Deadline</h5>
                                <p style={{ margin: 0, fontSize: '0.85rem' }}>📍 {activeJob.location}</p>
                                <p style={{ margin: 0, fontSize: '0.85rem' }}>📅 Deadline: {activeJob.applicationDeadline || 'Open'}</p>
                            </div>
                        </div>
                    </div>

                    <h4 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #edf2f7', paddingBottom: '10px' }}>Submit Your Application</h4>
                    <div className={styles.applyForm}>
                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}><label>Full Name</label><input id="fullName" type="text" defaultValue={JSON.parse(localStorage.getItem('user'))?.name || ''} /></div>
                            <div className={styles.inputGroup}><label>Email ID</label><input id="email" type="email" defaultValue={JSON.parse(localStorage.getItem('user'))?.email || ''} /></div>
                            <div className={styles.inputGroup}><label>Phone</label><input id="phone" type="tel" /></div>
                            <div className={styles.inputGroup}><label>Education</label><select id="education"><option>Bachelors</option><option>Masters</option><option>PhD</option></select></div>
                        </div>
                        <div className={styles.inputGroup} style={{ marginTop: '1rem' }}><label>Core Skills</label><input id="skills" type="text" placeholder="Java, Python..." /></div>
                        <div style={{ marginTop: '2rem' }}><UploadBox onUpload={onUpload} /></div>
                        {uploadError && <p style={{ color: '#ef4444', marginTop: '1rem', textAlign: 'center' }}>{uploadError}</p>}
                    </div>
                </div>
              ) : (
                <div style={{ marginTop: '2rem', textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✅</div>
                    <h3 style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>Application Submitted!</h3>
                    <p style={{ color: 'var(--text-gray)', lineHeight: '1.6' }}>
                        Your resume has been successfully uploaded for {activeJob.title}. 
                        The recruiter will review it soon.
                    </p>
                    <button 
                        onClick={() => setActiveJob(null)} 
                        className={styles.primaryBtn}
                        style={{ marginTop: '2rem', width: 'auto', padding: '10px 30px' }}
                    >
                        Browse More Jobs
                    </button>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-gray)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
              <h3>Ready to get hired?</h3>
              <p>Select a job from the opportunities list on the left to start your application process.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AtsCheckerComponent = ({ onUpload, isAnalyzing, atsScore, analysis, uploadError }) => {
  const [selectedRole, setSelectedRole] = useState('Embedded Systems Engineer');
  const roles = [
    'Embedded Systems Engineer', 'VLSI Design Engineer', 'Software Engineer', 'Data Scientist', 'Frontend Developer',
    'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Cloud Architect', 'Cybersecurity Analyst',
    'Mobile App Developer', 'UI/UX Designer', 'Machine Learning Engineer', 'Blockchain Developer', 'QA Automation Engineer',
    'Analog Circuit Designer', 'Digital Design Engineer', 'FPGA Engineer', 'Hardware Engineer', 'Firmware Engineer',
    'Systems Architect', 'Database Administrator', 'Network Engineer', 'Security Engineer', 'Site Reliability Engineer',
    'Data Engineer', 'AI Research Scientist', 'Game Developer', 'Embedded Software Engineer', 'SoC Design Engineer',
    'Physical Design Engineer', 'Verification Engineer', 'Power Integrity Engineer', 'Signal Integrity Engineer',
    'Product Manager', 'Project Manager', 'Solutions Architect', 'Technical Lead', 'Scrum Master', 'Business Analyst',
    'ERP Consultant', 'Salesforce Developer', 'SAP Consultant', 'Cloud Security Engineer', 'Penetration Tester',
    'IoT Specialist', 'Robotics Engineer', 'Automation Engineer', 'Computer Vision Engineer', 'NLP Engineer',
    'Big Data Architect', 'Business Intelligence Developer', 'Application Security Engineer', 'Compliance Officer',
    'DevSecOps Engineer', 'IT Manager', 'CTO', 'Engineering Manager', 'Test Engineer', 'Reliability Engineer',
    'Validation Engineer', 'Manufacturing Engineer', 'Supply Chain Analyst', 'Logistics Coordinator',
    'Human Resources Manager', 'Talent Acquisition Specialist', 'Finance Analyst', 'Legal Counsel'
  ];

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h2 className="page-title">ATS Score Checker 📊</h2>
        <p className="page-subtitle">Check your real ATS score against industry roles</p>
      </div>

      <div className="mainGrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Analyze Your Resume</h3>
          <div className={styles.inputGroup} style={{ marginBottom: '1.5rem' }}>
            <label>Target Role</label>
            <select 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          
          <UploadBox onUpload={(file) => onUpload(file, selectedRole)} />
          {uploadError && <p style={{ color: '#ef4444', marginTop: '1rem', textAlign: 'center' }}>{uploadError}</p>}
          
          {isAnalyzing && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <div className={styles.spinner}></div>
              <p>Calculating ATS match score...</p>
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          {atsScore !== null ? (
            <div style={{ textAlign: 'center' }}>
               <div className={styles.scoreCard} style={{ margin: '0 auto' }}>
                  <div className={styles.progressRing} style={{ width: '150px', height: '150px' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary-orange)' }}>{atsScore}%</div>
                  </div>
                  <h3 style={{ marginTop: '1rem', color: 'var(--primary-orange)' }}>Match Score</h3>
               </div>
               
               <div style={{ marginTop: '2rem', textAlign: 'left' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Analysis Details</h4>
                  <SkillTags title="Matched Skills" skills={analysis.matched} type="matched" />
                  <SkillTags title="Missing Keywords" skills={analysis.missing} type="missing" />
                  
                  <div style={{ marginTop: '1.5rem', background: '#fff7ed', padding: '1rem', borderRadius: '8px', border: '1px solid #ffedd5' }}>
                    <h5 style={{ margin: '0 0 10px 0', color: '#9a3412' }}>Recommendations ✨</h5>
                    <ul style={{ margin: '0 0 15px 0', paddingLeft: '20px', fontSize: '0.85rem', color: '#9a3412' }}>
                      {analysis.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                    
                    {analysis.improvementPlan && (
                      <div style={{ borderTop: '1px solid #ffedd5', paddingTop: '10px' }}>
                        <h5 style={{ margin: '0 0 10px 0', color: '#9a3412' }}>Detailed Improvement Plan 📄</h5>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#9a3412', lineHeight: '1.5', textAlign: 'left' }}>
                          {analysis.improvementPlan}
                        </p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-gray)' }}>
               <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📈</div>
               <h3>Calculate Your Score</h3>
               <p style={{ textAlign: 'center' }}>Upload your resume and select a role to see how well you match industry standards.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MyResumeComponent = ({ uploadedFile }) => {
  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h2 className="page-title">My Resume</h2>
        <p className="page-subtitle">Manage your uploaded resume and details</p>
      </div>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        {uploadedFile ? (
          <div className={styles.resumeDetailsBox}>
            <div className={styles.resumeAvatar}>📋</div>
            <div className={styles.resumeInfo}>
              <h3>{uploadedFile.name}</h3>
              <p>Uploaded on: {new Date().toLocaleDateString()}</p>
              <div className={styles.fileSize}>Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
            <button className={styles.secondaryBtn} onClick={() => {
                const fileUrl = localStorage.getItem('lastResumeUrl');
                if (fileUrl) window.open(`http://localhost:8080${fileUrl}`, '_blank');
                else alert("Please upload a resume first.");
            }}>View Resume</button>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📁</div>
            <h3>No Resume Uploaded Yet</h3>
            <p>Please upload your resume from the dashboard to see details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ApplicationsComponent = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      const fetchApps = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;
        try {
          const res = await axios.get('http://localhost:8080/api/applications');
          setApps(res.data.filter(a => a.seekerId === user.id));
        } catch (err) { console.error(err); } finally { setLoading(false); }
      };
      fetchApps();
    }, []);
    return (
      <div>
        <div className="page-header" style={{ marginBottom: '2rem' }}><h2 className="page-title">My Applications</h2><p className="page-subtitle">Track your job applications across different companies</p></div>
        <div className="glass-panel" style={{ padding: '2rem' }}>{loading ? <p>Loading...</p> : (
            <div className={styles.appListFull}>
              {apps.map(app => (
                <div key={app.id} className={styles.appCard}>
                  <div className={styles.appCardLeft}><div className={styles.companyLogo}>{(app.company || 'C').charAt(0)}</div><div><h4>{app.role || 'Job Role'}</h4><p>{app.company || 'Company Name'}</p></div></div>
                  <div className={styles.appStatus}><span className={styles.badge} style={{ background: '#E0F2FE', color: '#0284C7' }}>{app.status}</span></div>
                </div>
              ))}
              {apps.length === 0 && <p>No applications yet.</p>}
            </div>
        )}</div>
      </div>
    );
};

const NotificationsComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchNotifications = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;
      try {
        const res = await axios.get(`http://localhost:8080/api/notifications/${user.id}`);
        setNotifications(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchNotifications();
  }, []);
  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}><h2 className="page-title">Notifications 🔔</h2><p className="page-subtitle">Stay updated on your application status</p></div>
      <div className="glass-panel" style={{ padding: '2rem' }}>{loading ? <p>Loading...</p> : (
          <div className={styles.notificationList}>
            {notifications.map(n => (
              <div key={n.id} className={styles.notificationCard} style={{ padding: '1.2rem', background: n.read ? '#fff' : '#f0f9ff', borderBottom: '1px solid #edf2f7', borderRadius: '8px', marginBottom: '1rem', borderLeft: n.read ? 'none' : '4px solid var(--primary-blue)' }}>
                <p style={{ margin: 0, fontWeight: n.read ? 'normal' : '600' }}>{n.message}</p>
                <small>{new Date(n.createdAt).toLocaleString()}</small>
              </div>
            ))}
            {notifications.length === 0 && <p style={{ textAlign: 'center' }}>No notifications yet.</p>}
          </div>
      )}</div>
    </div>
  );
};

const JobSeekerDashboard = () => {
  const [atsScore, setAtsScore] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [analysis, setAnalysis] = useState({ matched: [], missing: [], recommendations: [] });
  const [uploadError, setUploadError] = useState('');

  // Standalone analysis states
  const [standaloneScore, setStandaloneScore] = useState(null);
  const [standaloneAnalysis, setStandaloneAnalysis] = useState({ matched: [], missing: [], recommendations: [] });
  const [standaloneError, setStandaloneError] = useState('');

  const resetApplicationState = () => {
    setAtsScore(null);
    setUploadError('');
  };

  const handleUpload = async (file, role = null) => {
    const isStandalone = role !== null;
    const targetSetScore = isStandalone ? setStandaloneScore : setAtsScore;
    const targetSetAnalysis = isStandalone ? setStandaloneAnalysis : setAnalysis;
    const targetSetError = isStandalone ? setStandaloneError : setUploadError;

    try {
        if (!file) { targetSetError("No file selected"); return; }
        setIsAnalyzing(true);
        targetSetError("");

        const formData = new FormData();
        formData.append("file", file);
        if (activeJob?.id && !isStandalone) formData.append("jobId", activeJob.id);
        
        const currentUser = JSON.parse(localStorage.getItem('user'));
        formData.append("userId", currentUser?.id || 0);
        formData.append("fullName", document.getElementById('fullName')?.value || currentUser?.name || 'Candidate');
        formData.append("email", document.getElementById('email')?.value || currentUser?.email || '');
        formData.append("phone", document.getElementById('phone')?.value || '');
        formData.append("education", document.getElementById('education')?.value || 'Bachelors');
        formData.append("skills", document.getElementById('skills')?.value || '');
        
        // If standalone, the backend needs a role to calculate against
        if (isStandalone) formData.append("targetRole", role);

        const response = await axios.post("http://localhost:8080/resume/upload", formData);

        if (response.data.success !== false) {
            targetSetScore(response.data.score || 0);
            
            const processSkills = (skills) => {
                if (Array.isArray(skills)) return skills;
                if (typeof skills === 'string') return skills.split(',').map(s => s.trim());
                return [];
            };

            targetSetAnalysis({
              matched: processSkills(response.data.matchedSkills),
              missing: processSkills(response.data.missingSkills),
              recommendations: response.data.recommendations || ["Ready for submission!"],
              improvementPlan: response.data.improvementPlan || ""
            });
            if (!isStandalone) setUploadedFile(file);
            if (response.data.fileUrl) localStorage.setItem('lastResumeUrl', response.data.fileUrl);
        } else {
            targetSetError(response.data.message || "Upload failed");
        }
    } catch (error) {
        console.error(error);
        const data = error.response?.data;
        const errMsg = data?.message || data?.error || (isStandalone ? "Analysis Failed" : "Upload failed");
        targetSetError(errMsg);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const menuItems = [
    { path: '/seeker', label: 'Dashboard', icon: 'dashboard' },
    { path: '/seeker/ats-checker', label: 'ATS Score Checker', icon: 'score' },
    { path: '/seeker/resume', label: 'My Resume', icon: 'my_resume' },
    { path: '/seeker/applications', label: 'Applications', icon: 'applications' },
  ];

  return (
    <div className="layout">
      <Sidebar menuItems={menuItems} role="Job Seeker" />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardContent uploadedFile={uploadedFile} onUpload={handleUpload} atsScore={atsScore} isAnalyzing={isAnalyzing} analysis={analysis} uploadError={uploadError} activeJob={activeJob} setActiveJob={setActiveJob} resetForm={resetApplicationState} />} />
          <Route path="/ats-checker" element={<AtsCheckerComponent onUpload={handleUpload} isAnalyzing={isAnalyzing} atsScore={standaloneScore} analysis={standaloneAnalysis} uploadError={standaloneError} />} />
          <Route path="/resume" element={<MyResumeComponent uploadedFile={uploadedFile} />} />
          <Route path="/applications" element={<ApplicationsComponent />} />
          <Route path="/notifications" element={<NotificationsComponent />} />
          <Route path="*" element={<Navigate to="/seeker" />} />
        </Routes>
      </main>
    </div>
  );
};

export default JobSeekerDashboard;
