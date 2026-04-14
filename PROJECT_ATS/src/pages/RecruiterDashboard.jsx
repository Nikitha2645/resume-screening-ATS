import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import ApplicantTable from '../components/ApplicantTable';
import { IconUsers, IconBriefcase, IconFileText } from '../components/Icons';
import styles from './Recruiter.module.css';

const DashboardContent = () => {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApps: 0,
    shortlisted: 0,
    rejected: 0
  });
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const fetchData = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    setLoading(true);
    try {
      const [appRes, statRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/recruiter/applications/${user.id}`),
        axios.get(`http://localhost:8080/api/recruiter/stats/${user.id}`)
      ]);
      setApplicants(appRes.data);
      setStats(statRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = (id, newStatus) => {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    // Re-fetch stats to update header cards
    const user = JSON.parse(localStorage.getItem('user'));
    axios.get(`http://localhost:8080/api/recruiter/stats/${user.id}`).then(res => setStats(res.data));
  };

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = app.studentName?.toLowerCase().includes(search.toLowerCase()) || 
                          app.role?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || app.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h2>Recruiter Pipeline</h2>
          <p>Review and manage candidates for your active roles.</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard title="Active Jobs" value={stats.activeJobs} icon={<IconBriefcase size={24} />} color="var(--primary-blue)" />
        <StatCard title="Applications" value={stats.totalApps} icon={<IconFileText size={24} />} color="var(--primary-orange)" />
        <StatCard title="Shortlisted" value={stats.shortlisted} icon={<IconUsers size={24} />} color="#10b981" />
        <StatCard title="Rejected" value={stats.rejected} icon={<IconUsers size={24} />} color="#ef4444" />
      </div>

      <div className={styles.grid}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className={styles.sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h3 style={{ margin: 0 }}>Applicants List</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                {filteredApplicants.length} Candidates
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input 
                    type="text" 
                    placeholder="Search by name or role..." 
                    className={styles.searchInput}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select 
                    className={styles.filterSelect}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="ALL">All Status</option>
                    <option value="APPLIED">Applied</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>
          </div>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Fetching recruitment data...</p>
            </div>
          ) : applicants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
               <IconFileText size={48} color="#e2e8f0" />
               <h3 style={{ marginTop: '1rem', color: 'var(--text-gray)' }}>No applicants yet</h3>
               <p style={{ color: 'var(--text-light)' }}>Applicants for your jobs will appear here.</p>
            </div>
          ) : (
            <ApplicantTable 
                applicants={filteredApplicants} 
                onRowClick={(app) => setSelectedApplicant(app)} 
                onStatusUpdate={handleStatusUpdate}
            />
          )}
        </div>
      </div>

      {selectedApplicant && (
        <div className={styles.modalOverlay} onClick={() => setSelectedApplicant(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedApplicant(null)}>×</button>
            <div style={{ paddingRight: '2rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '0.2rem', color: 'var(--text-dark)' }}>{selectedApplicant.studentName}</h3>
              <p style={{ margin: 0, color: 'var(--text-gray)', fontSize: '0.9rem' }}>{selectedApplicant.role} • {selectedApplicant.email}</p>
            </div>
            
            <div className={styles.applicantDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Education</span>
                <span className={styles.detailValue}>{selectedApplicant.education || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>ATS Core Match</span>
                <span className={styles.detailValue} style={{ color: 'var(--primary-blue)', fontSize: '1.2rem', fontWeight: '800' }}>{selectedApplicant.score}%</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Current Status</span>
                <span className={`${styles.statusBadge} ${selectedApplicant.status === 'SHORTLISTED' ? styles.statusGreen : selectedApplicant.status === 'REJECTED' ? styles.statusRed : styles.statusOrange}`}>
                    {selectedApplicant.status}
                </span>
              </div>
               <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '1rem', color: 'var(--primary-blue)', fontWeight: 'bold' }}>ATS Calculation Report</span>
                  <span style={{ background: 'white', border: '2px solid var(--primary-blue)', color: 'var(--primary-blue)', padding: '4px 12px', borderRadius: '20px', fontWeight: '800', fontSize: '0.9rem' }}>
                    {selectedApplicant.score}% Match
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 'bold', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Matched Keywords ✅</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {selectedApplicant.matchedSkills ? selectedApplicant.matchedSkills.split(',').map((s, i) => (
                                <span key={i} style={{ background: '#dcfce7', color: '#065f46', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>{s.trim()}</span>
                            )) : <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>No matches</span>}
                        </div>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 'bold', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Missing Keywords ❌</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {selectedApplicant.missingSkills ? selectedApplicant.missingSkills.split(',').map((s, i) => (
                                <span key={i} style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', border: '1px solid #fecaca' }}>{s.trim()}</span>
                            )) : <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>None missing</span>}
                        </div>
                    </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  className={styles.modalActionBtn}
                  onClick={() => {
                    if (selectedApplicant.fileUrl) {
                      window.open(`http://localhost:8080${selectedApplicant.fileUrl}`, '_blank');
                    } else {
                      alert("No resume available.");
                    }
                  }}
                >
                  <IconFileText size={18} /> View Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PostJobComponent = () => {
  const [isPosting, setIsPosting] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', location: '', skills: '', deadline: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handlePostJob = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        setError('You must be logged in to post a job');
        return;
    }

    setIsPosting(true);
    setSuccess('');
    setError('');
    
    try {
      await axios.post(`http://localhost:8080/jobs?recruiterId=${user.id}`, {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        requiredSkills: formData.skills,
        applicationDeadline: formData.deadline
      });
      setSuccess('Job posted successfully! It will now appear in your dashboard.');
      setFormData({ title: '', description: '', location: '', skills: '', deadline: '' });
    } catch (err) {
      console.error('Error posting job:', err.response?.data || err);
      setError(err.response?.data?.message || err.message || 'Failed to post job');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', margin: '2rem auto' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Post a New Job</h3>
      {success && <div style={{ color: '#10B981', marginBottom: '1rem' }}>{success}</div>}
      {error && <div style={{ color: '#EF4444', marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handlePostJob}>
        <div className={styles.formGroup}>
          <label>Job Title</label>
          <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Senior Frontend Developer" style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
        </div>
        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Job description..." rows="4" style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}></textarea>
        </div>
        <div className={styles.formGroup}>
          <label>Required Skills (comma separated)</label>
          <input type="text" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} placeholder="e.g. Java, Spring Boot, React" style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
        </div>
        <div className={styles.formGroup}>
          <label>Deadline</label>
          <input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
        </div>
        <button type="submit" className={styles.submitBtn} disabled={isPosting}>
          {isPosting ? 'Posting...' : 'Submit Job Post'}
        </button>
      </form>
    </div>
  );
};

const MyJobsComponent = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchJobs = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    setIsLoading(true);
    axios.get(`http://localhost:8080/jobs/recruiter/${user.id}`)
      .then(res => {
        setJobs(res.data);
      })
      .catch(err => {
        console.error('Error fetching jobs:', err);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await axios.delete(`http://localhost:8080/jobs/${jobId}`);
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (err) {
      alert('Failed to delete job: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', margin: '2rem' }}>
      <div className={styles.sectionHeader}>
        <h3>My Posted Jobs</h3>
        <button onClick={fetchJobs} className={styles.textBtn} disabled={isLoading} style={{ color: 'var(--primary-orange)', fontWeight: 'bold' }}>
          {isLoading ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>
      <div className={styles.jobsList}>
        {jobs.length === 0 && !isLoading ? (
          <p style={{ color: 'var(--text-gray)' }}>No jobs posted yet</p>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="job-card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className={styles.jobInfo} style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <h4 style={{ color: 'var(--primary-orange)', margin: 0, fontSize: '1.2rem' }}>{job.title}</h4>
                   <button 
                     onClick={() => handleDelete(job.id)}
                     style={{ background: '#fee2e2', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 12px', borderRadius: '4px' }}
                   >
                     DELETE
                   </button>
                </div>
                <p style={{ margin: '4px 0', fontWeight: '500', color: 'var(--text)' }}>{job.location}</p>
                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', lineHeight: '1.4' }}>{job.description}</p>
                  {job.requiredSkills && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {job.requiredSkills.split(',').map((s, i) => (
                        <span key={i} style={{ background: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{s.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  useEffect(() => {
    if (user && user.role === 'RECRUITER' && !user.profileCompleted) {
        // Only redirect if not already on the setup page
        if (window.location.pathname !== '/recruiter/setup') {
            navigate('/recruiter/setup');
        }
    }
  }, [user, navigate]);

  const menuItems = [
    { path: '/recruiter', label: 'Dashboard', icon: 'dashboard' },
    { path: '/recruiter/post-job', label: 'Post Job', icon: 'post_job' },
    { path: '/recruiter/my-jobs', label: 'My Jobs', icon: 'jobs' },
  ];

  return (
    <div className="layout">
      <Sidebar menuItems={menuItems} role="Recruiter" />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardContent />} />
          <Route path="/post-job" element={<PostJobComponent />} />
          <Route path="/my-jobs" element={<MyJobsComponent />} />
          <Route path="/setup" element={<ProfileSetupComponent />} />
          <Route path="*" element={<Navigate to="/recruiter" />} />
        </Routes>
      </main>
    </div>
  );
};

const ProfileSetupComponent = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        designation: '',
        companyDescription: '',
        location: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        try {
            const response = await axios.post(`http://localhost:8080/auth/update-profile?userId=${user.id}`, formData);
            // Update localStorage
            const updatedUser = { ...user, ...response.data, profileCompleted: true };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            alert("Profile updated successfully!");
            navigate('/recruiter');
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Unknown error";
            alert("Error updating profile: " + msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', margin: '4rem auto' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-orange)' }}>Complete Your Profile</h2>
            <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>Please provide your company details to access the recruiter dashboard.</p>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                    <label>Company Name</label>
                    <input type="text" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="e.g. Google" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                    <label>Your Designation</label>
                    <input type="text" required value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="e.g. Talent Acquisition Manager" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                    <label>Location</label>
                    <input type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. San Francisco, CA" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div className={styles.formGroup} style={{ marginBottom: '2rem' }}>
                    <label>Company Description</label>
                    <textarea required value={formData.companyDescription} onChange={e => setFormData({...formData, companyDescription: e.target.value})} placeholder="Briefly describe your company..." rows="4" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}></textarea>
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading} style={{ width: '100%', padding: '1rem', background: 'var(--primary-orange)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem' }}>
                    {loading ? 'Saving...' : 'Save & Continue'}
                </button>
            </form>
        </div>
    );
};

export default RecruiterDashboard;
