import { Sequelize } from "sequelize";
import config from "../../util/config";
import metadatadb from "./metadatadb.model";
import cognitoRolesdb from "./cognitoRolesdb.model"
import usersdb from "./usersdb.model"
import clustersdb from "./clustersdb.model"

const sequelize = new Sequelize(config.db.name, config.db.username, config.db.password, {
    host: config.db.host,
    dialect: 'postgres',
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    }
});

interface DataBase{
    SequelizeService: any
    sequelizeEntity: any
    metadataDB: any
    cognitoRolesDB: any
    usersDB: any
    clustersDB: any
}

const _cognitoRolesdb = cognitoRolesdb(sequelize, Sequelize)
const _usersdb = usersdb(sequelize, Sequelize, _cognitoRolesdb)

const db : DataBase = {
    SequelizeService: Sequelize,
    sequelizeEntity: sequelize,
    metadataDB: metadatadb(sequelize, Sequelize),
    cognitoRolesDB: _cognitoRolesdb,
    usersDB: _usersdb,
    clustersDB: clustersdb(sequelize, Sequelize, _usersdb)
}

export default db

// db.testDB = require("./testdb.model.js")(sequelize, Sequelize);
//
// module.exports = db;