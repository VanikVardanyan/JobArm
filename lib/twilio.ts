import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
export const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

export const isTwilioConfigured = Boolean(accountSid && authToken && verifyServiceSid);
export const isDevOtpMode = !isTwilioConfigured && process.env.NODE_ENV !== "production";
export const devOtpCode = process.env.TWILIO_DEV_CODE ?? "000000";

export function getTwilioClient() {
  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials are not configured");
  }
  return twilio(accountSid, authToken);
}
