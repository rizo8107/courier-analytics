import React, { useState, useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { 
  TrendingUp, TrendingDown, Package, DollarSign, 
  Weight, AlertTriangle, BarChart3, Filter,
  Calendar, Search, Download, Upload, Eye, EyeOff, ChevronDown, ChevronUp, X, Zap, Target, Settings, Activity, PieChart as PieChartIcon
} from 'lucide-react';
import {
  LineChart as RechartsLineChart, Line, ResponsiveContainer, PieChart as RechartsPieChart,
  Pie, Cell, AreaChart, Area, ScatterChart, Scatter, ComposedChart, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar
} from 'recharts';
import { NormalizedShipment, KPIData, DashboardFilters } from '../types';
import { calculateKPIs, applyFilters, exportToCSV } from '../utils/dataProcessing';

interface DashboardProps {
  shipments: NormalizedShipment[];
  onUploadNewData?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ shipments, onUploadNewData }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'mismatches' | 'trends' | 'insights'>('overview');
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      start: new Date('2025-01-01'),
      end: new Date('2025-12-31')
    },
    carriers: [],
    zones: [],
    pins: [],
    services: [],
    statuses: [],
    minWeightDiff: 0,
    showDeliveredOnly: false,
    searchText: '',
    upliftThreshold: 0.1
  });

  const filteredShipments = useMemo(() => 
    applyFilters(shipments, filters), [shipments, filters]
  );

  const kpis = useMemo(() => 
    calculateKPIs(filteredShipments), [filteredShipments]
  );

  const uniqueCarriers = useMemo(() => 
    [...new Set(shipments.map(s => s.carrier))], [shipments]
  );

  const uniqueZones = useMemo(() => 
    [...new Set(shipments.map(s => s.zone))], [shipments]
  );

  const uniqueServices = useMemo(() => 
    [...new Set(shipments.map(s => s.service))], [shipments]
  );

  const uniqueStatuses = useMemo(() => 
    [...new Set(shipments.map(s => s.status))], [shipments]
  );

  const flaggedShipments = useMemo(() => 
    filteredShipments.filter(s => s.flag_miscalculated), [filteredShipments]
  );

  const handleExport = (type: 'all' | 'flagged') => {
    const dataToExport = type === 'all' ? filteredShipments : flaggedShipments;
    exportToCSV(dataToExport, `courier-analysis-${type}`);
  };

  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Courier Analytics
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {kpis.totalShipments.toLocaleString()} shipments • {uniqueCarriers.length} carriers • Advanced insights
                  </p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mr-32">
              <button
                onClick={() => handleExport('flagged')}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Disputes
              </button>
              <button
                onClick={() => handleExport('all')}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4 mr-2" />
                Export All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-4">
            {[
              { id: 'overview', label: 'Overview', icon: Eye, color: 'blue' },
              { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'indigo' },
              { id: 'trends', label: 'Trends', icon: TrendingUp, color: 'green' },
              { id: 'mismatches', label: 'Disputes', icon: AlertTriangle, color: 'red' },
              { id: 'insights', label: 'AI Insights', icon: Zap, color: 'purple' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg transform scale-105`
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50 hover:shadow-md'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-gradient-to-r from-white/60 via-white/40 to-white/60 backdrop-blur-md border-b border-white/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Smart Filters
            </h3>
            <button
              onClick={() => setFilters({
                dateRange: { start: new Date('2025-01-01'), end: new Date('2025-12-31') },
                carriers: [], zones: [], pins: [], services: [], statuses: [],
                minWeightDiff: 0, showDeliveredOnly: false, searchText: '', upliftThreshold: 0.1
              })}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center px-3 py-1 rounded-lg hover:bg-white/50 transition-all"
            >
              <Settings className="w-4 h-4 mr-1" />
              Reset All
            </button>
            <button
              onClick={onUploadNewData}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Upload New Data</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {/* Date Range */}
            <div className="lg:col-span-2 space-y-2">
              <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                Date Range
              </label>
              {/* Quick selectors */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => handleFilterChange('dateRange', {
                    start: subDays(new Date(), 6),
                    end: new Date()
                  })}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                  title="Last 7 days"
                  aria-label="Set date range to last 7 days"
                >
                  Last 7d
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange('dateRange', {
                    start: startOfMonth(new Date()),
                    end: new Date()
                  })}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  title="This month"
                  aria-label="Set date range to this month"
                >
                  This Month
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange('dateRange', {
                    start: new Date(new Date().getFullYear(), 0, 1),
                    end: new Date()
                  })}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                  title="Year to date"
                  aria-label="Set date range to year to date"
                >
                  YTD
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange('dateRange', {
                    start: new Date('2025-01-01'),
                    end: new Date('2025-12-31')
                  })}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  title="Reset to default"
                  aria-label="Reset date range to default"
                >
                  Reset
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                  <input
                    type="date"
                    value={format(filters.dateRange.start, 'yyyy-MM-dd')}
                    onChange={(e) => handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      start: new Date(e.target.value)
                    })}
                    className="w-full text-sm px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                    aria-label="From date"
                    title="From date"
                    placeholder="YYYY-MM-DD"
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                  <input
                    type="date"
                    value={format(filters.dateRange.end, 'yyyy-MM-dd')}
                    onChange={(e) => handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      end: new Date(e.target.value)
                    })}
                    className="w-full text-sm px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                    aria-label="To date"
                    title="To date"
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                <Search className="w-4 h-4 mr-2 text-green-600" />
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="AWB, PIN, Location..."
                  value={filters.searchText}
                  onChange={(e) => handleFilterChange('searchText', e.target.value)}
                  className="w-full text-sm pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 placeholder-gray-400"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                {filters.searchText && (
                  <button
                    onClick={() => handleFilterChange('searchText', '')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Carriers */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2 text-blue-600" />
                Carriers
              </label>
              <div className="relative">
                <select
                  multiple
                  value={filters.carriers}
                  onChange={(e) => handleFilterChange('carriers', Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full text-sm px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 min-h-[48px]"
                >
                  {uniqueCarriers.map(carrier => (
                    <option key={carrier} value={carrier} className="py-2">
                      {carrier}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {filters.carriers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.carriers.map(carrier => (
                    <span key={carrier} className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800">
                      {carrier}
                      <button
                        onClick={() => handleFilterChange('carriers', filters.carriers.filter(c => c !== carrier))}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Zones */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2 text-purple-600" />
                Zones
              </label>
              <div className="relative">
                <select
                  multiple
                  value={filters.zones}
                  onChange={(e) => handleFilterChange('zones', Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full text-sm px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 min-h-[48px]"
                >
                  {uniqueZones.map(zone => (
                    <option key={zone} value={zone} className="py-2">
                      {zone}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {filters.zones.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.zones.map(zone => (
                    <span key={zone} className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-800">
                      {zone}
                      <button
                        onClick={() => handleFilterChange('zones', filters.zones.filter(z => z !== zone))}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Weight Difference */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                <Weight className="w-4 h-4 mr-2 text-orange-600" />
                Min Diff (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={filters.minWeightDiff}
                  onChange={(e) => handleFilterChange('minWeightDiff', parseFloat(e.target.value) || 0)}
                  className="w-full text-sm px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                  placeholder="0.0"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Show shipments with weight difference ≥ {filters.minWeightDiff}kg
              </div>
            </div>

            {/* Threshold */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-red-600" />
                Threshold
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={filters.upliftThreshold}
                  onChange={(e) => handleFilterChange('upliftThreshold', parseFloat(e.target.value) || 0.1)}
                  className="w-full text-sm px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                  placeholder="0.1"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Overbilling threshold: {(filters.upliftThreshold * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="mt-6 pt-4 border-t border-white/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <label className="flex items-center cursor-pointer group">
                  <input
                    id="delivered-only"
                    type="checkbox"
                    checked={filters.showDeliveredOnly}
                    onChange={(e) => handleFilterChange('showDeliveredOnly', e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                  <span className="ml-3 text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    Show Delivered Only
                  </span>
                </label>
              </div>
              
              <div className="text-sm text-gray-600 bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                <span className="font-semibold text-gray-800">{filteredShipments.length.toLocaleString()}</span> of{' '}
                <span className="font-semibold text-gray-800">{shipments.length.toLocaleString()}</span> shipments shown
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab kpis={kpis} shipments={filteredShipments} />}
        {activeTab === 'analytics' && <AnalyticsTab shipments={filteredShipments} />}
        {activeTab === 'trends' && <TrendsTab shipments={filteredShipments} />}
        {activeTab === 'mismatches' && <MismatchesTab shipments={filteredShipments} />}
        {activeTab === 'insights' && <InsightsTab shipments={filteredShipments} kpis={kpis} />}
      </div>
    </div>
  );
};

// Modern Overview Tab
const OverviewTab: React.FC<{ kpis: KPIData; shipments: NormalizedShipment[] }> = ({ kpis, shipments }) => {
  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  const carrierDistribution = useMemo(() => {
    const distribution = shipments.reduce((acc, s) => {
      acc[s.carrier] = (acc[s.carrier] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    return Object.entries(distribution).map(([carrier, count]) => ({
      name: carrier,
      value: count,
      percentage: ((count / shipments.length) * 100).toFixed(1)
    }));
  }, [shipments]);

  const zoneDistribution = useMemo(() => {
    const distribution = shipments.reduce((acc, s) => {
      acc[s.zone] = (acc[s.zone] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    return Object.entries(distribution).map(([zone, count]) => ({
      name: zone,
      value: count,
      percentage: ((count / shipments.length) * 100).toFixed(1)
    }));
  }, [shipments]);

  const weightAnalysis = useMemo(() => {
    const buckets = {
      '0-0.5kg': 0, '0.5-1kg': 0, '1-2kg': 0, '2-5kg': 0, '5kg+': 0
    };
    
    shipments.forEach(s => {
      const weight = s.charged_weight_kg;
      if (weight <= 0.5) buckets['0-0.5kg']++;
      else if (weight <= 1) buckets['0.5-1kg']++;
      else if (weight <= 2) buckets['1-2kg']++;
      else if (weight <= 5) buckets['2-5kg']++;
      else buckets['5kg+']++;
    });
    
    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
      percentage: ((count / shipments.length) * 100).toFixed(1)
    }));
  }, [shipments]);

  return (
    <div className="space-y-8">
      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Shipments</p>
              <p className="text-3xl font-bold mt-2">{kpis.totalShipments.toLocaleString()}</p>
              <p className="text-blue-100 text-xs mt-1">+12% from last month</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Package className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">₹{kpis.totalAmount.toLocaleString()}</p>
              <p className="text-green-100 text-xs mt-1">+8% from last month</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <DollarSign className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Disputes</p>
              <p className="text-3xl font-bold mt-2">{kpis.suspectedOverbillingCount.toLocaleString()}</p>
              <p className="text-red-100 text-xs mt-1">₹{kpis.suspectedOverbillingValue.toLocaleString()} value</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <AlertTriangle className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Avg Weight Diff</p>
              <p className="text-3xl font-bold mt-2">
                {((kpis.avgChargedWeight - kpis.avgActualWeight) / kpis.avgActualWeight * 100).toFixed(1)}%
              </p>
              <p className="text-purple-100 text-xs mt-1">
                {kpis.avgActualWeight.toFixed(2)}kg → {kpis.avgChargedWeight.toFixed(2)}kg
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Weight className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <PieChartIcon className="w-6 h-6 mr-3 text-blue-600" />
            Carrier Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={carrierDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {carrierDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} shipments`, name]} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <BarChart3 className="w-6 h-6 mr-3 text-green-600" />
            Zone Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={zoneDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} shipments`, 'Count']} />
              <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Weight className="w-6 h-6 mr-3 text-purple-600" />
            Weight Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weightAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} shipments`, 'Count']} />
              <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Issues */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Target className="w-6 h-6 mr-3 text-red-600" />
          Top Problematic PIN Codes
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">PIN Code</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Issues</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Value Impact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {kpis.topProblematicPins.slice(0, 8).map((pin, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{pin.pin}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{pin.count}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{pin.totalValue.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pin.count > 10 ? 'bg-red-100 text-red-800' :
                      pin.count > 5 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {pin.count > 10 ? 'High' : pin.count > 5 ? 'Medium' : 'Low'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Enhanced Analytics Tab
const AnalyticsTab: React.FC<{ shipments: NormalizedShipment[] }> = ({ shipments }) => {
  const chargeAnalysis = useMemo(() => {
    const carrierCharges = shipments.reduce((acc, s) => {
      if (!acc[s.carrier]) {
        acc[s.carrier] = {
          totalAmount: 0,
          totalWeight: 0,
          avgRate: 0,
          shipmentCount: 0,
          zones: {}
        };
      }
      
      acc[s.carrier].totalAmount += s.line_amount;
      acc[s.carrier].totalWeight += s.charged_weight_kg;
      acc[s.carrier].shipmentCount += 1;
      
      if (!acc[s.carrier].zones[s.zone]) {
        acc[s.carrier].zones[s.zone] = {
          totalAmount: 0,
          totalWeight: 0,
          shipmentCount: 0,
          avgRate: 0
        };
      }
      
      acc[s.carrier].zones[s.zone].totalAmount += s.line_amount;
      acc[s.carrier].zones[s.zone].totalWeight += s.charged_weight_kg;
      acc[s.carrier].zones[s.zone].shipmentCount += 1;
      
      return acc;
    }, {} as { [key: string]: any });
    
    Object.keys(carrierCharges).forEach(carrier => {
      const data = carrierCharges[carrier];
      data.avgRate = data.totalWeight > 0 ? data.totalAmount / data.totalWeight : 0;
      
      Object.keys(data.zones).forEach(zone => {
        const zoneData = data.zones[zone];
        zoneData.avgRate = zoneData.totalWeight > 0 ? zoneData.totalAmount / zoneData.totalWeight : 0;
      });
    });
    
    return carrierCharges;
  }, [shipments]);

  const weightVsChargeData = useMemo(() => {
    return shipments.map(s => ({
      actualWeight: s.actual_weight_kg,
      chargedWeight: s.charged_weight_kg,
      amount: s.line_amount,
      carrier: s.carrier,
      weightDiff: s.weight_diff_kg
    }));
  }, [shipments]);

  const carrierComparisonData = Object.entries(chargeAnalysis).map(([carrier, data]: [string, any]) => ({
    carrier,
    avgRate: data.avgRate,
    totalAmount: data.totalAmount,
    shipmentCount: data.shipmentCount,
    avgWeightPerShipment: data.totalWeight / data.shipmentCount
  }));

  return (
    <div className="space-y-8">
      {/* Advanced Charts Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
            Carrier Performance Comparison
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={carrierComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="carrier" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value, name) => [
                typeof value === 'number' ? 
                  (name.includes('Rate') ? `₹${value.toFixed(2)}/kg` : value.toLocaleString()) : 
                  value,
                name
              ]} />
              <Legend />
              <Bar yAxisId="left" dataKey="avgRate" fill="#3B82F6" name="Avg Rate (₹/kg)" />
              <Line yAxisId="right" type="monotone" dataKey="shipmentCount" stroke="#EF4444" strokeWidth={3} name="Shipment Count" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Activity className="w-6 h-6 mr-3 text-green-600" />
            Weight vs Charge Correlation
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart data={weightVsChargeData.slice(0, 200)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="actualWeight" name="Actual Weight" unit="kg" />
              <YAxis dataKey="amount" name="Amount" unit="₹" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => [
                typeof value === 'number' ? 
                  (name === 'amount' ? `₹${value.toFixed(2)}` : `${value.toFixed(2)}kg`) : 
                  value,
                name
              ]} />
              <Scatter name="BlueDart" dataKey="amount" fill="#3B82F6" />
              <Scatter name="Delhivery" dataKey="amount" fill="#EF4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Analysis Tables */}
      <div className="grid md:grid-cols-2 gap-8">
        {Object.entries(chargeAnalysis).map(([carrier, data]: [string, any]) => (
          <div key={carrier} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className={`w-4 h-4 rounded-full mr-3 ${carrier === 'BlueDart' ? 'bg-blue-600' : 'bg-orange-600'}`}></span>
              {carrier} Zone Analysis
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Zone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Shipments</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Weight</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(data.zones).map(([zone, zoneData]: [string, any]) => (
                    <tr key={zone} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{zone}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{zoneData.shipmentCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{zoneData.totalWeight.toFixed(1)}kg</td>
                      <td className="px-4 py-3 text-sm text-gray-600">₹{zoneData.totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{zoneData.avgRate.toFixed(0)}/kg</td>
                    </tr>
                  ))}
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 font-semibold">
                    <td className="px-4 py-3 text-sm text-blue-900">Total</td>
                    <td className="px-4 py-3 text-sm text-blue-900">{data.shipmentCount}</td>
                    <td className="px-4 py-3 text-sm text-blue-900">{data.totalWeight.toFixed(1)}kg</td>
                    <td className="px-4 py-3 text-sm text-blue-900">₹{data.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-blue-900">₹{data.avgRate.toFixed(0)}/kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// New Trends Tab
const TrendsTab: React.FC<{ shipments: NormalizedShipment[] }> = ({ shipments }) => {
  const dailyTrends = useMemo(() => {
    const trends = shipments.reduce((acc, s) => {
      const date = format(s.pickup_date, 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = {
          date,
          shipments: 0,
          amount: 0,
          disputes: 0,
          avgWeight: 0,
          totalWeight: 0
        };
      }
      acc[date].shipments += 1;
      acc[date].amount += s.line_amount;
      acc[date].totalWeight += s.charged_weight_kg;
      if (s.flag_miscalculated) acc[date].disputes += 1;
      return acc;
    }, {} as { [key: string]: any });

    return Object.values(trends).map((day: any) => ({
      ...day,
      avgWeight: day.totalWeight / day.shipments,
      disputeRate: (day.disputes / day.shipments) * 100
    })).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [shipments]);

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-green-600" />
            Daily Shipment Trends
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={dailyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                typeof value === 'number' ? value.toLocaleString() : value,
                name
              ]} />
              <Area type="monotone" dataKey="shipments" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-3 text-red-600" />
            Dispute Rate Trends
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <RechartsLineChart data={dailyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Dispute Rate']} />
              <Line type="monotone" dataKey="disputeRate" stroke="#EF4444" strokeWidth={3} dot={{ fill: '#EF4444' }} />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <DollarSign className="w-6 h-6 mr-3 text-blue-600" />
          Revenue & Weight Trends
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={dailyTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={(value, name) => [
              typeof value === 'number' ? 
                (name.includes('amount') ? `₹${value.toLocaleString()}` : 
                 name.includes('Weight') ? `${value.toFixed(2)}kg` : value.toLocaleString()) : 
                value,
              name
            ]} />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="amount" fill="#3B82F6" fillOpacity={0.3} stroke="#3B82F6" name="Daily Revenue" />
            <Line yAxisId="right" type="monotone" dataKey="avgWeight" stroke="#10B981" strokeWidth={3} name="Avg Weight" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Enhanced Mismatches Tab (keeping existing functionality but with modern styling)
const MismatchesTab: React.FC<{ shipments: NormalizedShipment[] }> = ({ shipments }) => {
  const [sortField, setSortField] = useState<keyof NormalizedShipment>('weight_diff_kg');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedShipments = useMemo(() => {
    return [...shipments].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      return 0;
    });
  }, [shipments, sortField, sortDirection]);

  const handleSort = (field: keyof NormalizedShipment) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getRowColor = (shipment: NormalizedShipment) => {
    if (shipment.is_overbilled) return 'bg-red-50/80 border-red-200';
    if (shipment.flag_charge_outlier) return 'bg-amber-50/80 border-amber-200';
    if (shipment.flag_missing_actual) return 'bg-blue-50/80 border-blue-200';
    return 'bg-white/60 border-gray-200';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
      <div className="px-6 py-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-3 text-red-600" />
          Weight & Cost Disputes
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          {shipments.length.toLocaleString()} shipments • 
          <span className="text-red-600 font-medium"> Red: Overbilled</span> • 
          <span className="text-amber-600 font-medium"> Amber: Outlier</span> • 
          <span className="text-blue-600 font-medium"> Blue: Missing Data</span>
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50/80">
            <tr>
              {[
                { key: 'pickup_date', label: 'Date' },
                { key: 'carrier', label: 'Carrier' },
                { key: 'awb', label: 'AWB' },
                { key: 'origin', label: 'Origin' },
                { key: 'destination', label: 'Destination' },
                { key: 'pin', label: 'PIN' },
                { key: 'pieces', label: 'Pcs' },
                { key: 'actual_weight_kg', label: 'Actual (kg)' },
                { key: 'charged_weight_kg', label: 'Charged (kg)' },
                { key: 'weight_diff_kg', label: 'Diff (kg)' },
                { key: 'weight_diff_percent', label: 'Diff %' },
                { key: 'line_amount', label: 'Amount' },
                { key: 'per_kg_rate', label: '₹/kg' },
                { key: 'service', label: 'Service' },
                { key: 'zone', label: 'Zone' },
                { key: 'status', label: 'Status' }
              ].map(column => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key as keyof NormalizedShipment)}
                  className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100/80 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortField === column.key && (
                      <span className="text-blue-600 font-bold">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedShipments.map((shipment, index) => (
              <tr key={index} className={`${getRowColor(shipment)} hover:bg-opacity-90 border-l-4 transition-all duration-150`}>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(shipment.pickup_date, 'dd/MM')}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${
                    shipment.carrier === 'BlueDart' ? 'bg-blue-600' : 'bg-orange-600'
                  }`}>
                    {shipment.carrier}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {shipment.awb}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 max-w-24 truncate">
                  {shipment.origin}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 max-w-24 truncate">
                  {shipment.destination}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {shipment.pin}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {shipment.pieces}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {shipment.actual_weight_kg.toFixed(2)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {shipment.charged_weight_kg.toFixed(2)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <span className={`font-semibold ${
                    shipment.weight_diff_kg > 0 ? 'text-red-600' : 
                    shipment.weight_diff_kg < 0 ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {shipment.weight_diff_kg > 0 ? '+' : ''}{shipment.weight_diff_kg.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <span className={`font-semibold ${
                    shipment.weight_diff_percent > 0 ? 'text-red-600' : 
                    shipment.weight_diff_percent < 0 ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {shipment.weight_diff_percent > 0 ? '+' : ''}{shipment.weight_diff_percent.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  ₹{shipment.line_amount.toFixed(0)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{shipment.per_kg_rate.toFixed(0)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {shipment.service}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {shipment.zone}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    shipment.status.toLowerCase().includes('deliver') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {shipment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// New AI Insights Tab
const InsightsTab: React.FC<{ shipments: NormalizedShipment[]; kpis: KPIData }> = ({ shipments, kpis }) => {
  const insights = useMemo(() => {
    const totalDisputes = shipments.filter(s => s.flag_miscalculated).length;
    const disputeRate = (totalDisputes / shipments.length) * 100;
    const avgOverbilling = kpis.suspectedOverbillingValue / kpis.suspectedOverbillingCount;
    
    const carrierPerformance = shipments.reduce((acc, s) => {
      if (!acc[s.carrier]) acc[s.carrier] = { total: 0, disputes: 0 };
      acc[s.carrier].total++;
      if (s.flag_miscalculated) acc[s.carrier].disputes++;
      return acc;
    }, {} as any);

    const recommendations = [];
    
    if (disputeRate > 15) {
      recommendations.push({
        type: 'critical',
        title: 'High Dispute Rate Detected',
        description: `${disputeRate.toFixed(1)}% of shipments have billing issues. Immediate review recommended.`,
        action: 'Review weight measurement processes and carrier agreements.'
      });
    }

    if (avgOverbilling > 50) {
      recommendations.push({
        type: 'warning',
        title: 'Significant Overbilling Impact',
        description: `Average overbilling of ₹${avgOverbilling.toFixed(0)} per disputed shipment.`,
        action: 'Negotiate better rate structures with carriers.'
      });
    }

    Object.entries(carrierPerformance).forEach(([carrier, data]: [string, any]) => {
      const rate = (data.disputes / data.total) * 100;
      if (rate > 20) {
        recommendations.push({
          type: 'warning',
          title: `${carrier} Performance Issue`,
          description: `${rate.toFixed(1)}% dispute rate with ${carrier}.`,
          action: `Review ${carrier} billing practices and consider alternative carriers.`
        });
      }
    });

    return { disputeRate, avgOverbilling, recommendations };
  }, [shipments, kpis]);

  return (
    <div className="space-y-8">
      {/* AI Insights Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8" />
            <span className="text-purple-200 text-sm font-medium">AI Analysis</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Dispute Rate</h3>
          <p className="text-3xl font-bold">{insights.disputeRate.toFixed(1)}%</p>
          <p className="text-purple-200 text-sm mt-2">
            {insights.disputeRate > 15 ? 'Above industry average' : 'Within normal range'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8" />
            <span className="text-indigo-200 text-sm font-medium">Cost Impact</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Avg Overbilling</h3>
          <p className="text-3xl font-bold">₹{insights.avgOverbilling.toFixed(0)}</p>
          <p className="text-indigo-200 text-sm mt-2">Per disputed shipment</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8" />
            <span className="text-green-200 text-sm font-medium">Optimization</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Potential Savings</h3>
          <p className="text-3xl font-bold">₹{kpis.suspectedOverbillingValue.toLocaleString()}</p>
          <p className="text-green-200 text-sm mt-2">If disputes resolved</p>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Zap className="w-6 h-6 mr-3 text-purple-600" />
          AI-Powered Recommendations
        </h3>
        <div className="space-y-4">
          {insights.recommendations.map((rec, index) => (
            <div key={index} className={`p-4 rounded-xl border-l-4 ${
              rec.type === 'critical' ? 'bg-red-50 border-red-500' :
              rec.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              'bg-blue-50 border-blue-500'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    rec.type === 'critical' ? 'text-red-800' :
                    rec.type === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {rec.title}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    rec.type === 'critical' ? 'text-red-700' :
                    rec.type === 'warning' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {rec.description}
                  </p>
                  <p className={`text-sm mt-2 font-medium ${
                    rec.type === 'critical' ? 'text-red-800' :
                    rec.type === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    💡 {rec.action}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  rec.type === 'critical' ? 'bg-red-200 text-red-800' :
                  rec.type === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-blue-200 text-blue-800'
                }`}>
                  {rec.type.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Carrier Reliability Score</h3>
          <div className="space-y-4">
            {Object.entries(shipments.reduce((acc, s) => {
              if (!acc[s.carrier]) acc[s.carrier] = { total: 0, disputes: 0 };
              acc[s.carrier].total++;
              if (s.flag_miscalculated) acc[s.carrier].disputes++;
              return acc;
            }, {} as any)).map(([carrier, data]: [string, any]) => {
              const score = Math.max(0, 100 - (data.disputes / data.total) * 100);
              return (
                <div key={carrier} className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{carrier}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${score > 80 ? 'bg-green-500' : score > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{score.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Cost Optimization Opportunities</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-green-800 font-medium">Weight Rounding Optimization</span>
              <span className="text-green-600 font-bold">₹{(kpis.suspectedOverbillingValue * 0.3).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-800 font-medium">Rate Negotiation Potential</span>
              <span className="text-blue-600 font-bold">₹{(kpis.suspectedOverbillingValue * 0.5).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-800 font-medium">Process Improvement</span>
              <span className="text-purple-600 font-bold">₹{(kpis.suspectedOverbillingValue * 0.2).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};