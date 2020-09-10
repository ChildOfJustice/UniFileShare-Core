import { Sequelize } from "sequelize";
import config from "../../util/config";
import models from "./testdb.model";

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
}

const db : DataBase = {
    SequelizeService: Sequelize,
    sequelizeEntity: sequelize,
    metadataDB: models(sequelize, Sequelize)
}

export default db

// db.testDB = require("./testdb.model.js")(sequelize, Sequelize);
//
// module.exports = db;