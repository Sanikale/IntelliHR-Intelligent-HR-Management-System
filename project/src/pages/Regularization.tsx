import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import { Clock, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

const Regularization: React.FC = () => {
  const [formData, setFormData] = useState({
    forDate: '',
    type: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const regularizationTypes = [
    'Missed Punch In',
    'Missed Punch Out',
    'Late Arrival',
    'Early Departure',
    'Forgot to Punch',
    'System Error',
    'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.forDate || !formData.type || !formData.reason) {
        throw new Error('Please fill in all fields');
      }

      // Check if date is not in future
      if (new Date(formData.forDate) > new Date()) {
        throw new Error('Cannot regularize future dates');
      }

      // Check if date is not older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (new Date(formData.forDate) < thirtyDaysAgo) {
        throw new Error('Cannot regularize dates older than 30 days');
      }

      await apiService.submitRegularizationRequest(formData);
      setSuccess(true);
      setFormData({
        forDate: '',
        type: '',
        reason: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit regularization request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request Regularization</h1>
            <p className="text-gray-600 mt-1">Fix attendance issues or missed punch records</p>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">Regularization request submitted successfully!</p>
              </div>
              <p className="text-green-700 text-sm mt-1">Your request has been sent to HR for approval.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date */}
              <div>
                <label htmlFor="forDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Date to Regularize
                </label>
                <input
                  type="date"
                  id="forDate"
                  name="forDate"
                  value={formData.forDate}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  min={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  You can regularize dates up to 30 days back
                </p>
              </div>

              {/* Regularization Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select issue type</option>
                  {regularizationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Explanation
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Please provide a detailed explanation of the issue and why regularization is needed..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Be specific about the circumstances and provide any relevant details
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData({
                    forDate: '',
                    type: '',
                    reason: ''
                  })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Common Scenarios */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Common Regularization Scenarios
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-800">Missed Punch In/Out</h4>
                <p className="text-sm text-blue-700">
                  Forgot to punch in when arriving or punch out when leaving
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-800">Late Arrival</h4>
                <p className="text-sm text-blue-700">
                  Arrived late due to traffic, public transport, or emergency
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-800">Early Departure</h4>
                <p className="text-sm text-blue-700">
                  Left early for medical appointment, personal emergency, etc.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-800">System Issues</h4>
                <p className="text-sm text-blue-700">
                  Attendance system was down or not working properly
                </p>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Regularization Guidelines</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Submit regularization requests within 7 days of the occurrence when possible</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Provide detailed and honest explanations for all requests</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Attach supporting documents if available (medical certificates, etc.)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Frequent regularization requests may require manager approval</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Regularization;