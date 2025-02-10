import jwt from 'jsonwebtoken';
import {jwtConfig} from '../config/jwtConfig.js';
import { userInvalidTokenDb } from '../migrations/database.js';


async function ensureAuthenticated(req, res, next) {
    const accessToken =  req.headers.authorization
    try {
        if(!accessToken){
            return res.status(401).json({message: 'Access token not found'});
        }

        if(await userInvalidTokenDb.findOne({accessToken})){
            return res.status(401).json({message: `Access token invalid or expired`});
        }

        const decodedAccesstoken = jwt.verify(accessToken, jwtConfig.accessTokenSecret); 

        req.accessToken = {value: accessToken, exp: decodedAccesstoken.exp}   

        req.user = {id: decodedAccesstoken.user}

        next();
    } catch (error) {
        if(error instanceof jwt.TokenExpiredError){
            return res.status(401).json({message: 'Access token expired', code: 'AccessTokenExpired'});
        }else if (error instanceof jwt.JsonWebTokenError){
            return res.status(401).json({message: 'Access token Invalid', code: 'AccessTokenInvalid'});
        }else{
            return res.status(401).json({message: error.message});
        }
        
    }
}

export default ensureAuthenticated;