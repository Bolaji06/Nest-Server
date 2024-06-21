
import jwt from 'jsonwebtoken'

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export function userAuthorization(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token){
        return res.status(401).json({ success: false, message: 'unauthorized' });
    }else{
        jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
            if (err){
                return res.status(403).json({ success: false, message: 'forbidden' });
            }
            req.user = data; // token verify proceed with the request
            next();
            //return res.status(200).json({ success: false, message: 'token verify success' });
        })
    }

}