import { Router } from "express";
import fileParser, { RequestWithFiles } from "#/middleware/fileParser";

import {
  CreateUserSchema,
  SignInValidationSchema,
  TokenAndIdValidation,
  updatePasswordSchema,
} from "#/utils/validationSchema";
import { validate } from "#/middleware/validator";
import {
  create,
  verifyEmail,
  sendReVerificationToken,
  generateForgetPasswordLink,
  grantValid,
  updatePassword,
  signIn,
  updateProfile,
  sendProfile,
  logOut,
} from "#/controllers/auth";
import { isValidPassResetToken, mustAuth } from "#/middleware/auth";

const router = Router();

router.post("/create", validate(CreateUserSchema), create);
router.post("/verify-email", validate(TokenAndIdValidation), verifyEmail);
router.post("/re-verify-email", sendReVerificationToken);
router.post("/forget-password", generateForgetPasswordLink);
router.post(
  "/verify-pass-reset-token",
  validate(TokenAndIdValidation),
  isValidPassResetToken,
  grantValid
);
router.post(
  "/update-password",
  validate(updatePasswordSchema),
  isValidPassResetToken,
  updatePassword
);
router.post("/sign-in", validate(SignInValidationSchema), signIn);
router.get("/is-auth", mustAuth, sendProfile);
router.post("/update-profile", mustAuth, fileParser, updateProfile);
router.post("/log-out", mustAuth, logOut);

export default router;
