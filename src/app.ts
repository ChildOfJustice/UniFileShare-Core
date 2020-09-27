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
import {Role} from "./interfaces/databaseTables";
import {User} from "./interfaces/user";
import CognitoService from "./services/cognito.service";
import config from "../util/config";

const Rolesdb = db.rolesDB
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

    async initRoles() {
        try {
            let role1: Role = {
                role: "ADMINISTRATOR"
            }
            await Rolesdb.create(role1)
                .then((data: never) => {
                    console.log("CREATED NEW ROLE: " + data)
                })
                .catch((err: { message: string; }) => {
                    console.log(err)
                });
            let role2: Role = {
                role: "ORDINARY_USER"
            }
            await Rolesdb.create(role2)
                .then((data: never) => {
                    console.log("CREATED NEW ROLE: " + data)
                })
                .catch((err: { message: string; }) => {
                    console.log(err)
                });

        } catch (error) {
            console.error('Unable to connect to the database (2): ', error);
        }
    }

    async initAdministratorUser() {
        var userCognitoId: string | null = null
        const { username, password, email} = config.AdminConfig;
        const userAttr = [];
        userAttr.push({ Name: 'email', Value: email });
        const cognito = new CognitoService();

        const cognitoIdentityServiceProvider = cognito.cognitoIdentity;

        await cognito.signUpUser(username, password, userAttr)
            .then(promiseOutput =>{
                if(promiseOutput.success){
                    console.log("CREATED ROOT USER: " + promiseOutput.msg)
                    // @ts-ignore
                    userCognitoId = promiseOutput.msg.UserSub
                } else {
                    console.log("ERROR WITH ROOT USER: " + promiseOutput.msg)
                }
            });


        if(userCognitoId == null){
            console.log("ERROR WITH COGNITO")
            return
        }
        const note: User = {
            name: username,
            cognitoUserId: userCognitoId,
            roleId: config.AppConfig.RolesIds.admin,
            signUpDate: Date()
        };

        await Usersdb.create(note)
            .then((data: never) => {
                console.log("CREATED ROOT USER in inner db: " + data)
            })
            .catch((err: { message: string; }) => {
                console.log("ERROR WITH ADMIN IN INNER DB!!" + err)
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

            await this.sleep(5000)
            console.log("DATABASE INITIALISATION:")
            await this.initRoles()
            await this.initAdministratorUser()


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
