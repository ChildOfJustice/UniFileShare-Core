export default function (sequelize:any, Sequelize:any, usersDB:any, clustersDB:any) {
    const coUsersDB = sequelize.define("coUsersDB", {
        //Sequelize types: https://sequelize.org/v5/manual/data-types.html
        coUserId: {
            type: Sequelize.STRING(50),
            primaryKey: true
        },
        permissionGiverUserId: {
            type: Sequelize.STRING(50)
        },
        clusterId: {
            type: Sequelize.INTEGER(11),
            primaryKey: true
        },
        permissions: {
            type: Sequelize.STRING(50),
        }

    });
    coUsersDB.belongsTo(clustersDB, {foreignKey: 'clusterId'});
    clustersDB.hasMany(coUsersDB, { foreignKey: 'clusterId' });

    coUsersDB.belongsTo(usersDB, {foreignKey: 'cognitoUserId'});
    usersDB.hasMany(coUsersDB, { foreignKey: 'coUserId' });

    return coUsersDB
}