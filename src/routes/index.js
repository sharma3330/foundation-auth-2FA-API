import express from 'express';
import UserAuth from  "../userAuth/userAuthRouter.js";
import Users from  "../user/userRouter.js";
import authorize from "../../middlewares/authorize.js";
import ensureAuthenticated from "../../middlewares/ensureAuthenticated.js";
import adminRouter from "../roleBaseRouteAccess/admin/adminRouter.js";
import memberRouter from "../roleBaseRouteAccess/member/memberRouter.js";
import moderatorRouter from "../roleBaseRouteAccess/moderator/moderatorRouter.js";

const routerRoot =  express.Router();

routerRoot.get('/', (req, res)=>{
    res.send('Welcom to server..');
})

routerRoot.use('/auth', UserAuth);
routerRoot.use('/users', ensureAuthenticated, Users);

//Below route is autozie routes
routerRoot.use('/admin', ensureAuthenticated, authorize(['admin']), adminRouter);
routerRoot.use('/member', ensureAuthenticated, authorize(['member']), memberRouter);
routerRoot.use('/moderator', ensureAuthenticated, authorize(['admin', 'moderator']), moderatorRouter);



export default routerRoot;