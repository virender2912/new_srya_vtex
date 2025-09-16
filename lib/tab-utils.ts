import CryptoJS from 'crypto-js';

// Verify webhook signature
export function verifyTabSignature(signature: string, rawBody: string, secret: string): boolean {
  try {
    const computedSignature = CryptoJS.HmacSHA256(rawBody, secret).toString(CryptoJS.enc.Base64);
    return computedSignature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Format amount for Tab API
export function formatAmountForTab(amount: number, currency: string = 'AED'): number {
  if (currency === 'AED') {
    return Math.round(amount * 100); // Convert AED to fils
  }
  return amount;
}

// Parse phone number for Tab format
export function formatPhoneForTab(phone: string): { country_code: string; number: string } {
  // Clean the phone number
  const cleaned = phone.replace(/\D/g, '');
  
  // Extract country code and number
  let country_code = '971'; // Default to UAE
  let number = cleaned;
  
  if (cleaned.startsWith('971') && cleaned.length > 3) {
    country_code = '971';
    number = cleaned.substring(3);
  } else if (cleaned.length === 9 && !cleaned.startsWith('0')) {
    number = cleaned;
  } else if (cleaned.length === 10 && cleaned.startsWith('0')) {
    number = cleaned.substring(1);
  }
  
  return { country_code, number };
}