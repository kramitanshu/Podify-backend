import { getFavorites, getIsFavorites, toggleFavorite } from "#/controllers/favorite";
import { isVerified, mustAuth } from "#/middleware/auth";
import { Router } from "express";

const router = Router();

// "/favorite?audioId" -- we want to handle toggle part
// we want to handle add in favorite and remove from favorite from same route
router.post('/', mustAuth, isVerified, toggleFavorite);
router.get('/', mustAuth, getFavorites);
router.get('/is-fav', mustAuth, getIsFavorites);





export default router;