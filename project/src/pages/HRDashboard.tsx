import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { Users, Clock, Calendar, AlertCircle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { apiService, DashboardStats, LeaveRequest, RegularizationRequest } from '../services/api';

const HRDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    pendingRegularizations: 0
  });
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [regRequests, setRegRequests] = useState<RegularizationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leaves' | 'regularizations'>('leaves');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashboardStats, leaves, regularizations] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getLeaveRequests(),
        apiService.getRegularizationRequests()
      ]);

      setStats(dashboardStats);
      setLeaveRequests(leaves);
      setRegRequests(regularizations);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (requestId: string, action: 'Approved' | 'Rejected') => {
    try {
      await apiService.updateLeaveRequestStatus(requestId, action);
      await loadDashboardData(); // Reload data
    } catch (error) {
      console.error('Error updating leave request:', error);
    }
  };

  const handleRegularizationAction = async (requestId: string, action: 'Approved' | 'Rejected') => {
    try {
      await apiService.updateRegularizationRequestStatus(requestId, action);
      await loadDashboardData(); // Reload data
    } catch (error) {
      console.error('Error updating regularization request:', error);
    }
  };

  const pendingLeaves = leaveRequests.filter(req => req.status === 'Pending');
  const pendingRegularizations = regRequests.filter(req => req.status === 'Pending');

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage employees, requests, and attendance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+2 this month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.presentToday}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">
                {Math.round((stats.presentToday / stats.totalEmployees) * 100)}% attendance rate
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingLeaves}</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-600 opacity-20" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">
                {stats.pendingLeaves > 0 ? 'Requires attention' : 'All caught up'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Regularizations</p>
                <p className="text-2xl font-bold text-red-600">{stats.pendingRegularizations}</p>
              </div>
              <Clock className="w-8 h-8 text-red-600 opacity-20" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">
                {stats.pendingRegularizations > 0 ? 'Requires attention' : 'All caught up'}
              </span>
            </div>
          </div>
        </div>

        {/* Request Approval Center */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('leaves')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'leaves'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Leave Requests ({pendingLeaves.length})
              </button>
              <button
                onClick={() => setActiveTab('regularizations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'regularizations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Regularization Requests ({pendingRegularizations.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'leaves' ? (
              <div className="space-y-4">
                {pendingLeaves.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-500">No pending leave requests</p>
                  </div>
                ) : (
                  pendingLeaves.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{request.userFullName}</h3>
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {request.type}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>Dates:</strong> {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</p>
                            <p><strong>Reason:</strong> {request.reason}</p>
                            <p><strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleLeaveAction(request.id, 'Approved')}
                            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleLeaveAction(request.id, 'Rejected')}
                            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRegularizations.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-500">No pending regularization requests</p>
                  </div>
                ) : (
                  pendingRegularizations.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{request.userFullName}</h3>
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                              {request.type}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>For Date:</strong> {new Date(request.forDate).toLocaleDateString()}</p>
                            <p><strong>Reason:</strong> {request.reason}</p>
                            <p><strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleRegularizationAction(request.id, 'Approved')}
                            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRegularizationAction(request.id, 'Rejected')}
                            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { action: 'Leave approved', user: 'John Employee', time: '2 hours ago', type: 'success' },
              { action: 'Regularization requested', user: 'Mike Developer', time: '4 hours ago', type: 'warning' },
              { action: 'Half-day auto-marked', user: 'John Employee', time: '1 day ago', type: 'info' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HRDashboard;