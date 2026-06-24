const express = require('express');
const {
  getAllUsers,
  suspendUser,
  activateUser,
  verifyFreelancer,
  getAdminLogs,
  deleteGig
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/activate', activateUser);
router.put('/freelancers/:userId/verify', verifyFreelancer);
router.get('/logs', getAdminLogs);
router.delete('/gigs/:id', deleteGig);

module.exports = router;
