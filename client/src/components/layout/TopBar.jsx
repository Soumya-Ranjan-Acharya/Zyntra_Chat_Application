import React from 'react';
import { Search, Bell, Shield } from 'lucide-react';
import Avatar from '../ui/Avatar';
import WorkspaceBreadcrumb from '../workspace/WorkspaceBreadcrumb';
import useAuthStore from '../../store/useAuthStore';

const TopBar = ({ breadcrumbPath, onNavigateBreadcrumb, title }) => {
  const user = useAuthStore((s) => s.user);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 24px',
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: '#fafbfc',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        flexShrink: 0,
        userSelect: 'none',
        zIndex: 10
      }}
    >
      <div style={{ flex: 1, minWidth: 0, paddingRight: '20px', marginRight: '8px' }}>
        {breadcrumbPath && breadcrumbPath.length > 0 ? (
          <WorkspaceBreadcrumb
            path={breadcrumbPath}
            onNavigate={onNavigateBreadcrumb}
          />
        ) : (
          title && (
            <h1 className="text-sm font-bold text-slate-900 truncate tracking-tight">
              {title}
            </h1>
          )
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => alert('Search across workspace active')}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          title="Search"
        >
          <Search size={16} />
        </button>
        <button
          onClick={() => alert('Notifications (2 new notifications)')}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer relative"
          title="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>
        <div className="pl-1 border-l border-slate-200 ml-1">
          <Avatar name={user?.name || 'Soumya'} src={user?.avatar} size="sm" />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
