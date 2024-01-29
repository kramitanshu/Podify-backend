import { RequestHandler } from "express";
import PasswordResetToken from "#/models/passwordResetToken";
import { JwtPayload, verify } from "jsonwebtoken";
import { JWT_SECRET } from "#/utils/variables";
import User from "#/models/user";
import { ObjectId } from "mongoose";





export const isValidPassResetToken: RequestHandler = async (req, res, next) => {
	const { token, userId } = req.body;

	const resetToken = await PasswordResetToken.findOne({
		owner: userId
	})
	if (!resetToken) return res.status(403).json({ error: "Unauthorized access, Invalid token!" });

	const matched = await resetToken.compareToken(token);

	if (!matched) return res.status(403).json({ error: "Unauthorized access, Invalid token!" });

	// res.json({ message: "Your token is valid" });
	next();
};


export const mustAuth: RequestHandler = async (req, res, next) => {
  // console.log(req.headers);
  const { authorization } = req.headers;
  const token = authorization?.split("Bearer ")[1];
  if (!token) return res.status(403).json({ error: "Unauthorized request!" });

  const payload = verify(token, JWT_SECRET) as JwtPayload; 
  const id = payload.userId;

  // const user = await User.findById(id);
	const user = await User.findOne({_id: id, tokens: token});
  if (!user) return res.status(403).json({ error: "Unauthorized request!" });

	req.user = {
		id: user._id,
		name: user.name,
		email: user.email,
		verified: user.verified,
		avatar: user.avatar?.url,
		followers: user.followers.length,
		following: user.followings.length,
	}
	req.token = token;

	next();
} 

export const isVerified: RequestHandler = (req, res, next)=>{
	if (!req.user.verified) return res.status(403).json({error: "Please verify your email accound!"});

	next();
}