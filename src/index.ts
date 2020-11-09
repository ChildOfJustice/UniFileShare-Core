import App from './app';
import config from "../util/config";

import * as bodyParser from "body-parser";

import AuthController from "./controllers/auth.controller";
import HomeController from './controllers/home.controller';
import ProtectedController from "./controllers/protected.controller";
import FilesMetadataController from "./controllers/filesMetadatadb.controller";
import RolesdbController from "./controllers/rolesdb.controller";
import ClustersdbController from "./controllers/clustersdb.controller";
import CousersdbController from "./controllers/co-usersdb.controller";
import File_ClusterdbController from "./controllers/file-clusterSubdb.controller";
import UsersdbController from "./controllers/usersdb.controller";

const app = new App({
    port: config.server.port,
    controllers: [
        new ProtectedController(),
        new HomeController(),
        new AuthController(),
        new FilesMetadataController(),
        new RolesdbController(),
        new ClustersdbController(),
        new CousersdbController(),
        new File_ClusterdbController(),
        new UsersdbController()
    ],
    middleWares: [
        bodyParser.json(),
        bodyParser.urlencoded({ extended: true })
    ],
})
//I cant make this "use" in routes, I dont know why
app.app.use("/", (req, res) => {
    res.render("index");
});
app.listen()
