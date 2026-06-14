import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Palette,
  Calendar,
  Heart,
  ListTodo,
  FolderOpen,
  Sliders,
  Video,
  Globe,
  Send,
  ShieldAlert,
  History,
  Users,
  Bell,
  Menu,
  X,
  Home,
  LogOut,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

export function AdminLayout() {
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: language === 'gu' ? 'ડેશબોર્ડ' : language === 'hi' ? 'डैशबोर्ड' : 'Dashboard' },
    { path: '/admin/pages', icon: FileText, label: language === 'gu' ? 'પેજ બિલ્ડર' : language === 'hi' ? 'पेज बिल्डर' : 'Pages Builder' },
    { path: '/admin/theme', icon: Palette, label: language === 'gu' ? 'થીમ કસ્ટમાઇઝર' : language === 'hi' ? 'थीम कस्टमाइज़र' : 'Theme Customizer' },
    { path: '/admin/events', icon: Calendar, label: language === 'gu' ? 'કાર્યક્રમો' : language === 'hi' ? 'कार्यक्रम' : 'Events Manager' },
    { path: '/admin/donations', icon: Heart, label: language === 'gu' ? 'દાન વ્યવસ્થાપન' : language === 'hi' ? 'दान प्रबंधन' : 'Donations' },
    { path: '/admin/forms', icon: ListTodo, label: language === 'gu' ? 'ફોર્મ બિલ્ડર' : language === 'hi' ? 'फ़ॉर्मं बिल्डर' : 'Form Builder' },
    { path: '/admin/media', icon: FolderOpen, label: language === 'gu' ? 'મીડિયા લાઇબ્રેરી' : language === 'hi' ? 'मीडिया लाइब्रेरी' : 'Media Library' },
    { path: '/admin/menus', icon: Sliders, label: language === 'gu' ? 'મેનુ મેનેજર' : language === 'hi' ? 'मेन्यू मैनेजर' : 'Menu Management' },
    { path: '/admin/darshan', icon: Video, label: language === 'gu' ? 'લાઈવ દર્શન' : language === 'hi' ? 'लाइव दर्शन' : 'Live Darshan' },
    { path: '/admin/seo', icon: Globe, label: language === 'gu' ? 'SEO અને AEO' : language === 'hi' ? 'SEO और AEO' : 'SEO & AEO' },
    { path: '/admin/notifications', icon: Send, label: language === 'gu' ? 'નોટિફિકેશન સેન્ટર' : language === 'hi' ? 'नोटिफिकेशन सेंटर' : 'Notifications' },
    { path: '/admin/security', icon: ShieldAlert, label: language === 'gu' ? 'સિક્યોરિટી સેન્ટર' : language === 'hi' ? 'सिक्योरिटी सेंटर' : 'Security Center' },
    { path: '/admin/audit-logs', icon: History, label: language === 'gu' ? 'ઓડિટ લોગ' : language === 'hi' ? 'ऑडिट लॉग' : 'Audit Logs' },
    { path: '/admin/users', icon: Users, label: language === 'gu' ? 'વપરાશકર્તાઓ' : language === 'hi' ? 'उपयोगकर्ता' : 'User Management' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform lg:translate-x-0 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="/src/assests/logo/logo_jethva.png" 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-semibold text-gray-800 dark:text-white">
              {language === 'gu' ? 'એડમિન' : language === 'hi' ? 'एडमिन' : 'Admin'}
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 flex flex-col gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <Home className="w-4 h-4" />
            {language === 'gu' ? 'વેબસાઇટ પર જાઓ' : language === 'hi' ? 'वेबसाइट पर जाएं' : 'Go to Website'}
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-650 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 w-full text-left font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {language === 'gu' ? 'લોગઆઉટ' : language === 'hi' ? 'लॉगआउट' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 lg:flex-none">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white hidden lg:block">
              {menuItems.find((item) => item.path === location.pathname)?.label || 'Admin'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-white leading-none">{user?.full_name || 'Admin'}</p>
                <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">{user?.email || 'admin@temple.com'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
