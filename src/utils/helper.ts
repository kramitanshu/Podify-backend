import { UserDocument } from "#/models/user";

export const generateToken = (length: number = 6) => {
	// declare variable
	let otp = "";

	for (let i = 0; i < length; i++){

		const digit = Math.floor(Math.random() * 10);
		otp += digit;
	}

	return otp;
}


export const formatProfile = (user: UserDocument) =>{
	return {
		id: user._id,
		name: user.name,
		email: user.email,
		verified: user.verified,
		avatar: user.avatar?.url,
		followers: user.followers.length,
		following: user.followings.length,
	}
}