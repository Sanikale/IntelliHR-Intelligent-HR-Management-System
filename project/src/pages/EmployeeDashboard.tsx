import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import { Clock, Calendar, Wifi, WifiOff, CheckCircle, AlertTriangle, User } from 'lucide-react';
import { apiService, AttendanceRecord } from '../services/api';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [halfDaysThisMonth, setHalfDaysThisMonth] = useState(0);
  const [loading, setLoading] = useState(false);
  const [punchLoading, setPunchLoading] = useState(false);
  const [dropLoading, setDropLoading] = useState(false);

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = () => {
    const stats = apiService.getEmployeeStats();
    setAttendance(stats.attendance);
    setHalfDaysThisMonth(stats.halfDaysThisMonth);
  };

  const handlePunchInOut = async () => {
    setPunchLoading(true);
    try {
      const updatedAttendance = await apiService.punchInOut();
      setAttendance(updatedAttendance);
    } catch (error) {
      console.error('Punch error:', error);
    } finally {
      setPunchLoading(false);
    }
  };

  const handleSimulateWifiDrop = async () => {
    setDropLoading(true);
    try {
      await apiService.simulateWiFiDrop();
      loadEmployeeData(); // Refresh data to show updated disconnection count
    } catch (error) {
      console.error('WiFi drop simulation error:', error);
    } finally {
      setDropLoading(false);
    }
  };

  const getPunchButtonText = () => {
    if (!attendance?.punchIn) return 'Punch In';
    if (!attendance?.punchOut) return 'Punch Out';
    return 'Already Punched Out';
  };

  const getCurrentStatus = () => {
    if (!attendance?.punchIn) return 'Not Clocked In';
    if (!attendance?.punchOut) return 'Clocked In';
    return 'Clocked Out';
  };

  const getStatusColor = () => {
    const status = getCurrentStatus();
    if (status === 'Clocked In') return 'text-green-600';
    if (status === 'Clocked Out') return 'text-blue-600';
    return 'text-gray-600';
  };

  const getAttendanceStatusColor = () => {
    if (attendance?.status === 'Present') return 'bg-green-100 text-green-800';
    if (attendance?.status === 'Half-day') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.fullName}!
              </h1>
              <p className="text-gray-600 mt-1">
                {user?.department} • Today is {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Current Status & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Punch In/Out Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Current Status:</span>
                <span className={`text-sm font-semibold ${getStatusColor()}`}>
                  {getCurrentStatus()}
                </span>
              </div>
              
              {attendance?.punchIn && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Punch In:</span>
                  <span className="text-sm text-gray-900">{attendance.punchIn}</span>
                </div>
              )}
              
              {attendance?.punchOut && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Punch Out:</span>
                  <span className="text-sm text-gray-900">{attendance.punchOut}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Today's Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceStatusColor()}`}>
                  {attendance?.status || 'Absent'}
                </span>
              </div>

              <button
                onClick={handlePunchInOut}
                disabled={punchLoading || (attendance?.punchIn && attendance?.punchOut)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {punchLoading ? 'Processing...' : getPunchButtonText()}
              </button>
            </div>
          </div>

          {/* WiFi Simulation Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">WiFi Monitoring</h2>
              <Wifi className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Disconnections Today:</span>
                <span className="text-lg font-bold text-red-600">
                  {attendance?.disconnectionCount || 0}
                </span>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    {attendance?.disconnectionCount && attendance.disconnectionCount > 2 
                      ? 'Auto half-day applied due to disconnections' 
                      : 'More than 2 disconnections will trigger half-day'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSimulateWifiDrop}
                disabled={dropLoading}
                className="w-full bg-red-100 text-red-700 py-3 px-4 rounded-lg font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {dropLoading ? 'Simulating...' : 'Simulate WiFi Drop'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Demo feature: Simulates WiFi disconnection for testing
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leave Balance</p>
                <p className="text-2xl font-bold text-green-600">{user?.leaveBalance}</p>
                <p className="text-xs text-gray-500">days remaining</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Half-Days This Month</p>
                <p className="text-2xl font-bold text-yellow-600">{halfDaysThisMonth}</p>
                <p className="text-xs text-gray-500">auto-marked</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Status</p>
                <p className={`text-2xl font-bold ${
                  attendance?.status === 'Present' ? 'text-green-600' : 
                  attendance?.status === 'Half-day' ? 'text-yellow-600' : 
                  'text-gray-600'
                }`}>
                  {attendance?.status || 'Absent'}
                </p>
                <p className="text-xs text-gray-500">today</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => window.location.href = '/leave-application'}
              className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
            >
              <Calendar className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Apply for Leave</p>
                <p className="text-sm text-blue-700">Submit a new leave request</p>
              </div>
            </button>
            
            <button
              onClick={() => window.location.href = '/regularization'}
              className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
            >
              <Clock className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Request Regularization</p>
                <p className="text-sm text-green-700">Fix attendance issues</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;