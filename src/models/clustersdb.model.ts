export default function (sequelize:any, Sequelize:any, usersDB:any) {
    const clustersDB = sequelize.define("clustersDB", {
        //Sequelize types: https://sequelize.org/v5/manual/data-types.html
        name: {
            type: Sequelize.STRING(20),
        },
        clusterId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ownerUserId: {
            type: Sequelize.INTEGER,
        }

    });
    usersDB.hasMany(clustersDB, { foreignKey: 'ownerUserId' });
    clustersDB.belongsTo(usersDB, { foreignKey: 'id' });

    return clustersDB
}