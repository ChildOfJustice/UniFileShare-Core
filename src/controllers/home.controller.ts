import * as express from 'express';

import { Request, Response} from "express";

class HomeController {
    public path = '/'
    public router = express.Router()

    constructor() {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.get('/', this.home)
        this.router.get('/api/test', this.test)
        //this.router.get('/upload-file', this.uploadFile)
    }

    home(req: Request, res: Response) {
        res.render("index");
        //res.send("Your app is working!")
    }

    test(req: Request, res: Response) {
        //res.render("index");
        //res.send("Your app has been tested!")
        var msg = "EEEEEEE";
        res.json(msg);
        console.log('Sent the msg!');
    }

    uploadFile(req: Request, res: Response){
        res.render("fileUpload");
    }

}

export default HomeController;