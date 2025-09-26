import express from 'express';
import VillainImageService from '../../services/villainImageService';

const router = express.Router();

/**
 * GET /api/images/villains
 * Get list of all villains with available images
 */
router.get('/villains', async (req, res) => {
  try {
    const availableVillains = await VillainImageService.getAvailableVillains();
    res.json({
      success: true,
      villains: availableVillains,
      count: availableVillains.length
    });
  } catch (error) {
    console.error('Error fetching available villains:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch villain list'
    });
  }
});

/**
 * GET /api/images/villains/:villainId
 * Get all images for a specific villain
 */
router.get('/villains/:villainId', async (req, res) => {
  try {
    const { villainId } = req.params;
    const images = await VillainImageService.getVillainImages(villainId);
    
    if (!images) {
      return res.status(404).json({
        success: false,
        error: `No images found for villain: ${villainId}`
      });
    }
    
    res.json({
      success: true,
      images
    });
  } catch (error) {
    console.error(`Error fetching images for villain ${req.params.villainId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch villain images'
    });
  }
});

/**
 * GET /api/images/villains/:villainId/round/:round
 * Get contextual image for specific game round
 */
router.get('/villains/:villainId/round/:round', async (req, res) => {
  try {
    const { villainId, round } = req.params;
    const roundNumber = parseInt(round, 10);
    
    if (!Number.isInteger(roundNumber) || roundNumber < 1 || roundNumber > 4) {
      return res.status(400).json({
        success: false,
        error: 'Round must be a number between 1 and 4'
      });
    }
    
    const imageUrl = await VillainImageService.getContextualImage(villainId, roundNumber);
    
    if (!imageUrl) {
      return res.status(404).json({
        success: false,
        error: `No image found for villain ${villainId}, round ${round}`
      });
    }
    
    res.json({
      success: true,
      imageUrl,
      villain: villainId,
      round: roundNumber
    });
  } catch (error) {
    console.error(`Error fetching round image for ${req.params.villainId}, round ${req.params.round}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch round image'
    });
  }
});

/**
 * GET /api/images/villains/:villainId/primary
 * Get primary portrait image for villain
 */
router.get('/villains/:villainId/primary', async (req, res) => {
  try {
    const { villainId } = req.params;
    const imageUrl = await VillainImageService.getPrimaryImage(villainId);
    
    if (!imageUrl) {
      return res.status(404).json({
        success: false,
        error: `No primary image found for villain: ${villainId}`
      });
    }
    
    res.json({
      success: true,
      imageUrl,
      villain: villainId
    });
  } catch (error) {
    console.error(`Error fetching primary image for villain ${req.params.villainId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch primary image'
    });
  }
});

/**
 * GET /api/images/villains/:villainId/validate
 * Validate that villain has sufficient images for game session
 */
router.get('/villains/:villainId/validate', async (req, res) => {
  try {
    const { villainId } = req.params;
    const isValid = await VillainImageService.validateGameImages(villainId);
    
    res.json({
      success: true,
      villain: villainId,
      isValid,
      ready: isValid ? 'Game ready' : 'Insufficient images'
    });
  } catch (error) {
    console.error(`Error validating images for villain ${req.params.villainId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate villain images'
    });
  }
});

export default router;