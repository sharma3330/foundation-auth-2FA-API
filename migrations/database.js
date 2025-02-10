
import Datastore from 'nedb-promises';
const userDb = Datastore.create('User.db');
const userRefreshTokenDb = Datastore.create('UserRefreshToken.db');
const userInvalidTokenDb = Datastore.create('userInvalidToken.db');

export {userDb, userRefreshTokenDb, userInvalidTokenDb};