import express from 'express';
import { deployToVercel, deleteVercelDeployment } from '../services/vercel.service.js';
import { authUser } from '../middlewares/auth.js';
import User from '../models/user.model.js';

const router = express.Router();

router.post('/vercel', authUser, async (req, res) => {
  try {
    const { projectName, fileTrees } = req.body;
    
    // Get user's stored Vercel token
    const user = await User.findById(req.user.userId).select('vercelToken');
    
    if (!user.vercelToken) {
      return res.status(400).json({
        success: false,
        error: 'Vercel token not found. Please add your Vercel token first.'
      });
    }

    const result = await deployToVercel(fileTrees, projectName, user.vercelToken);
    console.log(result);
    // Save deployment info to user's project
    if (result.success) {
      const newdata = await User.findByIdAndUpdate(req.user.userId, {
        $push: {
          deployments: {
            projectName,
            platform: 'vercel',
            url: result.url,
            deploymentId: result.deploymentId,
            deployedAt: new Date()
          }
        }
      },{
        new: true
      });
      console.log(newdata);
    }    
    console.log(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/deployments', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('deployments');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      deployments: user.deployments || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.delete('/vercel/:deploymentId', authUser, async (req, res) => {
  try {
    const { deploymentId } = req.params;
    
    // Get user's stored Vercel token
    const user = await User.findById(req.user.userId).select('vercelToken');
    
    if (!user.vercelToken) {
      return res.status(400).json({
        success: false,
        error: 'Vercel token not found. Please add your Vercel token first.'
      });
    }

    // Delete deployment from Vercel
    const result = await deleteVercelDeployment(deploymentId, user.vercelToken);
    
    if (result.success) {
      // Remove deployment from user's deployments array
      await User.findByIdAndUpdate(req.user.userId, {
        $pull: {
          deployments: { deploymentId: deploymentId }
        }
      });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
