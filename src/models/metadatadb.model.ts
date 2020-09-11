export default function MetadataDB(sequelize:any, Sequelize:any) {
    return sequelize.define("metadataDB", {
        //Sequelize types: https://sequelize.org/v5/manual/data-types.html
        // signUpDate: {
        //     type: Sequelize.DATE
        // }
        name: {
            type: Sequelize.STRING(200)
        },
        S3uniqueName: {
            type: Sequelize.STRING(200)
        },
        cloud: {
            type: Sequelize.STRING(50)
        },
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
}