export default function (sequelize:any, Sequelize:any) {
    return sequelize.define("rolesDB", {
        //Sequelize types: https://sequelize.org/v5/manual/data-types.html
        role: {
            type: Sequelize.STRING(50)
        }
    });
}