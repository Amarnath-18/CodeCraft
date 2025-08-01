import axios from 'axios';
export const deployToVercel = async (fileTrees, projectName, vercelToken) => {
  try {
    // Convert fileTrees to Vercel deployment format (array of files)
    const files = [];
    
    const processFileTree = (tree, basePath = '') => {
      Object.entries(tree).forEach(([name, item]) => {
        const fullPath = basePath ? `${basePath}/${name}` : name;
        
        if (item.file) {
          files.push({
            file: fullPath,
            data: item.file.contents
          });
        } else if (item.directory) {
          processFileTree(item.directory, fullPath);
        }
      });
    };

    processFileTree(fileTrees);

    const deploymentPayload = {
      name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      files,
      projectSettings: {
        framework: 'vite',
        buildCommand: 'npm run build',
        outputDirectory: 'dist',
        installCommand: 'npm install',
      }
    };

    const response = await axios.post(
      'https://api.vercel.com/v13/deployments',
      deploymentPayload,
      {
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      url: `https://${response.data.url}`,
      deploymentId: response.data.id,
      inspectorUrl: response.data.inspectorUrl
    };
  } catch (error) {
    console.error('Vercel deployment error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};

