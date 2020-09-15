import * as express from 'express';
import { Application } from 'express';
import * as path from "path";
import * as exphbs from "express-handlebars";
import * as compression from "compression";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";
import * as serveFavicon from "serve-favicon";
import * as cors from "cors"

import fetch from "node-fetch"

import db from "./models"
import {CognitoRole} from "./interfaces/databaseTables";
import CognitoRolesdbController from "./controllers/cognitoRolesdb.controller";
import UsersdbController from "./controllers/usersdb.controller";

class App {
    public app: Application
    public port: number

    constructor(appInit: { port: number; controllers: any; middleWares: any }) {
        this.app = express()

        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*')
            next()
        })

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

        this.app.use(cors())
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

    public initRolesForCognitoUserGroups(){
        //const cognitoRolesdbController = new UsersdbController()
        // cognitoRolesdbController.create({cognito_user_group: "Admin", role: "ADMINISTRATOR"})
        // cognitoRolesdbController.create({cognito_user_group: "User", role: "ORDINARY_USER"})
        try {
            let cognitoRole1: CognitoRole = {
                cognito_user_group: "Admin",
                role: "ADMINISTRATOR"
            }

            // fetch('localhost:3001/cognitoRoles/create',{
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //         // 'Content-Type': 'application/x-www-form-urlencoded',
            //     },
            //     body: JSON.stringify(cognitoRole1)
            // })
            //     .then(res => {
            //         let response_ = res.json()
            //         console.log(response_)
            //         if(res.ok) {
            //             //alert("Successfully signed you up")
            //         }
            //         else alert("Error with DB INITIALIZATION 1, see logs for more info")
            //     })
            //     .catch(error => console.log("Fetch error: " + error))
            // //^
            // let cognitoRole2: CognitoRole = {
            //     cognito_user_group: "User",
            //     role: "ORDINARY_USER"
            // }
            // fetch('localhost:3001/cognitoRoles/create',{
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //         // 'Content-Type': 'application/x-www-form-urlencoded',
            //     },
            //     body: JSON.stringify(cognitoRole2)
            // })
            //     .then(res => {
            //         let response_ = res.json()
            //         console.log(response_)
            //         if(res.ok) {
            //             //alert("Successfully signed you up")
            //         }
            //         else alert("Error with DB INITIALIZATION 2, see logs for more info")
            //     })
            //     .catch(error => console.log("Fetch error: " + error))
            // //^
            // console.log("I WAS HERE!!!")

        } catch (error) {
            console.error('Unable to connect to the database (2): ', error);
        }
    }

    public listen() {
        this.initRolesForCognitoUserGroups()
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
