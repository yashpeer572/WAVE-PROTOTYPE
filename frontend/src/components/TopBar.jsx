import { useAuth } from '../context/AuthContext';

export default function TopBar() {
  const { user, logout } = useAuth();

  const roleBadge = user?.roles?.[0]?.display_name || 'User';

  return (
    <header className="topbar">
      <div className="topbar__left">
        <h2 className="topbar__title">Program Management</h2>
      </div>
      <div className="topbar__right">
        <span className="topbar__role-badge">{roleBadge}</span>
        <span className="topbar__user">{user?.name}</span>
        <button className="topbar__logout" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
