
import jwt from 'jsonwebtoken'

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export  function userAuthorization(req, res){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token){
        return res.status(400).json({ success: false, message: 'invalid token or token expires' });
    }else{
        jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
            if (err){
                return res.status(400).json({ success: false, message: 'fail to verify token' });
            }
            req.user = data; // token verify proceed with the request
            return res.status(200).json({ success: false, message: 'token verify success' });
        })
    }

}