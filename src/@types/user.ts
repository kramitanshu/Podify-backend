import { Request } from "express";
import { Types } from "mongoose";



declare global {
	namespace Express {
		interface Request{
			user:{
				id: any,
				name: string,
				email: string,
				verified: boolean,
				avatar?: string,
				followers: number,
				following: number,
			};
			token: string;
		}
	}
}

export interface CreateUser extends Request{
	body: {
		name: string,
		email: string,
		password: string,
	}
}

export interface VerifyEmailRequest extends Request{
	body: {
		userId: string,
		token: string,

	}
}