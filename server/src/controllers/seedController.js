import { seedDatabase } from '../scripts/seed.js';

// @desc    Seed demo database
// @route   POST /api/seed
// @access  Public
export const triggerSeed = async (req, res, next) => {
  try {
    const result = await seedDatabase();
    res.status(200).json({
      success: true,
      message: 'MongoDB Atlas database populated with default Zyntra dataset successfully',
      result,
    });
  } catch (error) {
    next(error);
  }
};
