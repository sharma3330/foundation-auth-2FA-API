import express from 'express';
import { userDb } from '../../migrations/database.js';

const usersRouter = express.Router();

usersRouter.get('/current', async (req, res)=>{
    try {
        const user = await userDb.findOne({_id: req.user.id});
        return res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email
        });
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
});
export default usersRouter;