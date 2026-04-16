import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <h1>WAVE</h1>
          <p>Program Management Application</p>
        </div>
        <form onSubmit={handleSubmit} className="login-card__form">
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="login-card__demo">
          <p>Demo Credentials</p>
          <table>
            <thead><tr><th>Username</th><th>Password</th><th>Role</th></tr></thead>
            <tbody>
              <tr><td>admin</td><td>admin123</td><td>Program Manager</td></tr>
              <tr><td>lead</td><td>lead123</td><td>Workstream Lead</td></tr>
              <tr><td>member</td><td>member123</td><td>Team Member</td></tr>
              <tr><td>viewer</td><td>viewer123</td><td>Viewer</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
