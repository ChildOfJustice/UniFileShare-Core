export default function (sequelize:any, Sequelize:any) {
    const MetadataDB = sequelize.define("metadataDB", {
        //Sequelize types: https://sequelize.org/v5/manual/data-types.html
        // username: {
        //     type: Sequelize.STRING(200)
        // },
        // someReal: {
        //     type: Sequelize.REAL
        // },
        // signUpDate: {
        //     type: Sequelize.DATE
        // }
        uploadedBy: {
            type: Sequelize.STRING(50)
        },
        ownedBy: {
            type: Sequelize.STRING(50)
        },
        sizeOfFile_MB: {
            type: Sequelize.DOUBLE
        },
        tagsKeys: {
            type: Sequelize.ARRAY(Sequelize.STRING(50))
        },
        tagsValues: {
            type: Sequelize.ARRAY(Sequelize.STRING(200))
        },
    });

    return MetadataDB;
}