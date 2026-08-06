'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  BarChart3,
  Settings,
  TrendingUp,
  TrendingDown,
  Plus,
  Megaphone,
  Eye,
  Heart,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  Loader2
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const chartData = [
  { day: 'Mon', height: '40%' },
  { day: 'Tue', height: '65%' },
  { day: 'Wed', height: '45%' },
  { day: 'Thu', height: '80%' },
  { day: 'Fri', height: '55%' },
  { day: 'Sat', height: '95%' },
  { day: 'Sun', height: '75%' },
];

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Properties', icon: Building2 },
  { label: 'Messages', icon: MessageSquare },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [statsData, setStatsData] = useState({
    totalProperties: 0,
    totalViews: 0,
    messagesCount: 0,
    favoritesCount: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Get profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setUserData({ ...user, ...profile });

        // Fetch user's properties
        const { data: properties } = await supabase
          .from('properties')
          .select('id, views, title')
          .eq('landlord_id', user.id);

        const propertyIds = properties?.map(p => p.id) || [];
        const totalProperties = propertyIds.length;
        const totalViews = properties?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;

        // Fetch messages
        const { count: messagesCount } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', user.id);

        // Fetch favorites on user's properties
        let favoritesCount = 0;
        if (propertyIds.length > 0) {
          const { count: favCount } = await supabase
            .from('favorites')
            .select('property_id', { count: 'exact', head: true })
            .in('property_id', propertyIds);
          favoritesCount = favCount || 0;
        }

        setStatsData({
          totalProperties,
          totalViews,
          messagesCount: messagesCount || 0,
          favoritesCount
        });

        // Recent activity (messages to the user)
        const { data: recentMsgs } = await supabase
          .from('messages')
          .select(`
            id,
            created_at,
            content,
            property_id,
            profiles!messages_sender_id_fkey(first_name, last_name)
          `)
          .eq('receiver_id', user.id)
          .order('created_at', { ascending: false })
          .limit(4);

        const colors = [
          'bg-emerald-100 text-emerald-700',
          'bg-blue-100 text-blue-700',
          'bg-amber-100 text-amber-700',
          'bg-purple-100 text-purple-700'
        ];

        if (recentMsgs) {
          const mappedActivity = recentMsgs.map((msg: any, index) => {
            const senderName = msg.profiles ? `${msg.profiles.first_name} ${msg.profiles.last_name}` : 'Unknown User';
            const initials = senderName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
            
            const date = new Date(msg.created_at);
            const now = new Date();
            const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
            let timeStr = `${diffHours} hours ago`;
            if (diffHours === 0) timeStr = 'Just now';
            else if (diffHours > 24) timeStr = `${Math.floor(diffHours / 24)} days ago`;
            
            const prop = properties?.find(p => p.id === msg.property_id);
            const propName = prop?.title || 'a property';

            return {
              id: msg.id,
              user: senderName,
              action: 'sent a message about',
              subject: propName,
              time: timeStr,
              avatar: initials || 'U',
              color: colors[index % colors.length]
            };
          });
          
          // If less than 4 messages, let's just use what we have. If 0, it'll be empty.
          setRecentActivity(mappedActivity);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const stats = [
    { title: 'Total Properties', value: statsData.totalProperties.toString(), trend: 'Real data', trendUp: true, icon: Building2 },
    { title: 'Total Views', value: statsData.totalViews.toLocaleString(), trend: 'Real data', trendUp: true, icon: Eye },
    { title: 'Messages', value: statsData.messagesCount.toString(), trend: 'Real data', trendUp: true, icon: MessageSquare },
    { title: 'Favorites', value: statsData.favoritesCount.toLocaleString(), trend: 'Real data', trendUp: true, icon: Heart },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const userInitials = userData ? `${userData.first_name?.[0] || ''}${userData.last_name?.[0] || ''}`.toUpperCase() : 'U';
  const userName = userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email : 'User';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className={`fixed lg:static inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
              K
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary">CRESLA</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Menu</div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button 
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  item.active 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <item.icon size={20} className={item.active ? 'text-primary' : 'text-slate-400'} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-medium">
                {userInitials || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{userName}</p>
                <p className="text-xs text-slate-500">Landlord</p>
              </div>
            </div>
            <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 lg:px-10 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search properties, messages..." 
                className="pl-10 pr-4 py-2 w-80 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <button className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-lg hover:shadow-primary/30">
              <Plus size={18} />
              <span className="hidden sm:inline">New Listing</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">Welcome back, {userData?.first_name || 'User'}!</h1>
                <p className="text-slate-500 dark:text-slate-400">Here's what's happening with your properties today.</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:border-primary/50 transition-colors shadow-sm">
                  <Settings size={16} />
                  Manage
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.02]">
                  <Megaphone size={16} />
                  Promote
                </button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={stat.title}
                  className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary">
                      <stat.icon size={24} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${stat.trendUp ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'}`}>
                      {stat.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {stat.trend}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                    <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart Section */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-xl font-bold">Property Views</h2>
                    <p className="text-sm text-slate-500">Weekly performance overview</p>
                  </div>
                  <select className="bg-slate-50 dark:bg-slate-800 border-none text-sm font-medium rounded-xl px-4 py-2 outline-none cursor-pointer">
                    <option>This Week</option>
                    <option>Last Week</option>
                    <option>This Month</option>
                  </select>
                </div>
                
                <div className="h-64 flex items-end justify-between gap-2 lg:gap-4 pb-2">
                  {chartData.map((data, i) => (
                    <div key={data.day} className="flex-1 flex flex-col items-center gap-3 group">
                      <div className="w-full relative h-full flex items-end justify-center">
                        <div 
                          className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden relative group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors"
                          style={{ height: '100%' }}
                        >
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: data.height }}
                            transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                            className="absolute bottom-0 w-full bg-primary rounded-t-xl group-hover:bg-blue-600 transition-colors"
                          />
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">{data.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Recent Activity</h2>
                  <button className="text-sm text-primary font-medium hover:underline">View all</button>
                </div>
                
                <div className="space-y-6">
                  {recentActivity.length > 0 ? recentActivity.map((activity) => (
                    <div key={activity.id} className="flex gap-4 group cursor-pointer">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${activity.color}`}>
                        {activity.avatar}
                      </div>
                      <div className="flex-1 border-b border-slate-100 dark:border-slate-800 pb-4 group-last:border-0 group-last:pb-0">
                        <p className="text-sm text-slate-800 dark:text-slate-200">
                          <span className="font-semibold">{activity.user}</span> {activity.action} <span className="font-medium text-primary">{activity.subject}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-sm text-slate-500 text-center py-4">No recent activity</div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-primary/20">
              <div>
                <h2 className="text-2xl font-bold mb-2">Ready to expand your portfolio?</h2>
                <p className="text-blue-100 max-w-md">Reach thousands of potential tenants by listing your new property on CRESLA today.</p>
              </div>
              <button className="shrink-0 flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
                <Plus size={20} />
                Post New Property
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
