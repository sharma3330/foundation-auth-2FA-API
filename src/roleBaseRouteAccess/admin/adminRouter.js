import express from 'express';

const adminRouter = express.Router();

adminRouter.get('/', async (req, res)=>{
    try {
        return res.status(200).json({message: "Only admin can access this route"});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
});
export default adminRouter;