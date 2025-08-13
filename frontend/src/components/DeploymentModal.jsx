import { useState, useEffect } from 'react';
import axiosInstance from '../config/AxiosInstance';
import toast from 'react-hot-toast';

const DeploymentModal = ({ isOpen, onClose, projectName, fileTrees }) => {
  const [deploying, setDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState(null);
  const [hasVercelToken, setHasVercelToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    if (isOpen) {
      checkVercelToken();
    }
  }, [isOpen]);

  const checkVercelToken = async () => {
    try {
      const response = await axiosInstance.get('/user/vercel-token');
      if (response.data.success) {
        setHasVercelToken(response.data.hasToken);
      }
    } catch (error) {
      console.error('Failed to check Vercel token:', error);
      setHasVercelToken(false);
    } finally {
      setCheckingToken(false);
    }
  };

  const handleDeploy = async () => {
    if (!hasVercelToken) {
      toast.error('Please add your Vercel token first');
      return;
    }

    setDeploying(true);
    try {
      const response = await axiosInstance.post('/deploy/vercel', {
        projectName,
        fileTrees
      });

      if (response.data.success) {
        setDeploymentResult(response.data);
        toast.success('🚀 Deployed successfully!');
      } else {
        toast.error(`Deployment failed: ${response.data.error}`);
      }
    } catch (error) {
      toast.error('Deployment error occurred');
      console.error(error);
    } finally {
      setDeploying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">🚀 Deploy to Vercel</h2>
        
        {deploymentResult ? (
          <div className="text-center space-y-4">
            <div className="text-green-600 text-lg">✅ Deployed Successfully!</div>
            <div className="space-y-2">
              <a 
                href={deploymentResult.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 bg-blue-50 text-blue-600 rounded border hover:bg-blue-100"
              >
                🌐 View Live Site
              </a>
              {deploymentResult.inspectorUrl && (
                <a 
                  href={deploymentResult.inspectorUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-3 bg-gray-50 text-gray-600 rounded border hover:bg-gray-100"
                >
                  📊 View Deployment Details
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {checkingToken ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Checking Vercel token...</p>
              </div>
            ) : !hasVercelToken ? (
              <div className="text-center py-4">
                <div className="text-yellow-600 text-lg mb-2">⚠️</div>
                <p className="text-gray-600 mb-4">
                  No Vercel token found. Please add your Vercel token to deploy.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    // Redirect to deployments page where they can add token
                    window.location.href = '/deployments';
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Vercel Token
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-green-600 text-lg mb-2">✅</div>
                  <p className="text-gray-600 mb-4">
                    Ready to deploy <strong>{projectName}</strong> to Vercel
                  </p>
                </div>
                
                <button
                  onClick={handleDeploy}
                  disabled={deploying}
                  className="w-full p-3 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {deploying ? '🚀 Deploying...' : '🚀 Deploy to Vercel'}
                </button>
              </div>
            )}
          </div>
        )}
        
        <button 
          onClick={onClose} 
          className="mt-4 w-full p-2 border rounded hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DeploymentModal;