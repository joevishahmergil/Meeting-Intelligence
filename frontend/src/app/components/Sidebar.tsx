import { Home, Calendar, FolderKanban, Upload } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchCurrentUser } from '../api';

export function Sidebar() {
  const location = useLocation();
  const [user, setUser] = useState<{ full_name?: string; email?: string } | null>(null);
  useEffect(() => {
    fetchCurrentUser().then(setUser).catch(() => setUser(null));
  }, []);
  
  const navItems = [
    { name: 'Home', icon: Home, path: '/home' },
    { name: 'Calendar', icon: Calendar, path: '/calendar' },
    { name: 'Projects', icon: FolderKanban, path: '/projects' },
    { name: 'Upload Meeting', icon: Upload, path: '/upload-meeting' },
  ];
  
  const initials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  };
  
  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">MI</span>
          </div>
          <span className="font-semibold text-gray-900">Meeting Intelligence</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">{initials(user?.full_name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
