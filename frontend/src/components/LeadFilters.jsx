import React from 'react';
import { X } from 'lucide-react';

const LeadFilters = ({ filters, onFiltersChange }) => {
  const handleChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      source: '',
      is_qualified: '',
      score_min: '',
      score_max: '',
      value_min: '',
      value_max: '',
      date_from: '',
      date_to: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
        <button
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="select"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="lost">Lost</option>
            <option value="won">Won</option>
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <select
            value={filters.source}
            onChange={(e) => handleChange('source', e.target.value)}
            className="select"
          >
            <option value="">All Sources</option>
            <option value="website">Website</option>
            <option value="facebook_ads">Facebook Ads</option>
            <option value="google_ads">Google Ads</option>
            <option value="referral">Referral</option>
            <option value="events">Events</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Qualified Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Qualified
          </label>
          <select
            value={filters.is_qualified}
            onChange={(e) => handleChange('is_qualified', e.target.value)}
            className="select"
          >
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Score Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Score Range
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              min="0"
              max="100"
              placeholder="Min"
              value={filters.score_min}
              onChange={(e) => handleChange('score_min', e.target.value)}
              className="input flex-1"
            />
            <span className="text-gray-500 self-center">-</span>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="Max"
              value={filters.score_max}
              onChange={(e) => handleChange('score_max', e.target.value)}
              className="input flex-1"
            />
          </div>
        </div>

        {/* Value Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Value Range ($)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Min"
              value={filters.value_min}
              onChange={(e) => handleChange('value_min', e.target.value)}
              className="input flex-1"
            />
            <span className="text-gray-500 self-center">-</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Max"
              value={filters.value_max}
              onChange={(e) => handleChange('value_max', e.target.value)}
              className="input flex-1"
            />
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Created Date Range
          </label>
          <div className="flex space-x-2">
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleChange('date_from', e.target.value)}
              className="input flex-1"
            />
            <span className="text-gray-500 self-center">-</span>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleChange('date_to', e.target.value)}
              className="input flex-1"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (value === '') return null;
              
              let displayValue = value;
              if (key === 'is_qualified') {
                displayValue = value === 'true' ? 'Qualified: Yes' : 'Qualified: No';
              } else if (key === 'status') {
                displayValue = `Status: ${value}`;
              } else if (key === 'source') {
                displayValue = `Source: ${value.replace('_', ' ')}`;
              } else if (key === 'score_min' || key === 'score_max') {
                displayValue = `Score ${key.includes('min') ? '≥' : '≤'} ${value}`;
              } else if (key === 'value_min' || key === 'value_max') {
                displayValue = `Value ${key.includes('min') ? '≥' : '≤'} $${value}`;
              } else if (key === 'date_from' || key === 'date_to') {
                displayValue = `Date ${key.includes('from') ? '≥' : '≤'} ${value}`;
              }

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {displayValue}
                  <button
                    onClick={() => handleChange(key, '')}
                    className="ml-1.5 text-primary-600 hover:text-primary-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadFilters;
