import { Child } from '../../lib/supabase';
import { BarChart3 } from 'lucide-react';

interface ChildDashboardLinkProps {
  child: Child;
  onViewDashboard: (child: Child) => void;
}

export function ChildDashboardLink({ child, onViewDashboard }: ChildDashboardLinkProps) {
  return (
    <button
      onClick={() => onViewDashboard(child)}
      className="flex items-center space-x-2 space-x-reverse text-teal-600 hover:text-teal-700 transition-colors"
    >
      <BarChart3 className="w-4 h-4" />
      <span className="text-sm">عرض لوحة التقدم</span>
    </button>
  );
}

