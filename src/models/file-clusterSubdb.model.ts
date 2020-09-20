export default function (sequelize:any, Sequelize:any, filesMetadataDB:any, clustersDB:any) {
    const file_clusterSubDB = sequelize.define("file-clusterSubDB", {
        //Sequelize types: https://sequelize.org/v5/manual/data-types.html
        fileId: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        clusterId: {
            type: Sequelize.INTEGER(11),
            primaryKey: true
        }
    });
    file_clusterSubDB.belongsTo(clustersDB, {foreignKey: 'clusterId'});
    clustersDB.hasMany(file_clusterSubDB, { foreignKey: 'clusterId' });

    file_clusterSubDB.belongsTo(filesMetadataDB, {foreignKey: 'id'});
    filesMetadataDB.hasMany(file_clusterSubDB, { foreignKey: 'fileId' });

    return file_clusterSubDB
}