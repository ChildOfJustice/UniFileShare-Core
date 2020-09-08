import * as express from 'express';
import { Application } from 'express';
import * as path from "path";
import * as exphbs from "express-handlebars";
import * as compression from "compression";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";
import * as serveFavicon from "serve-favicon";

import db from "./models"

class App {
    public app: Application
    public port: number

    constructor(appInit: { port: number; controllers: any; middleWares: any }) {
        this.app = express()

        // set static path
        this.app.use("/static", express.static("src/public"));
        // set response compression
        this.app.use(compression());
        // set logger
        this.app.use(morgan("common"));
        // serve json requests
        this.app.use(bodyParser.json());
        // serve favicon
        this.app.use(serveFavicon(path.join(process.cwd(), '/src', '/public', 'favicon.ico')))

        // this.app.use(express.json());

        // set template engine
        this.app.set('views', path.join(process.cwd(), '/src', '/views'));
        this.app.engine('handlebars', exphbs());
        this.app.set('view engine', 'handlebars');

        this.port = appInit.port;

        this.middlewares(appInit.middleWares)
        this.routes(appInit.controllers)
    }

    public async connectToDatabase() {

        try {
            await db.sequelizeEntity.authenticate();
            console.log('Connection has been established successfully.');
            //db.sequelizeEntity.sync();
            //for development:
            db.sequelizeEntity.sync({ force: true }).then(() => {
                console.log("Drop and re-sync db.");
            });
            //^

        } catch (error) {
            console.error('Unable to connect to the database: ', error);
        }
    }

    public listen() {
        // this.connectToDatabase().then(() => this.app.listen(this.port, () => {
        //     console.log(`App is listening on http://localhost:${this.port}`)
        // }))
        this.app.listen(this.port, async () => {
            await this.connectToDatabase()
            console.log(`App is listening on http://localhost:${this.port}`);
        })

    }

    private middlewares(middleWares: any){
        // @ts-ignore
        middleWares.forEach(middleWare => {
            this.app.use(middleWare);
        });
    }

    private routes(controllers: any){
        // @ts-ignore
        controllers.forEach(controller => {
            this.app.use(controller.path, controller.router);
        });
    }
}

export default App;
