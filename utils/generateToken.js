
import crypto from 'node:crypto'
export function emailVerificationToken(){
    const token = crypto.randomBytes(10).toString('hex');
    return token;
}

export function passwordResetVerification(){
    const expiry = new Date(Date.now() + 3600000);
    return {
        token: emailVerificationToken,
        expiry,
    }
}