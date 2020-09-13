export default function MetadataDB(sequelize:any, Sequelize:any) {
    return sequelize.define("filesMetadataDB", {
        //Sequelize types: https://sequelize.org/v5/manual/data-types.html
        // signUpDate: {
        //     type: Sequelize.DATE
        // }

        // 1:1
//         Organization.belongsTo(User, { foreignKey: 'owner_id' });
//         User.hasOne(Organization, { foreignKey: 'owner_id' });
//
//         // 1:M
//         Project.hasMany(Task, { foreignKey: 'tasks_pk' });
//         Task.belongsTo(Project, { foreignKey: 'tasks_pk' });
//
//         // N:M
//         User.belongsToMany(Role, { through: 'user_has_roles', foreignKey: 'user_role_user_id' });
//         Role.belongsToMany(User, { through: 'user_has_roles', foreignKey: 'roles_identifier' });


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