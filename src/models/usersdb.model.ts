export default function (sequelize:any, Sequelize:any, rolesDB:any) {
    const usersDB = sequelize.define("usersDB", {
        //Sequelize types: https://sequelize.org/v5/manual/data-types.html
        name: {
            type: Sequelize.STRING(20),
        },
        cognitoUserId: {
            type: Sequelize.STRING(50),
            unique: true,
            primaryKey: true,
        },
        roleId: {
            type: Sequelize.INTEGER,
        },
        signUpDate: {
            type: Sequelize.DATE
        }

    });
    rolesDB.hasMany(usersDB, { foreignKey: 'roleId' });
    usersDB.belongsTo(rolesDB, { foreignKey: 'roleId' });

    return usersDB
}