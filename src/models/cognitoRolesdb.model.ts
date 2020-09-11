export default function (sequelize:any, Sequelize:any) {
    return sequelize.define("cognitoRolesDB", {
        //Sequelize types: https://sequelize.org/v5/manual/data-types.html
        cognitoUserGroup: {
            type: Sequelize.STRING(200)
        },
        role: {
            type: Sequelize.STRING(50)
        }
    });
}