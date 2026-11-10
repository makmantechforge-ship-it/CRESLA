'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Building2,
  Flag,
  ShieldAlert,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  LogOut,
  Bell,
  Search,
  MoreVertical
} from 'lucide-react';

// Mock Data
const metrics = [
  { id: 1, title: 'Total Users', value: '45,231', trend: '+12.5%', isPositive: true, icon: Users },
  { id: 2, title: 'Active Listings', value: '12,845', trend: '+8.2%', isPositive: true, icon: Building2 },
  { id: 3, title: 'Monthly Revenue', value: '$845,230', trend: '+15.3%', isPositive: true, icon: DollarSign },
  { id: 4, title: 'Active Reports', value: '156', trend: '-2.4%', isPositive: true, icon: Flag }, // fewer reports is positive
];

const fraudAlerts = [
  { id: 'FA-1042', user: 'John Doe', reason: 'Multiple failed login attempts from different IPs', severity: 'high', time: '10 mins ago' },
  { id: 'FA-1043', user: 'Alice Smith', reason: 'Unusually high number of property views', severity: 'low', time: '2 hours ago' },
  { id: 'FA-1044', user: 'Bob Johnson', reason: 'Mismatch in verified ID and payment details', severity: 'critical', time: '5 hours ago' },
];

const recentReports = [
  { id: 'REP-901', type: 'User Complaint', target: 'Property #4592', status: 'Pending', date: '2026-07-28' },
  { id: 'REP-902', type: 'Duplicate Listing', target: 'Property #1024', status: 'In Review', date: '2026-07-27' },
  { id: 'REP-903', type: 'Spam Message', target: 'User #8841', status: 'Resolved', date: '2026-07-26' },
  { id: 'REP-904', type: 'Fake Images', target: 'Property #5521', status: 'Pending', date: '2026-07-25' },
];

const sidebarItems = [
  { name: 'Overview', icon: LayoutDashboard, active: true },
  { name: 'Users', icon: Users, active: false },
  { name: 'Properties', icon: Building2, active: false },
  { name: 'Reports', icon: Flag, active: false },
  { name: 'Fraud Detection', icon: ShieldAlert, active: false },
  { name: 'Settings', icon: Settings, active: false },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">CRESLA Admin</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                activeTab === item.name
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.name ? 'text-primary' : 'text-slate-400'}`} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
            <p className="text-sm text-slate-500">{currentDate}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64 transition-all"
              />
            </div>
            <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  key={metric.id} 
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${metric.id === 4 && metric.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                      <metric.icon className="w-6 h-6" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${metric.isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                      {metric.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {metric.trend}
                    </div>
                  </div>
                  <h3 className="text-slate-500 text-sm font-medium">{metric.title}</h3>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{metric.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User Growth Visual (Mocked with CSS) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Platform Growth</h2>
                  <select className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20">
                    <option>Last 6 Months</option>
                    <option>Last Year</option>
                  </select>
                </div>
                
                <div className="h-64 flex items-end justify-between gap-2 px-2">
                  {/* CSS Mock Chart */}
                  {[40, 55, 45, 70, 65, 85, 80, 95, 90, 100].map((height, i) => (
                    <div key={i} className="relative w-full flex flex-col justify-end group">
                      <div 
                        className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-colors duration-300 relative"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          {height * 120} users
                        </div>
                      </div>
                      <div className="h-px bg-slate-200 mt-2"></div>
                      <span className="text-[10px] text-slate-400 text-center mt-2">M{i+1}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Fraud Detection Panel */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg font-bold text-slate-900">Fraud Alerts</h2>
                  </div>
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">{fraudAlerts.length} New</span>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {fraudAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-colors group cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-slate-500">{alert.id}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          alert.severity === 'high' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 mb-1">{alert.user}</p>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">{alert.reason}</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{alert.time}</span>
                        <button className="text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">Investigate &rarr;</button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  View All Alerts
                </button>
              </motion.div>
            </div>

            {/* Recent Reports Table */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                <h2 className="text-lg font-bold text-slate-900">Recent Reports</h2>
                <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium">Report ID</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium">Target</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {recentReports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{report.id}</td>
                        <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                          <Flag className="w-4 h-4 text-slate-400" />
                          {report.type}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{report.target}</td>
                        <td className="px-6 py-4 text-slate-500">{report.date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            report.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                            report.status === 'In Review' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {report.status === 'Resolved' ? <CheckCircle className="w-3 h-3" /> :
                             report.status === 'In Review' ? <Activity className="w-3 h-3" /> :
                             <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Resolve">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Dismiss">
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="More options">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

          </div>
          
          {/* Footer */}
          <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-200 text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} CRESLA Platform Administration
          </div>
        </div>
      </main>
    </div>
  );
}
