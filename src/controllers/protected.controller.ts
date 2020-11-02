import * as express from 'express';
import { Request, Response} from "express";
import AuthMiddleWare from '../middleware/auth.middleware'
import db from "../models";

class ProtectedController {
    public path = '/protected'
    public router = express.Router()
    private authMiddleWare: AuthMiddleWare

    constructor() {
        this.authMiddleWare = new AuthMiddleWare()
        this.initRoutes()
    }

    private initRoutes(){
        this.router.use(this.authMiddleWare.verifyToken)
        this.router.get('/secret', this.home)
        this.router.post('/adminQuery', this.makeAdminQuery)
    }

    home(req: Request, res: Response){
        res.send(JSON.stringify("This is the secret"))
    }

    makeAdminQuery(req: Request, res: Response) {
        db.sequelizeEntity.query(req.body).then((data: any) => {
            res.send(data);
        })
            .catch((err: { message: string; }) => {
                res.status(500).send({
                    message: err.message || "Some error occurred while making admin query."
                });
            });
    }

}

export default ProtectedController;