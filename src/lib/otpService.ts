// PHRS SMS & OTP Gateway Integration
const PHRS_GATEWAY = "https://phrscrowd.online";
const PROJECT_KEY = "<YOUR_PROJECT_KEY>";

export async function sendOTP(phoneNumber: string) {
  try {
    const response = await fetch(`${PHRS_GATEWAY}/api/otp/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PROJECT_KEY}`
      },
      body: JSON.stringify({ to: phoneNumber })
    });
    return await response.json();
  } catch (err) {
    console.error("SMS Send Error:", err);
    return { success: false, error: err };
  }
}

export async function verifyOTP(phoneNumber: string, otpCode: string) {
  try {
    const response = await fetch(`${PHRS_GATEWAY}/api/sms/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PROJECT_KEY}`
      },
      body: JSON.stringify({ phone: phoneNumber, code: otpCode })
    });
    return await response.json();
  } catch (err) {
    console.error("OTP Verify Error:", err);
    return { success: false, error: err };
  }
}
