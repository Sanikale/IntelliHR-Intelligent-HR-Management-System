interface AttendanceRecord {
  id: string;
  date: string;
  punchIn?: string;
  punchOut?: string;
  status: 'Present' | 'Half-day' | 'Absent';
  disconnectionCount: number;
}

interface LeaveRequest {
  id: string;
  userId: string;
  userFullName: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
}

interface RegularizationRequest {
  id: string;
  userId: string;
  userFullName: string;
  forDate: string;
  type: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
}

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  pendingLeaves: number;
  pendingRegularizations: number;
}

class ApiService {
  private baseURL = '/api'; // In real app, this would be your backend URL

  // Simulate API delay
  private async simulateDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Attendance Services
  async punchInOut(): Promise<AttendanceRecord> {
    await this.simulateDelay();
    
    const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    const today = new Date().toISOString().split('T')[0];
    
    // Get or create today's attendance record
    let todayRecord = this.getTodayAttendance();
    
    if (!todayRecord.punchIn) {
      // Punch In
      todayRecord = {
        id: `att_${Date.now()}`,
        date: today,
        punchIn: new Date().toLocaleTimeString(),
        status: 'Present',
        disconnectionCount: 0
      };
    } else if (!todayRecord.punchOut) {
      // Punch Out
      todayRecord.punchOut = new Date().toLocaleTimeString();
    }
    
    localStorage.setItem(`attendance_${currentUser.id}_${today}`, JSON.stringify(todayRecord));
    return todayRecord;
  }

  async simulateWiFiDrop(): Promise<void> {
    await this.simulateDelay();
    
    const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    const today = new Date().toISOString().split('T')[0];
    const record = this.getTodayAttendance();
    
    record.disconnectionCount = (record.disconnectionCount || 0) + 1;
    
    // Auto half-day logic: if disconnections > 2, mark as half-day
    if (record.disconnectionCount > 2 && record.status === 'Present') {
      record.status = 'Half-day';
    }
    
    localStorage.setItem(`attendance_${currentUser.id}_${today}`, JSON.stringify(record));
  }

  getTodayAttendance(): AttendanceRecord {
    const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`attendance_${currentUser.id}_${today}`);
    
    return stored ? JSON.parse(stored) : {
      id: '',
      date: today,
      status: 'Absent' as const,
      disconnectionCount: 0
    };
  }

  // Leave Services
  async submitLeaveRequest(request: Omit<LeaveRequest, 'id' | 'userId' | 'userFullName' | 'status' | 'submittedAt'>): Promise<void> {
    await this.simulateDelay();
    
    const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    const newRequest: LeaveRequest = {
      id: `leave_${Date.now()}`,
      userId: currentUser.id,
      userFullName: currentUser.fullName,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
      ...request
    };
    
    const existing = JSON.parse(localStorage.getItem('leave_requests') || '[]');
    existing.push(newRequest);
    localStorage.setItem('leave_requests', JSON.stringify(existing));
  }

  async getLeaveRequests(): Promise<LeaveRequest[]> {
    await this.simulateDelay();
    return JSON.parse(localStorage.getItem('leave_requests') || '[]');
  }

  // Regularization Services
  async submitRegularizationRequest(request: Omit<RegularizationRequest, 'id' | 'userId' | 'userFullName' | 'status' | 'submittedAt'>): Promise<void> {
    await this.simulateDelay();
    
    const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    const newRequest: RegularizationRequest = {
      id: `reg_${Date.now()}`,
      userId: currentUser.id,
      userFullName: currentUser.fullName,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
      ...request
    };
    
    const existing = JSON.parse(localStorage.getItem('regularization_requests') || '[]');
    existing.push(newRequest);
    localStorage.setItem('regularization_requests', JSON.stringify(existing));
  }

  async getRegularizationRequests(): Promise<RegularizationRequest[]> {
    await this.simulateDelay();
    return JSON.parse(localStorage.getItem('regularization_requests') || '[]');
  }

  // Admin Services
  async getDashboardStats(): Promise<DashboardStats> {
    await this.simulateDelay();
    
    const leaveRequests = JSON.parse(localStorage.getItem('leave_requests') || '[]');
    const regRequests = JSON.parse(localStorage.getItem('regularization_requests') || '[]');
    
    return {
      totalEmployees: 25, // Demo data
      presentToday: 18,
      pendingLeaves: leaveRequests.filter((req: LeaveRequest) => req.status === 'Pending').length,
      pendingRegularizations: regRequests.filter((req: RegularizationRequest) => req.status === 'Pending').length
    };
  }

  async updateLeaveRequestStatus(requestId: string, status: 'Approved' | 'Rejected'): Promise<void> {
    await this.simulateDelay();
    
    const requests = JSON.parse(localStorage.getItem('leave_requests') || '[]');
    const updatedRequests = requests.map((req: LeaveRequest) => 
      req.id === requestId ? { ...req, status } : req
    );
    localStorage.setItem('leave_requests', JSON.stringify(updatedRequests));
  }

  async updateRegularizationRequestStatus(requestId: string, status: 'Approved' | 'Rejected'): Promise<void> {
    await this.simulateDelay();
    
    const requests = JSON.parse(localStorage.getItem('regularization_requests') || '[]');
    const updatedRequests = requests.map((req: RegularizationRequest) => 
      req.id === requestId ? { ...req, status } : req
    );
    localStorage.setItem('regularization_requests', JSON.stringify(updatedRequests));
  }

  // Employee stats for dashboard
  getEmployeeStats() {
    const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    const today = new Date().toISOString().split('T')[0];
    const attendance = this.getTodayAttendance();
    
    // Calculate half days this month (demo)
    const halfDaysThisMonth = Math.floor(Math.random() * 3); // Demo data
    
    return {
      attendance,
      halfDaysThisMonth,
      leaveBalance: currentUser.leaveBalance || 0
    };
  }
}

export const apiService = new ApiService();
export type { AttendanceRecord, LeaveRequest, RegularizationRequest, DashboardStats };