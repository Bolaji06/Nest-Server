
import rateLimiter from "express-rate-limit";

export const registerRateLimit = rateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "too many registration attempts from this IP address try again after 1 hour"
    },
    headers: true,
});

export const loginRateLimit = rateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 4,
    message: {
        success: false,
        message: 'too many login attempts'
    },
    headers: true,
})