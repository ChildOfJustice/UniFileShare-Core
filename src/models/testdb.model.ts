export default function (sequelize:any, Sequelize:any) {
    const Test = sequelize.define("test", {
        //Sequelize types: https://sequelize.org/v5/manual/data-types.html
        username: {
            type: Sequelize.STRING(200)
        },
        someReal: {
            type: Sequelize.REAL
        },
        signUpDate: {
            type: Sequelize.DATE
        }
    });

    return Test;
}