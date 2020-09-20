import * as express from 'express';
import {Application} from 'express';
import * as path from "path";
import * as exphbs from "express-handlebars";
import * as compression from "compression";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";
import * as serveFavicon from "serve-favicon";
import * as cors from "cors"

import db from "./models"
import {CognitoRole} from "./interfaces/databaseTables";
import {User} from "./interfaces/user";

const Usersdb = db.usersDB;
const Op = db.SequelizeService.Op;

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
            db.sequelizeEntity.sync({force: true}).then(() => {
                console.log("Drop and re-sync db.");
            });
            //^

        } catch (error) {
            console.error('Unable to connect to the database: ', error);
        }
    }

    public initRolesForCognitoUserGroups() {
        //const cognitoRolesdbController = new UsersdbController()
        // cognitoRolesdbController.create({cognito_user_group: "Admin", role: "ADMINISTRATOR"})
        // cognitoRolesdbController.create({cognito_user_group: "User", role: "ORDINARY_USER"})
        try {
            let cognitoRole1: CognitoRole = {
                cognito_user_group: "Admin",
                role: "ADMINISTRATOR"
            }

            // let cognitoRole2: CognitoRole = {
            //     cognito_user_group: "User",
            //     role: "ORDINARY_USER"
            // }


        } catch (error) {
            console.error('Unable to connect to the database (2): ', error);
        }
    }

    initAdministratorUser() {
        const note: User = {
            name: "ADMIN",
            // someReal: req.body.someReal,
            // signUpDate: req.body.signUpDate
            cognitoUserGroup: "1",
            signUpDate: Date()
        };


        // Save Tutorial in the database
        Usersdb.create(note)
            .then((data: never) => {
                //res.send(JSON.stringify(data));
                console.log("CREATED NEW USER: " + data)
                //res.send(data);
            })
            .catch((err: { message: string; }) => {
                console.log(err)
                // res.status(500).send({
                //     message: err.message || "Some error occurred while creating the note."
                // });
            });
    }

    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public listen() {
        // this.connectToDatabase().then(() => this.app.listen(this.port, () => {
        //     console.log(`App is listening on http://localhost:${this.port}`)
        // }))
        this.app.listen(this.port, async () => {
            await this.connectToDatabase()

            await this.sleep(4000)
            console.log("DATABASE INITIALISATION:")
            this.initAdministratorUser()


            console.log(`App is listening on http://localhost:${this.port}`);
        })

    }

    private middlewares(middleWares: any) {
        // @ts-ignore
        middleWares.forEach(middleWare => {
            this.app.use(middleWare);
        });
    }

    private routes(controllers: any) {
        // @ts-ignore
        controllers.forEach(controller => {
            this.app.use(controller.path, controller.router);
        });
    }
}

export default App;
