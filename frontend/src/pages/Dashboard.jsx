import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { statisticsService } from '../services/statistics.service';
import Header from '../components/Header';
import DashboardSidebar from '../components/DashboardSidebar';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeCampaigns: 7,
    satisfactionRate: 94.2,
    averageResponseTime: 2.4,
    newConversations: 284,
    responseTimeDistribution: [
      { label: 'أقل من دقيقة', value: 35, color: 'bg-green-500' },
      { label: '1-3 دقائق', value: 42, color: 'bg-blue-500' },
      { label: '3-5 دقائق', value: 18, color: 'bg-yellow-500' },
      { label: 'أكثر من 5 دقائق', value: 5, color: 'bg-red-500' },
    ],
    activeCampaignsList: [
      {
        name: 'عروض الصيف 2024',
        status: 'جاري',
        statusColor: 'bg-green-500',
        progress: 95,
        current: 4750,
        total: 5000,
        openRate: 68
      },
      {
        name: 'تحديث المنتج',
        status: 'مجدول',
        statusColor: 'bg-gray-400',
        progress: 0,
        current: 0,
        total: 3200,
        openRate: 0
      },
    ],
    notifications: [
      {
        type: 'محادثة متأخرة',
        description: 'لم يتم الرد منذ 45 دقيقة',
        time: 'منذ 5 دقائق',
        color: 'bg-red-500'
      },
      {
        type: 'كلمة مفتاحية مشبوهة',
        description: 'تم كشف كلمة \'شكوى\' في المحادثة #3421',
        time: 'منذ 12 دقيقة',
        color: 'bg-yellow-500'
      },
      {
        type: 'حملة قاربت على الانتهاء',
        description: 'حملة \'عروض الصيف\' - 95% مكتملة',
        time: 'منذ 30 دقيقة',
        color: 'bg-blue-500'
      },
    ],
    topEmployees: [
      {
        name: 'أحمد محمد',
        initials: 'ام',
        performance: 96,
        conversations: 128,
        responseTime: 1.8,
        rank: 1
      },
      {
        name: 'سارة على',
        initials: 'سع',
        performance: 94,
        conversations: 115,
        responseTime: 2.1,
        rank: null
      },
      {
        name: 'محمود حسن',
        initials: 'مح',
        performance: 93,
        conversations: 102,
        responseTime: 2.4,
        rank: null
      },
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await statisticsService.getDashboard();
      if (response?.data) {
        // Merge with default stats
        setStats(prev => ({
          ...prev,
          ...response.data
        }));
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 mr-64 bg-gray-50 flex items-center justify-center">
          <div className="text-lg text-gray-600">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 mr-64 flex flex-col">
        {/* Header */}
        <Header />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Breadcrumbs */}
          <nav className="mb-4">
            <ol className="flex items-center gap-2 text-sm text-gray-600">
              <li>الرئيسية</li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-medium">لوحة التحكم</li>
            </ol>
          </nav>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة التحكم</h1>
            <p className="text-gray-600">ملخص الأداء والإحصائيات</p>
          </div>

          {/* Filter Dropdown */}
          <div className="mb-6 flex justify-end">
            <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>آخر 7 أيام</option>
              <option>آخر 30 يوم</option>
              <option>آخر 3 أشهر</option>
            </select>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Active Campaigns */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">حملات نشطة</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</p>
              <p className="text-sm text-gray-500 mt-1">0%</p>
            </div>

            {/* Satisfaction Rate */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">معدل الرضا</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.satisfactionRate}%</p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <span>3%+↑</span>
              </p>
            </div>

            {/* Average Response Time */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">متوسط وقت الاستجابة</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.averageResponseTime} دقيقة</p>
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <span>8%-↓</span>
              </p>
            </div>

            {/* New Conversations */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">محادثات جديدة</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.newConversations}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <span>12%+↑</span>
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Response Time Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع أوقات الاستجابة</h3>
              <div className="space-y-4">
                {stats.responseTimeDistribution.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${item.color}`}
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Conversations Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">المحادثات اليومية</h3>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-400">سيتم إضافة الرسم البياني هنا</p>
              </div>
              <div className="flex justify-around mt-4 text-xs text-gray-600">
                {['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Campaigns */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">الحملات النشطة</h3>
              <div className="space-y-4">
                {stats.activeCampaignsList.map((campaign, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${campaign.statusColor}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>{campaign.current} / {campaign.total}</span>
                        <span>{campaign.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${campaign.statusColor}`}
                          style={{ width: `${campaign.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">معدل الفتح: {campaign.openRate}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Notifications */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">آخر التنبيهات</h3>
              <div className="space-y-4">
                {stats.notifications.map((notification, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${notification.color}`}></div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{notification.type}</h4>
                      <p className="text-xs text-gray-600 mb-1">{notification.description}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Employees */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">أفضل أداء الموظفين</h3>
              <div className="space-y-4">
                {stats.topEmployees.map((employee, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-sm">
                        {employee.initials}
                      </div>
                      {employee.rank && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900">
                          {employee.rank}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{employee.name}</h4>
                      <p className="text-xs text-gray-600">{employee.conversations} محادثة - {employee.responseTime} دقيقة</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">{employee.performance}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
