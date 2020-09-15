export default function (sequelize:any, Sequelize:any, usersDB:any, clustersDB:any) {
    const coUsersDB = sequelize.define("coUsersDB", {
        //Sequelize types: https://sequelize.org/v5/manual/data-types.html
        co_userId: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        clusterId: {
            type: Sequelize.INTEGER(11),
            primaryKey: true
        },
        permissions: {
            type: Sequelize.INTEGER,
        }

    });
    coUsersDB.belongsTo(clustersDB, {foreignKey: 'clusterId'});
    clustersDB.hasMany(coUsersDB, { foreignKey: 'clusterId' });

    coUsersDB.belongsTo(usersDB, {foreignKey: 'id'});
    usersDB.hasMany(coUsersDB, { foreignKey: 'co_userId' });

    return coUsersDB
}