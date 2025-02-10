import express from 'express';

const memberRouter = express.Router();

memberRouter.get('/', async (req, res)=>{
    try {
        return res.status(200).json({message: "Only member can access this route"});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
});
export default memberRouter;