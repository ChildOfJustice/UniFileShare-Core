import * as express from 'express';

import { Request, Response} from "express";
import db from "../models";

class HomeController {
    public path = '/'
    public router = express.Router()

    constructor() {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.get('/', this.home)
        //this.router.post('/api/test', this.test)
        //this.router.get('/api/test', this.test) !!!
        //this.router.get('/upload-file', this.uploadFile)
    }

    home(req: Request, res: Response) {
        res.render("index");
        //res.send("Your app is working!")
    }

    test(req: Request, res: Response) {
        //res.render("index");
        //res.send("Your app has been tested!")
        //var msg = "EEEEEEE";
        //res.json(msg);
        //console.log('Sent the msg!');

        // db.sequelizeEntity.query(req.body).then((data: any) => {
        //     res.send(data);
        // })
        // .catch((err: { message: string; }) => {
        //     res.status(500).send({
        //         message: err.message || "Some error occurred while making admin query."
        //     });
        // });
    }

    uploadFile(req: Request, res: Response){
        res.render("fileUpload");
    }

}

export default HomeController;