import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/AxiosInstance';
import toast from 'react-hot-toast';

const Deployments = () => {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasVercelToken, setHasVercelToken] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [vercelToken, setVercelToken] = useState('');
  const [deletingDeployment, setDeletingDeployment] = useState(null);

  useEffect(() => {
    fetchDeployments();
    checkVercelToken();
  }, []);

  const checkVercelToken = async () => {
    try {
      const response = await axiosInstance.get('/user/vercel-token');
      if (response.data.success) {
        setHasVercelToken(response.data.hasToken);
      }
    } catch (error) {
      console.error('Failed to check Vercel token:', error);
    }
  };

  const fetchDeployments = async () => {
    try {
      const response = await axiosInstance.get('/deploy/deployments');
      if (response.data.success) {
        setDeployments(response.data.deployments);
      }
    } catch (error) {
      toast.error('Failed to fetch deployments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveVercelToken = async () => {
    try {
      const response = await axiosInstance.post('/user/vercel-token', {
        vercelToken: vercelToken
      });
      
      if (response.data.success) {
        setHasVercelToken(true);
        setShowTokenModal(false);
        setVercelToken('');
        toast.success('Vercel token saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save Vercel token');
      console.error(error);
    }
  };

  const deleteVercelToken = async () => {
    try {
      const response = await axiosInstance.delete('/user/vercel-token');
      
      if (response.data.success) {
        setHasVercelToken(false);
        toast.success('Vercel token deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete Vercel token');
      console.error(error);
    }
  };

  const deleteDeployment = async (deploymentId) => {
    if (!window.confirm('Are you sure you want to delete this deployment?')) {
      return;
    }

    setDeletingDeployment(deploymentId);
    
    try {
      const response = await axiosInstance.delete(`/deploy/vercel/${deploymentId}`);
      
      if (response.data.success) {
        setDeployments(deployments.filter(d => d.deploymentId !== deploymentId));
        toast.success('Deployment deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete deployment');
      console.error(error);
    } finally {
      setDeletingDeployment(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'vercel':
        return '▲';
      case 'netlify':
        return '🌐';
      default:
        return '🚀';
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'vercel':
        return 'bg-black text-white';
      case 'netlify':
        return 'bg-teal-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deployments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 My Deployments</h1>
            <p className="text-gray-600">Manage and view all your deployed projects</p>
          </div>
          
          <div className="flex items-center gap-4">
            {hasVercelToken ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <i className="ri-check-line"></i>
                  Vercel token configured
                </span>
                <button
                  onClick={deleteVercelToken}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Remove Token
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTokenModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <i className="ri-key-line"></i>
                Add Vercel Token
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <i className="ri-rocket-line text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Deployments</p>
                <p className="text-2xl font-bold text-gray-900">{deployments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <i className="ri-check-line text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Sites</p>
                <p className="text-2xl font-bold text-gray-900">{deployments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <i className="ri-calendar-line text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deployments.filter(d => 
                    new Date(d.deployedAt).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Deployments List */}
        {deployments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No deployments yet</h3>
            <p className="text-gray-600 mb-6">Deploy your first project to see it here!</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Projects
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">All Deployments</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {deployments.map((deployment, index) => (
                <div key={deployment._id || index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPlatformColor(deployment.platform)}`}>
                        {getPlatformIcon(deployment.platform)} {deployment.platform}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {deployment.projectName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Deployed {formatDate(deployment.deployedAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <a
                        href={deployment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <i className="ri-external-link-line"></i>
                        Visit Site
                      </a>
                      
                      <button
                        onClick={() => navigator.clipboard.writeText(deployment.url)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        title="Copy URL"
                      >
                        <i className="ri-file-copy-line"></i>
                      </button>
                      
                      <button
                        onClick={() => deleteDeployment(deployment.deploymentId)}
                        disabled={deletingDeployment === deployment.deploymentId}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Deployment"
                      >
                        {deletingDeployment === deployment.deploymentId ? (
                          <i className="ri-loader-4-line animate-spin"></i>
                        ) : (
                          <i className="ri-delete-bin-line"></i>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 font-mono break-all">
                      {deployment.url}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Vercel Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Vercel Token</h3>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Enter your Vercel API token to enable deployment management.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                You can get your token from{' '}
                <a 
                  href="https://vercel.com/account/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Vercel Settings
                </a>
              </p>
              
              <input
                type="password"
                value={vercelToken}
                onChange={(e) => setVercelToken(e.target.value)}
                placeholder="Enter your Vercel token"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTokenModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveVercelToken}
                disabled={!vercelToken.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deployments;