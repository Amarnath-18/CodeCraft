import { useState } from 'react';
import axiosInstance from '../config/AxiosInstance';
import toast from 'react-hot-toast';

const DeploymentModal = ({ isOpen, onClose, projectName, fileTrees }) => {
  const [deploying, setDeploying] = useState(false);
  const [vercelToken, setVercelToken] = useState('');
  const [deploymentResult, setDeploymentResult] = useState(null);

  const handleDeploy = async () => {
    if (!vercelToken.trim()) {
      toast.error('Please enter your Vercel token');
      return;
    }

    setDeploying(true);
    try {
      const response = await axiosInstance.post('/deploy/vercel', {
        projectName,
        fileTrees,
        vercelToken
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
            <div>
              <label className="block text-sm font-medium mb-2">
                Vercel Token
              </label>
              <input
                type="password"
                value={vercelToken}
                onChange={(e) => setVercelToken(e.target.value)}
                placeholder="Enter your Vercel API token"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your token from{' '}
                <a 
                  href="https://vercel.com/account/tokens" 
                  target="_blank" 
                  className="text-blue-500 underline"
                >
                  Vercel Settings
                </a>
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