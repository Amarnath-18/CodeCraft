import express from 'express';
import { deployToVercel } from '../services/vercel.service.js';
import { authUser } from '../middlewares/auth.js';
import User from '../models/user.model.js';

const router = express.Router();

router.post('/vercel', authUser, async (req, res) => {
  try {
    const { projectName, fileTrees, vercelToken } = req.body;
    
    if (!vercelToken) {
      return res.status(400).json({
        success: false,
        error: 'Vercel token is required'
      });
    }

    const result = await deployToVercel(fileTrees, projectName, vercelToken);
    
    // Save deployment info to user's project
    if (result.success) {
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          deployments: {
            projectName,
            platform: 'vercel',
            url: result.url,
            deploymentId: result.deploymentId,
            deployedAt: new Date()
          }
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

export default router;
