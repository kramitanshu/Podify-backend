import nodemailer from 'nodemailer';
import path from "path";


import { MAILTRAP_PASSWORD, MAILTRAP_USER, SIGN_IN_URL, VERIFICATION_EMAIL } from "#/utils/variables";
import { generateTemplate } from "#/mail/template";


interface Profile{
	name: string;
	email: string;
	userId: string;
}

interface Options{
	email: string;
	link: string;
}

const generateMailTransporter = () => {
	const transport = nodemailer.createTransport({
		host: "sandbox.smtp.mailtrap.io",
		port: 2525,
		auth: {
			user: MAILTRAP_USER,
			pass: MAILTRAP_PASSWORD
		}
	});
	return transport;
}



export const sendVerificationMail = async (token: string, profile: Profile) => {
	const transport = generateMailTransporter();
	const { name, email, userId } = profile;
	// ways to verify
	// token = 6 digit otp => 123456 => send to API
	// token = attach these tokens to the <a href='your_url/token=haffhf"> => verify ( 	when clicked )
	// await EmailVerificationToken.create({
	// 	owner: userId,
	// 	token,
	// });

	const welcomeMessage = `Hi ${name}, welcom to Podify! There are so much things that we do for verified users. Use the given OTP to verify your email.`;

	transport.sendMail({
		to: email,
		from: VERIFICATION_EMAIL,
		subject:"Welcom message",
		html: generateTemplate({
			title: 'Welcome to Podify',
			message: welcomeMessage,
			logo: 'cid:logo',
			banner: 'cid:welcome',
			link: '#',
			btnTitle: token
		}),
		attachments: [
			{
				filename: 'logo.png',
				path: path.join(__dirname, "../mail/logo.png"),
				cid: "logo"
			},
			{
				filename: 'welcome.png',
				path: path.join(__dirname, "../mail/welcome.png"),
				cid: "welcome"
			}
		]
	})
}


export const sendForgetPasswordLink = async (options: Options) => {

	const transport = generateMailTransporter();
	const { email, link } = options;

	const message = `We just received a request that you forget your password. No problem you can use the link below to reset your password`;

	transport.sendMail({
		to: email,
		from: VERIFICATION_EMAIL,
		subject:'Reset Password Link',
		html: generateTemplate({
			title: 'Forget Password',
			message,
			logo: 'cid:logo',
			banner: 'cid:forget_password',
			link,
			btnTitle: "Reset Password"
		}),
		attachments: [
			{
				filename: 'logo.png',
				path: path.join(__dirname, "../mail/logo.png"),
				cid: "logo"
			},
			{
				filename: 'forget_password.png',
				path: path.join(__dirname, "../mail/forget_password.png"),
				cid: "forget_password"
			}
		]
	})
}

export const sendPassResetSuccessEmail = async (name: string, email: string) => {

	const transport = generateMailTransporter();

	const message = `Dear ${name}, We just updated your new password. You can now sign ni with your new password`;

	transport.sendMail({
		to: email,
		from: VERIFICATION_EMAIL,
		subject:'Password Reset Successfully',
		html: generateTemplate({
			title: 'Password Reset Successfully',
			message,
			logo: 'cid:logo',
			banner: 'cid:forget_password',
			link: SIGN_IN_URL,
			btnTitle: "Sign In"
		}),
		attachments: [
			{
				filename: 'logo.png',
				path: path.join(__dirname, "../mail/logo.png"),
				cid: "logo"
			},
			{
				filename: 'forget_password.png',
				path: path.join(__dirname, "../mail/forget_password.png"),
				cid: "forget_password"
			}
		]
	})
}



