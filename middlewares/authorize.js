
import Datastore from 'nedb-promises';

function authorize(roles=[]){
    const userDb = Datastore.create('User.db');
    return async function (req, res, next) {
       const user = await userDb.findOne({_id: req.user.id});

       if(!user || !roles.includes(user.role)){
            return res.status(403).json({message: 'Access Denied'});
       }
       
       next();
    }
}

export default authorize;