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
      target: "production",
      projectSettings: {
        framework: "vite",
        buildCommand: "npm run build",
        outputDirectory: "dist",
        installCommand: "npm install",
        devCommand: "npm run dev"
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

    console.log('Vercel deployment response:', response.data);

    // Get the production URL - check for alias first, then fallback to url
    let finalUrl = response.data.url;
    
    if (response.data.alias && response.data.alias.length > 0) {
      finalUrl = response.data.alias[0];
    }

    return {
      success: true,
      url: `https://${finalUrl}`,
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

export const deleteVercelDeployment = async (deploymentId, vercelToken) => {
  try {
    const response = await axios.delete(
      `https://api.vercel.com/v13/deployments/${deploymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Vercel deployment deletion response:', response.data);

    return {
      success: true,
      message: 'Deployment deleted successfully'
    };
  } catch (error) {
    console.error('Vercel deployment deletion error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};
