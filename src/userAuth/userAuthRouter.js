import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {jwtConfig} from '../../config/jwtConfig.js';
import {userDb, userRefreshTokenDb, userInvalidTokenDb} from "../../migrations/database.js";
import ensureAuthenticated from "../../middlewares/ensureAuthenticated.js";

const userAuthRouter = express.Router();

userAuthRouter.post('/register', async (req, res)=>{
    try {
        const {name, email, password, role} = req.body;
        
        if(!name || !email || !password){
            return res.status(422).json({
                message: 'Please fill in all fileds (name, email, password)'
            })
        }
        const hasPassword = await bcrypt.hash(password, 10); // encypt password

        if(await userDb.findOne({email})){

            return res.status(409).json({
                message: 'Email alredy exits'
            })
        }

        // instart user in db
        const newUser = await userDb.insert({
            name: name,
            email: email,
            password: hasPassword,
            role: role ?? 'member'
        })
        
        return res.status(201).json({
            message: "User registed successfully",
            id: newUser._id
        })
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
});

userAuthRouter.post('/login', async (req, res)=>{

    try {
        const {email, password} = req.body;

        if(!email || !password){
            res.status(422).json({
               message: 'Please fill in all fileds (name, email, password)'
            })
        }

        const user = await userDb.findOne({email});

        if(!user){
            return res.status(401).json({message: 'Email and password is invalid'});
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if(!passwordMatch){
            return res.status(401).json({message: 'Email and password invalid'})
        }

        const accessToken = jwt.sign({user: user._id}, jwtConfig.accessTokenSecret, {subject: 'accessAPI', expiresIn: jwtConfig.accessTokenExpiresIn});
        const refreshToken = jwt.sign({user: user._id}, jwtConfig.refreshTokenSecret, {subject: 'refreshToken', expiresIn: jwtConfig.refreshTokenExpiresIn});
        
        await userRefreshTokenDb.insert({
            refreshToken,
            userId: user._id
        })    

        res.status(200).json({
            id: user._id,
            name:user.name,
            email: user.email,
            accessToken,
            refreshToken
        });

    } catch (error) {
        res.status(500).json({ message: error.message});
    }
});

userAuthRouter.get('/logout', ensureAuthenticated, async (req, res)=>{
    try {

        await userRefreshTokenDb.removeMany({userId: req.user.id});

        await userRefreshTokenDb.compactDatafile();

        await userInvalidTokenDb.insert({
            accessToken: req.accessToken.value,
            userId: req.user.id,
            expirationTime: req.accessToken.exp
        })

        return res.status(204).send();

    } catch (error) {
        
        res.status(500).json({ message: error.message});
    }
});

userAuthRouter.post('/refresh-token', async (req, res)=>{
    try {
        const { refreshToken } = req.body;

        if(!refreshToken){
            return res.status(401).json({message: "Refresh token not found"});
        }

        const decodedRefreshToken = jwt.verify(refreshToken, jwtConfig.refreshTokenSecret);
        
        const userRefreshToken =  await userRefreshTokenDb.findOne({refreshToken, userId: decodedRefreshToken.user});

        if(!userRefreshToken){
            return res.status(401).json({message: 'Refresh token invalid or expired'});
        }

        await userRefreshTokenDb.remove({_id: userRefreshToken._id});
        await userRefreshTokenDb.compactDatafile();

        const accessToken = jwt.sign({user: decodedRefreshToken.user}, jwtConfig.accessTokenSecret, {subject: 'accessAPI', expiresIn: jwtConfig.accessTokenExpiresIn});
        const newRefreshToken = jwt.sign({user: decodedRefreshToken.user}, jwtConfig.refreshTokenSecret, {subject: 'refreshToken', expiresIn: jwtConfig.refreshTokenExpiresIn});
        
        await userRefreshTokenDb.insert({
            refreshToken: newRefreshToken,
            userId: decodedRefreshToken.user
        })    

        res.status(200).json({
            accessToken,
            refreshToken: newRefreshToken
        });


    } catch (error) {
        if(error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError){
            return res.status(401).json({message: 'Refresh token invalid or expired'});
        }
        res.status(500).json({ message: error.message});
    }
});



export default userAuthRouter;