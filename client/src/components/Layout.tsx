import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { emailAPI } from '../services/api';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  PlusIcon,
  InboxIcon,
  StarIcon,
  PaperAirplaneIcon,
  TrashIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  FolderIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [emailCounts, setEmailCounts] = useState({
    inbox: 0,
    starred: 0,
    sent: 0,
    drafts: 0,
    spam: 0,
    trash: 0,
    archive: 0
  });
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch email counts
  useEffect(() => {
    const fetchEmailCounts = async () => {
      try {
        const response = await emailAPI.getStats();
        const stats = response.data.data;
        setEmailCounts({
          inbox: stats.totalEmails - stats.sentEmails - stats.spamEmails,
          starred: stats.starredEmails,
          sent: stats.sentEmails,
          drafts: 0, // We'll need to implement drafts count separately
          spam: stats.spamEmails,
          trash: 0, // We'll need to implement trash count separately
          archive: 0 // We'll need to implement archive count separately
        });
      } catch (error) {
        console.error('Failed to fetch email counts:', error);
      }
    };

    if (user) {
      fetchEmailCounts();
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search:', searchQuery);
  };

  const navigation = [
    { name: 'Inbox', href: '/dashboard', icon: InboxIcon, count: emailCounts.inbox },
    { name: 'Starred', href: '/dashboard?folder=starred', icon: StarIcon, count: emailCounts.starred },
    { name: 'Sent', href: '/dashboard?folder=sent', icon: PaperAirplaneIcon, count: emailCounts.sent },
    { name: 'Drafts', href: '/dashboard?folder=drafts', icon: FolderIcon, count: emailCounts.drafts },
    { name: 'Spam', href: '/dashboard?folder=spam', icon: ExclamationTriangleIcon, count: emailCounts.spam },
    { name: 'Trash', href: '/dashboard?folder=trash', icon: TrashIcon, count: emailCounts.trash },
    { name: 'Archive', href: '/dashboard?folder=archive', icon: ArchiveBoxIcon, count: emailCounts.archive },
  ];

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Gmail</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Compose Button */}
          <div className="p-4">
            <Link
              to="/compose"
              className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-full px-6 py-3 text-gray-700 hover:shadow-md transition-shadow duration-200"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="font-medium">Compose</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  location.pathname === item.href.split('?')[0] && location.search.includes(item.href.split('?')[1] || '')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                {item.count > 0 && (
                  <span className="text-xs text-gray-500 font-normal">
                    {item.count}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Logout"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              
              {/* Search Bar */}
              <div className="flex-1 max-w-2xl">
                <form onSubmit={handleSearch} className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search mail"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </form>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
