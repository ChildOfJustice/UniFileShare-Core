import { Sequelize } from "sequelize";
import config from "../../util/config";
import filesMetadatadb from "./filesMetadatadb.model";
import cognitoRolesdb from "./cognitoRolesdb.model"
import usersdb from "./usersdb.model"
import clustersdb from "./clustersdb.model"
import coUsersdb from "./coUsersdb.model"
import file_clusterSubdb from "./file-clusterSubdb.model"

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
    file_clusterSubDB: any
    coUsersDB: any
}

const _cognitoRolesdb = cognitoRolesdb(sequelize, Sequelize)
const _filesMetadatadb = filesMetadatadb(sequelize, Sequelize)
const _usersdb = usersdb(sequelize, Sequelize, _cognitoRolesdb)
const _clustersdb = clustersdb(sequelize, Sequelize, _usersdb)

const _file_clusterSubdb = file_clusterSubdb(sequelize, Sequelize, _filesMetadatadb, _clustersdb)
const _coUsersdb = coUsersdb(sequelize, Sequelize, _usersdb, _clustersdb)


const db : DataBase = {
    SequelizeService: Sequelize,
    sequelizeEntity: sequelize,
    metadataDB: _filesMetadatadb,
    cognitoRolesDB: _cognitoRolesdb,
    usersDB: _usersdb,
    clustersDB: _clustersdb,
    file_clusterSubDB: _file_clusterSubdb,
    coUsersDB: _coUsersdb
}

export default db

// db.testDB = require("./testdb.model.js")(sequelize, Sequelize);
//
// module.exports = db;