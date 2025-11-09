import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { statisticsService } from '../services/statistics.service';
import Layout from '../components/Layout';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await statisticsService.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          لوحة التحكم
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              إجمالي المحادثات
            </h3>
            <p className="text-3xl font-bold text-indigo-600">
              {stats?.conversations?.total || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              المحادثات المفتوحة
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {stats?.conversations?.open || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              إجمالي الرسائل
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {stats?.messages?.total || 0}
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            مرحباً، {user?.full_name || user?.email}
          </h2>
          <p className="text-gray-600">الدور: {user?.role}</p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

