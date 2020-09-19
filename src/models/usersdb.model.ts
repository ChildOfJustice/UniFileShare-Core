export default function (sequelize:any, Sequelize:any, cognitoRolesDB:any) {
    const usersDB = sequelize.define("usersDB", {
        //Sequelize types: https://sequelize.org/v5/manual/data-types.html
        name: {
            type: Sequelize.STRING(20),
        },
        cognitoUserGroup: {
            type: Sequelize.STRING(20),
        },
        signUpDate: {
            type: Sequelize.DATE
        }

    });
    // cognitoRolesDB.hasMany(usersDB, { foreignKey: 'cognitoUserGroupId' });
    // usersDB.belongsTo(cognitoRolesDB, { foreignKey: 'id' });

    return usersDB
}