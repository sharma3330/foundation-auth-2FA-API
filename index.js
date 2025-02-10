import express from 'express';
import routerRoot from "./src/routes/index.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res)=>{
    res.send('REST API Authontication and Authorization')
});

app.use('/api', routerRoot);

app.listen(3000, ()=> console.log('Server PORT runing 3000'));