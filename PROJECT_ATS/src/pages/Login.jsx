import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('JOBSEEKER');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [accessCode, setAccessCode] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'JOBSEEKER') navigate('/seeker');
        else if (user.role === 'RECRUITER') navigate('/recruiter');
        else if (user.role === 'ADMIN') navigate('/admin');
      } catch (e) {}
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password || !role) {
      setErrorMsg('Please fill out all fields.');
      return;
    }

    if (!isLogin) {
      try {
        await axios.post('http://localhost:8080/auth/signup', { 
          email, password, role, name 
        });
        setSuccessMsg('Account created successfully! Please log in.');
        setIsLogin(true);
        setPassword('');
      } catch (err) {
        setErrorMsg(err.response?.data?.message || err.message || 'API failed to sign up.');
      }
    } else {
      try {
        const payload = { email, password };
        if (role === 'ADMIN') {
            payload.accessCode = accessCode;
        }

        const response = await axios.post('http://localhost:8080/auth/login', payload);
        
        const data = response.data;
        const userRole = data.role;
        
        localStorage.setItem('user', JSON.stringify(data));
        
        if (userRole === 'JOBSEEKER') navigate('/seeker');
        else if (userRole === 'RECRUITER') navigate('/recruiter');
        else navigate('/admin');
        
      } catch (err) {
        setErrorMsg(err.response?.data?.message || err.message || 'API failed to login.');
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
    setSuccessMsg('');
    setPassword('');
    setName('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.splitLayout}>
        <div className={styles.leftPanel}>
          <div className={styles.branding}>
            <div className={styles.logoBadge}>ATS</div>
            <span className={styles.brandTitle}>ProScreen</span>
          </div>
          <h1 className={styles.leftTitle}>Accelerate Your Hiring Pipeline</h1>
          <p className={styles.leftSubtitle}>
            The all-in-one platform to screen, interview, and manage top talent with precision and speed.
          </p>
          <div className={styles.featureList}>
            <div className={styles.featureItem}>🎯 Real-time Candidate Match</div>
            <div className={styles.featureItem}>📊 Insightful Analytics Dashboard</div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={`${styles.card} login-card`}>
            <h2 className={styles.cardTitle}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className={styles.cardSubtitle}>
              {isLogin ? 'Please enter your credentials to continue.' : 'Join ProScreen to start managing candidates.'}
            </p>

            {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}
            {successMsg && <div className={styles.successAlert}>{successMsg}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              {!isLogin && (
                <div className={styles.inputBox}>
                  <label>FULL NAME</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className={styles.inputBox}>
                <label>EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  placeholder="you@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className={styles.inputBox}>
                <label>PASSWORD</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              <div className={styles.inputBox}>
                <label>{isLogin ? 'LOGIN AS' : 'REGISTER AS'}</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="JOBSEEKER">Job Seeker</option>
                  <option value="RECRUITER">Recruiter</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              
              {isLogin && role === 'ADMIN' && (
                <div className={styles.inputBox}>
                  <label>ADMIN ACCESS CODE</label>
                  <input 
                    type="password" 
                    placeholder="Enter special code" 
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    required
                  />
                </div>
              )}

              <button type="submit" className={styles.primaryBtn}>
                {isLogin ? 'Sign In' : 'Get Started'}
              </button>
            </form>

            <div className={styles.footerLinks}>
              {isLogin ? "Don't have an account? " : "Already registered? "}
              <span onClick={toggleMode} className={styles.toggleLink}>
                {isLogin ? 'Create Account' : 'Log In'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
