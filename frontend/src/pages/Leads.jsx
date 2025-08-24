import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { leadsAPI } from '../services/api';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import LeadFilters from '../components/LeadFilters';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

// Import AG Grid styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, leadId: null, leadName: '' });

  const navigate = useNavigate();

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'Name',
      field: 'full_name',
      sortable: true,
      filter: true,
      width: 150,
      cellRenderer: (params) => (
        <div className="font-medium text-gray-900">
          {params.data.first_name} {params.data.last_name}
        </div>
      )
    },
    {
      headerName: 'Email',
      field: 'email',
      sortable: true,
      filter: true,
      width: 200,
      cellRenderer: (params) => (
        <div className="text-gray-600">{params.value}</div>
      )
    },
    {
      headerName: 'Company',
      field: 'company',
      sortable: true,
      filter: true,
      width: 150,
      cellRenderer: (params) => (
        <div className="text-gray-600">{params.value || '-'}</div>
      )
    },
    {
      headerName: 'Phone',
      field: 'phone',
      sortable: true,
      filter: true,
      width: 130,
      cellRenderer: (params) => (
        <div className="text-gray-600">{params.value || '-'}</div>
      )
    },
    {
      headerName: 'Location',
      field: 'city',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params) => (
        <div className="text-gray-600">
          {params.data.city && params.data.state 
            ? `${params.data.city}, ${params.data.state}`
            : params.data.city || params.data.state || '-'
          }
        </div>
      )
    },
    {
      headerName: 'Source',
      field: 'source',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params) => (
        <span className="badge bg-blue-100 text-blue-800">
          {params.value.replace('_', ' ')}
        </span>
      )
    },
    {
      headerName: 'Status',
      field: 'status',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params) => {
        const statusClasses = {
          new: 'badge-new',
          contacted: 'badge-contacted',
          qualified: 'badge-qualified',
          lost: 'badge-lost',
          won: 'badge-won'
        };
        return (
          <span className={`badge ${statusClasses[params.value]}`}>
            {params.value}
          </span>
        );
      }
    },
    {
      headerName: 'Score',
      field: 'score',
      sortable: true,
      filter: true,
      width: 80,
      cellRenderer: (params) => (
        <div className="text-gray-600">{params.value}</div>
      )
    },
    {
      headerName: 'Value',
      field: 'lead_value',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params) => (
        <div className="text-gray-600">
          ${params.value ? params.value.toLocaleString() : '0'}
        </div>
      )
    },
    {
      headerName: 'Qualified',
      field: 'is_qualified',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params) => (
        <span className={`badge ${params.value ? 'badge-success' : 'badge-warning'}`}>
          {params.value ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      headerName: 'Created',
      field: 'created_at',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params) => (
        <div className="text-gray-600">
          {new Date(params.value).toLocaleDateString()}
        </div>
      )
    },
    {
      headerName: 'Actions',
      field: 'actions',
      sortable: false,
      filter: false,
      width: 120,
      cellRenderer: (params) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/leads/${params.data._id}/edit`)}
            className="text-primary-600 hover:text-primary-800"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteModal({ 
              show: true, 
              leadId: params.data._id, 
              leadName: `${params.data.first_name} ${params.data.last_name}` 
            })}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ], [navigate]);

  // AG Grid default column properties
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 120,
    maxWidth: 300,
    resizable: true,
    sortable: true,
    filter: true,
    suppressMenu: false,
    floatingFilter: false,
    suppressSizeToFit: false,
  }), []);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      
      // Filter out empty values to prevent validation errors
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      const params = {
        ...cleanFilters,
        page: pagination.page,
        limit: pagination.limit
      };
      
      const response = await leadsAPI.getLeads(params);
      console.log('Leads API response:', response.data);
      setLeads(response.data.data || []);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Load leads on component mount and when filters/pagination change
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle pagination change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle lead deletion
  const handleDeleteLead = async () => {
    try {
      await leadsAPI.deleteLead(deleteModal.leadId);
      setDeleteModal({ show: false, leadId: null, leadName: '' });
      fetchLeads(); // Refresh the list
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  if (loading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show empty state if no leads
  if (!loading && leads.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your leads and track their progress
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link
              to="/leads/new"
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Link>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leads</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first lead.
          </p>
          <div className="mt-6">
            <Link
              to="/leads/new"
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Link>
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
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your leads and track their progress
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <Link
            to="/leads/new"
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Link>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <LeadFilters
          filters={filters}
          onFiltersChange={handleFilterChange}
        />
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search leads..."
          value={filters.search}
          onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
          className="input pl-10 w-full max-w-md"
        />
      </div>

      {/* AG Grid */}
      <div className="ag-theme-alpine w-full" style={{ height: '600px' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={leads}
          defaultColDef={defaultColDef}
          pagination={false}
          paginationPageSize={pagination.limit}
          domLayout="normal"
          animateRows={true}
          suppressRowClickSelection={true}
          suppressCellFocus={true}
          rowHeight={50}
          headerHeight={50}
          enableCellTextSelection={true}
          suppressMovableColumns={false}
          suppressColumnVirtualisation={false}
          suppressRowVirtualisation={false}
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} results
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="btn btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, leadId: null, leadName: '' })}
        onConfirm={handleDeleteLead}
        title="Delete Lead"
        message={`Are you sure you want to delete ${deleteModal.leadName}? This action cannot be undone.`}
      />
    </div>
  );
};

export default Leads;
