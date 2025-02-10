import express from 'express';

const moderatorRouter = express.Router();

moderatorRouter.get('/', async (req, res)=>{
    try {
        return res.status(200).json({message: "Only admin and moderator can access this route"});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
});
export default moderatorRouter;