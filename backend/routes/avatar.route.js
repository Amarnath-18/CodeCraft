import express from 'express';
const router = express.Router();

router.get('/avatar/:seed', async (req, res) => {
  try {
    const { seed } = req.params;
    const response = await fetch(`https://api.dicebear.com/8.x/pixel-art/svg?seed=${seed}`);
    const svg = await response.text();
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch avatar' });
  }
});

export default router;