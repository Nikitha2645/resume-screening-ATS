import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { IconDashboard, IconFileText, IconBarChart, IconUsers, IconBriefcase, IconLogOut } from './Icons';
import styles from './Sidebar.module.css';

const Sidebar = ({ menuItems, role }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
        try {
            await axios.post(`http://localhost:8080/api/auth/logout?userId=${user.id}`);
        } catch (err) {
            console.error("Logout error:", err);
        }
    }
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderIcon = (name) => {
    switch(name) {
      case 'dashboard': return <IconDashboard />;
      case 'my_resume': return <IconFileText />;
      case 'score': return <IconBarChart />;
      case 'applications': return <IconBriefcase />;
      case 'post_job': return <IconFileText />;
      case 'applicants': return <IconUsers />;
      case 'analytics': return <IconBarChart />;
      case 'users': return <IconUsers />;
      case 'jobs': return <IconBriefcase />;
      case 'reports': return <IconFileText />;
      default: return <IconDashboard />;
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>ATS</div>
        <div className={styles.logoText}>ProScreen</div>
      </div>
      
      <div className={styles.roleTag}>
        {role} Portal
      </div>

      <nav className={styles.navMenu}>
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            end={item.path === '/seeker' || item.path === '/recruiter' || item.path === '/admin'}
            className={({ isActive }) => 
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            <span className={styles.icon}>{renderIcon(item.icon)}</span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.bottomSection}>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <span className={styles.icon}><IconLogOut /></span>
          <span className={styles.label}>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
