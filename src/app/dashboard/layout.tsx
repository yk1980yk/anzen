import Link from 'next/link';
import './dashboard.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">ANZEN 管理</h2>

        <nav className="sidebar-nav">
          <Link href="/dashboard" className="nav-item">
            ダッシュボード
          </Link>
          <Link href="/dashboard/danger-areas" className="nav-item">
            危険エリア
          </Link>
          <Link href="/dashboard/sos-logs" className="nav-item">
            SOS ログ
          </Link>
          <Link href="/dashboard/users" className="nav-item">
            ユーザー
          </Link>
        </nav>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
