import DashboardShell from './components/DashboardShell';
import AuthGuard from './components/AuthGuard';

export default function DashboardPage() {
  return <AuthGuard><DashboardShell /></AuthGuard>;
}
