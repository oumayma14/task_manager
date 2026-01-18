import express from 'express';
import { getUser, loginUser, logoutUser, registerUser } from '../controllers/auth/UserController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post("/login", loginUser);
router.get("/logout",logoutUser);
router.get("/user",protect ,getUser);

export default router;