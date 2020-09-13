export default function (sequelize:any, Sequelize:any, cognitoRolesDB:any) {
    const usersDB = sequelize.define("usersDB", {
        //Sequelize types: https://sequelize.org/v5/manual/data-types.html
        cognitoUserGroupId: {
            type: Sequelize.INTEGER(11),
            unique: true
        }

    });
    cognitoRolesDB.hasMany(usersDB, { foreignKey: 'cognitoUserGroupId' });
    usersDB.belongsTo(cognitoRolesDB, { foreignKey: 'id' });

    return usersDB
}