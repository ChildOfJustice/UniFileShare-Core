export default function (sequelize:any, Sequelize:any, usersDB:any) {
    const clustersDB = sequelize.define("clustersDB", {
        //Sequelize types: https://sequelize.org/v5/manual/data-types.html
        clusterId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ownerUserId: {
            type: Sequelize.INTEGER(11),
            unique: true
        }

    });
    usersDB.hasMany(clustersDB, { foreignKey: 'ownerUserId' });
    clustersDB.belongsTo(usersDB, { foreignKey: 'id' });

    return clustersDB
}