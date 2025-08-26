import React, { useState, useEffect, useMemo } from 'react';
import { leadsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Target, Calendar, Filter, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Analytics = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalValue: 0,
    avgScore: 0,
    conversionRate: 0,
    todayLeads: 0,
    thisWeekLeads: 0
  });

  // Fetch all leads for analytics
  useEffect(() => {
    fetchLeads();
  }, [timeRange]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLeads();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching leads for analytics...');
      
      // Get all leads for analytics using the dedicated analytics endpoint
      const response = await fetch('http://localhost:5000/api/leads/analytics', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:5173',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('📡 Analytics API response:', responseData);
      console.log('📊 Response data structure:', responseData);
      
      // Get leads data from the analytics endpoint
      let leadsData = [];
      if (responseData.data && Array.isArray(responseData.data)) {
        leadsData = responseData.data;
        console.log('✅ Found data in responseData.data');
      } else if (responseData && Array.isArray(responseData)) {
        leadsData = responseData;
        console.log('✅ Found data in responseData (direct)');
      } else {
        console.log('❌ No valid data structure found');
        console.log('Available keys:', Object.keys(responseData || {}));
      }
      
      console.log('📈 Processed leads data:', leadsData);
      console.log('🔢 Number of leads:', leadsData.length);
      
      if (leadsData.length > 0) {
        console.log('📋 Sample lead:', leadsData[0]);
      }
      
      setLeads(leadsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Error fetching leads for analytics:', error);
      console.error('🚨 Error details:', error.response?.data);
      console.error('🔍 Full error object:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    console.log('Calculating analytics data...');
    console.log('Current leads:', leads);
    console.log('Leads length:', leads.length);
    
    if (!leads.length) {
      console.log('No leads found, returning empty analytics data');
      return {};
    }

    const now = new Date();
    let filteredLeads = leads;
    
    // Filter leads by time range (skip filtering for "all time")
    if (timeRange !== 'all') {
      const daysAgo = new Date(now.getTime() - (parseInt(timeRange) * 24 * 60 * 60 * 1000));
      filteredLeads = leads.filter(lead => 
        new Date(lead.created_at) >= daysAgo
      );
    }

    // Status distribution for pie chart
    const statusData = filteredLeads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    const statusChartData = Object.entries(statusData).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: getStatusColor(status)
    }));

    // Source distribution for pie chart
    const sourceData = filteredLeads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {});

    const sourceChartData = Object.entries(sourceData).map(([source, count]) => ({
      name: source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count,
      color: getSourceColor(source)
    }));

    // Monthly leads for bar chart
    const monthlyData = filteredLeads.reduce((acc, lead) => {
      const month = new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const monthlyChartData = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      leads: count
    }));

    // Score distribution for bar chart
    const scoreRanges = [
      { range: '0-20', min: 0, max: 20 },
      { range: '21-40', min: 21, max: 40 },
      { range: '41-60', min: 41, max: 60 },
      { range: '61-80', min: 61, max: 80 },
      { range: '81-100', min: 81, max: 100 }
    ];

    const scoreChartData = scoreRanges.map(({ range, min, max }) => ({
      range,
      count: filteredLeads.filter(lead => lead.score >= min && lead.score <= max).length
    }));

    // Value ranges for bar chart
    const valueRanges = [
      { range: '$0-1K', min: 0, max: 1000 },
      { range: '$1K-5K', min: 1000, max: 5000 },
      { range: '$5K-10K', min: 5000, max: 10000 },
      { range: '$10K-25K', min: 10000, max: 25000 },
      { range: '$25K+', min: 25000, max: Infinity }
    ];

    const valueChartData = valueRanges.map(({ range, min, max }) => ({
      range,
      count: filteredLeads.filter(lead => lead.lead_value >= min && lead.lead_value <= max).length
    }));

    // Calculate summary statistics
    const totalLeads = filteredLeads.length;
    const totalValue = filteredLeads.reduce((sum, lead) => sum + (lead.lead_value || 0), 0);
    const avgScore = totalLeads > 0 ? filteredLeads.reduce((sum, lead) => sum + (lead.score || 0), 0) / totalLeads : 0;
    const qualifiedLeads = filteredLeads.filter(lead => lead.is_qualified).length;
    const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
    
    // Additional real-time statistics
    const todayLeads = filteredLeads.filter(lead => {
      const today = new Date();
      const leadDate = new Date(lead.created_at);
      return leadDate.toDateString() === today.toDateString();
    }).length;
    
    const thisWeekLeads = filteredLeads.filter(lead => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      return new Date(lead.created_at) >= weekAgo;
    }).length;

    const calculatedStats = {
      totalLeads,
      totalValue,
      avgScore: Math.round(avgScore * 10) / 10,
      conversionRate: Math.round(conversionRate * 10) / 10,
      todayLeads,
      thisWeekLeads
    };
    
    console.log('Calculated stats:', calculatedStats);
    setStats(calculatedStats);

    return {
      statusChartData,
      sourceChartData,
      monthlyChartData,
      scoreChartData,
      valueChartData
    };
  }, [leads, timeRange]);

  // Color functions for charts
  const getStatusColor = (status) => {
    const colors = {
      new: '#3B82F6',
      contacted: '#F59E0B',
      qualified: '#10B981',
      lost: '#EF4444',
      won: '#8B5CF6'
    };
    return colors[status] || '#6B7280';
  };

  const getSourceColor = (source) => {
    const colors = {
      website: '#3B82F6',
      facebook_ads: '#1877F2',
      google_ads: '#4285F4',
      referral: '#10B981',
      events: '#F59E0B',
      other: '#6B7280'
    };
    return colors[source] || '#6B7280';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show message if no leads data
  if (!leads || leads.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Insights and trends from your lead data
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={fetchLeads}
              className="btn btn-primary"
            >
              🔄 Refresh Data
            </button>
                         <button
               onClick={async () => {
                 console.log('🧪 Testing Analytics API directly...');
                 try {
                   const testResponse = await fetch('/api/leads/analytics', {
                     credentials: 'include'
                   });
                   const testData = await testResponse.json();
                   console.log('🧪 Direct fetch result:', testData);
                 } catch (error) {
                   console.error('🧪 Direct fetch error:', error);
                 }
               }}
               className="btn btn-warning"
             >
               🧪 Test Analytics API
             </button>
          </div>
        </div>

        {/* No Data State */}
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Analytics Data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Unable to fetch leads data from MongoDB. Please check:
          </p>
          <div className="mt-4 text-left max-w-md mx-auto bg-gray-50 p-4 rounded-lg">
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Backend server is running on port 5000</li>
              <li>• MongoDB connection is working</li>
              <li>• Database has leads data</li>
              <li>• Check browser console for errors</li>
            </ul>
          </div>
          <div className="mt-6">
            <button
              onClick={fetchLeads}
              className="btn btn-primary"
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                       <p className="mt-1 text-sm text-gray-500">
               Insights and trends from your lead data
             </p>
             <p className="mt-1 text-xs text-gray-400">
               Last updated: {lastUpdated.toLocaleTimeString()}
             </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
            <option value="all">All time</option>
          </select>
          <button
            onClick={fetchLeads}
            className="btn btn-secondary"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
                      <button
              onClick={async () => {
                console.log('🧪 Testing Analytics API directly...');
                try {
                  const testResponse = await fetch('/api/leads/analytics', {
                    credentials: 'include'
                  });
                  const testData = await testResponse.json();
                  console.log('🧪 Direct fetch result:', testData);
                } catch (error) {
                  console.error('🧪 Direct fetch error:', error);
                }
              }}
              className="btn btn-warning"
              title="Test Analytics API directly"
            >
              🧪 Test Analytics API
            </button>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">Auto-refresh</span>
          </label>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgScore}</p>
            </div>
          </div>
        </div>

                 <div className="card">
           <div className="flex items-center">
             <div className="flex-shrink-0">
               <TrendingUp className="h-8 w-8 text-orange-600" />
             </div>
             <div className="ml-4">
               <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
               <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
             </div>
           </div>
         </div>
       </div>

       {/* Additional Real-time Stats */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="card">
           <div className="flex items-center">
             <div className="flex-shrink-0">
               <Calendar className="h-8 w-8 text-indigo-600" />
             </div>
             <div className="ml-4">
               <p className="text-sm font-medium text-gray-500">Today's Leads</p>
               <p className="text-2xl font-bold text-gray-900">{stats.todayLeads}</p>
             </div>
           </div>
         </div>

         <div className="card">
           <div className="flex items-center">
             <div className="flex-shrink-0">
               <Filter className="h-8 w-8 text-pink-600" />
             </div>
             <div className="ml-4">
               <p className="text-sm font-medium text-gray-500">This Week's Leads</p>
               <p className="text-2xl font-bold text-gray-900">{stats.thisWeekLeads}</p>
             </div>
           </div>
         </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.statusChartData || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.statusChartData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Source Distribution Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Source Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.sourceChartData || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.sourceChartData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Leads Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Lead Generation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.monthlyChartData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Distribution Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.scoreChartData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Value Distribution Bar Chart */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Value Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.valueChartData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

             {/* Debug Information */}
       <div className="card bg-yellow-50 border-yellow-200">
         <h3 className="text-lg font-medium text-yellow-900 mb-4">Debug Information</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
           <div>
             <p><strong>Raw Leads Count:</strong> {leads.length}</p>
             <p><strong>Time Range:</strong> {timeRange}</p>
             <p><strong>Last Updated:</strong> {lastUpdated.toLocaleString()}</p>
           </div>
           <div>
             <p><strong>Sample Lead:</strong></p>
             {leads.length > 0 && (
               <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                 {JSON.stringify(leads[0], null, 2)}
               </pre>
             )}
           </div>
         </div>
       </div>

       {/* Data Source Info */}
       <div className="card bg-blue-50 border-blue-200">
         <div className="flex items-center justify-between">
           <div>
             <h3 className="text-lg font-medium text-blue-900">Data Source</h3>
             <p className="text-sm text-blue-700">
               All data is fetched directly from your MongoDB leads table in real-time
             </p>
           </div>
           <div className="text-right">
             <p className="text-xs text-blue-600">
               Database: MongoDB
             </p>
             <p className="text-xs text-blue-600">
               Collection: leads
             </p>
           </div>
         </div>
       </div>

       {/* Additional Insights */}
       <div className="card">
         <h3 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Top Performing Sources</h4>
            <div className="space-y-2">
              {analyticsData.sourceChartData?.slice(0, 3).map((source, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{source.name}</span>
                  <span className="text-sm font-medium text-gray-900">{source.value} leads</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Status Breakdown</h4>
            <div className="space-y-2">
              {analyticsData.statusChartData?.map((status, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{status.name}</span>
                  <span className="text-sm font-medium text-gray-900">{status.value} leads</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
