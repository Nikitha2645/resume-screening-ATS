import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { IconUsers, IconBriefcase, IconFileText, IconBarChart } from '../components/Icons';
import styles from './Admin.module.css';

const DashboardContent = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    recruiters: 0,
    jobPosts: 0,
    applications: 0,
    shortlisted: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/admin/stats");
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    // Refresh stats every 30 seconds for "live" feel
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h2>Admin Overview</h2>
          <p>System statistics and platform health.</p>
        </div>
        <button 
            className={styles.actionBtn} 
            style={{ background: 'var(--primary-orange)', color: 'white' }}
            onClick={async () => {
                const recruiterId = prompt("Enter Recruiter ID to link jobs:");
                if (recruiterId) {
                    try {
                        await axios.post(`http://localhost:8080/api/admin/generate-jobs?recruiterId=${recruiterId}`);
                        alert("Jobs generated successfully!");
                        window.location.reload();
                    } catch (err) {
                        alert("Error generating jobs: " + err.message);
                    }
                }
            }}
        >
            Generate Sample Jobs
        </button>
        <button 
            className={styles.actionBtn} 
            style={{ background: '#ef4444', color: 'white' }}
            onClick={async () => {
                if (window.confirm("Are you sure? This will delete ALL jobs and applications!")) {
                    try {
                        await axios.post(`http://localhost:8080/api/admin/reset-data`);
                        alert("System reset successfully!");
                        window.location.reload();
                    } catch (err) {
                        alert("Error resetting data: " + err.message);
                    }
                }
            }}
        >
            Reset System ⚠️
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
            <StatCard title="Total Users" value={stats.totalUsers || 0} icon={<IconUsers size={24} />} color="#6366f1" />
        </div>
        <StatCard title="Active Users" value={stats.activeUsers || 0} icon={<IconUsers size={24} />} color="#10B981" />
        <div onClick={() => navigate('/admin/recruiters')} style={{ cursor: 'pointer' }}>
            <StatCard title="Recruiters" value={stats.recruiters || 0} icon={<IconUsers size={24} />} color="#3B82F6" />
        </div>
        <StatCard title="Job Posts" value={stats.jobPosts || 0} icon={<IconBriefcase size={24} />} color="var(--primary-orange)" />
        <div onClick={() => navigate('/admin/applications')} style={{ cursor: 'pointer' }}>
            <StatCard title="Applications" value={stats.applications || 0} icon={<IconFileText size={24} />} color="#8B5CF6" />
        </div>
        <StatCard title="Shortlisted" value={stats.shortlisted || 0} icon={<IconUsers size={24} />} color="#F59E0B" />
        <StatCard title="Rejected" value={stats.rejected || 0} icon={<IconUsers size={24} />} color="#EF4444" />
      </div>

      <div className={styles.mainGrid}>
        <div className="glass-panel" style={{ padding: '2rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <div className={styles.sectionHeader}>
            <h3>Application Volume (Weekly)</h3>
          </div>
          <div className={styles.chartPlaceholder}>
            <div className={styles.bars}>
              {[60, 80, 40, 90, 75, 100, 85].map((height, i) => (
                <div key={i} className={styles.barContainer}>
                  <div className={styles.bar} style={{ height: `${height}%` }}></div>
                  <span className={styles.barLabel}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className={styles.sectionHeader}>
            <h3>System Status</h3>
          </div>
          <div className={styles.statusList}>
            <div className={styles.statusItem}>
              <div className={styles.statusInfo}>
                <span className={styles.statusDot} style={{ background: '#10B981' }}></span>
                <div>
                  <h4>API Gateway</h4>
                  <p>Operational • 99.9% Uptime</p>
                </div>
              </div>
              <button className={styles.actionBtn}>Logs</button>
            </div>
            
            <div className={styles.statusItem}>
              <div className={styles.statusInfo}>
                <span className={styles.statusDot} style={{ background: '#10B981' }}></span>
                <div>
                  <h4>Database Servers</h4>
                  <p>Operational • 99.8% Uptime</p>
                </div>
              </div>
              <button className={styles.actionBtn}>Logs</button>
            </div>

            <div className={styles.statusItem}>
              <div className={styles.statusInfo}>
                <span className={styles.statusDot} style={{ background: '#F59E0B' }}></span>
                <div>
                  <h4>ML Resume Parser</h4>
                  <p>Degraded Performance</p>
                </div>
              </div>
              <button className={styles.actionBtn}>Logs</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GenericManagement = ({ title, subtitle, apiEndpoint, extraCols = [] }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(apiEndpoint)
            .then(res => setItems(res.data))
            .catch(err => console.error(`Error fetching ${title}:`, err))
            .finally(() => setLoading(false));
    }, [apiEndpoint]);

    return (
        <div>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h2 className="page-title">{title}</h2>
                <p className="page-subtitle">{subtitle}</p>
            </div>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                {loading ? <p>Loading...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>ID/Name</th>
                                <th style={{ padding: '1rem' }}>Details</th>
                                {extraCols.map(c => <th key={c} style={{ padding: '1rem' }}>{c}</th>)}
                                <th style={{ padding: '1rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>No records found.</td></tr> : items.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '600' }}>{item.name || item.studentName || item.email || item.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{item.email || item.company}</div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                                        {item.role || item.jobTitle || item.designation || item.location || 'N/A'}
                                    </td>
                                    {extraCols.map(c => {
                                        const key = c.toLowerCase().replace(' ', '');
                                        return <td key={c} style={{ padding: '1rem' }}>
                                            {key === 'status' ? (
                                                <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: '#e2e8f0', color: '#475569', fontWeight: 'bold' }}>
                                                    {item[key]}
                                                </span>
                                            ) : (item[key] || 'N/A')}
                                        </td>
                                    })}
                                    <td style={{ padding: '1rem' }}>
                                        {item.fileUrl ? (
                                            <a href={`http://localhost:8080${item.fileUrl}`} target="_blank" rel="noreferrer" className={styles.actionBtn} style={{ fontSize: '0.8rem', textDecoration: 'none' }}>View Resume</a>
                                        ) : (
                                            <button className={styles.actionBtn}>Manage</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const AdminDashboard = () => {
  const menuItems = [
    { path: '/admin', label: 'Overview', icon: 'dashboard' },
    { path: '/admin/users', label: 'Users', icon: 'users' },
    { path: '/admin/recruiters', label: 'Recruiters', icon: 'users' },
    { path: '/admin/jobs', label: 'Jobs', icon: 'post_job' },
    { path: '/admin/applications', label: 'Applications', icon: 'applications' },
  ];

  return (
    <div className="layout">
      <Sidebar menuItems={menuItems} role="Admin" />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardContent />} />
          <Route path="/users" element={<GenericManagement title="User Management" subtitle="System-wide users" apiEndpoint="http://localhost:8080/api/admin/users" extraCols={['Role', 'Status']} />} />
          <Route path="/recruiters" element={<GenericManagement title="Recruiter Directory" subtitle="All registered recruiters" apiEndpoint="http://localhost:8080/api/admin/recruiters" extraCols={['Location']} />} />
          <Route path="/jobs" element={<GenericManagement title="Global Job Posts" subtitle="Every job listed on the platform" apiEndpoint="http://localhost:8080/jobs" extraCols={['Company', 'Location']} />} />
          <Route path="/applications" element={<GenericManagement title="Global Applications" subtitle="Track every resume in the system" apiEndpoint="http://localhost:8080/api/admin/applications" extraCols={['Score', 'Status']} />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
