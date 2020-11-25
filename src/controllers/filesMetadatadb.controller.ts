import * as express from 'express';
import { Request, Response} from "express";
import AuthMiddleWare from '../middleware/auth.middleware'

import { FileMetadata } from '../interfaces/databaseTables'

import db from "../models"

const MetadataDB = db.metadataDB;
const File_ClusterSubDB = db.file_clusterSubDB;
const Op = db.SequelizeService.Op;

class DatabaseController {
    public path = '/files/metadata'
    public router = express.Router()
    private authMiddleWare: AuthMiddleWare

    constructor() {
        this.authMiddleWare = new AuthMiddleWare()
        this.initRoutes()
    }


    private initRoutes(){
        this.router.use(this.authMiddleWare.verifyToken)
        // Create a new note
        this.router.post("/create", this.create);

        // Retrieve all Tutorials
        this.router.get("/findAll", this.findAll);

        // Retrieve used storage size for the user
        this.router.get("/calcUsedSize", this.calcUsedSize);

        // // Retrieve all published Tutorials
        // router.get("/published", tutorials.findAllPublished);
        //
        // // Retrieve a single Tutorial with id
        // router.get("/:id", tutorials.findOne);
        //
        // // Update a Tutorial with id
        // router.put("/:id", tutorials.update);
        //
        // Delete a note with id
        this.router.delete("/delete", this.delete);


        this.router.get("/calcUsedSize", this.calcUsedSize);
        //
        // // Create a new Tutorial
        // router.delete("/", tutorials.deleteAll);

    }

    home(req: Request, res: Response){
        res.send("This is a db home page")
    }



    // Create and Save a new note
    create (req:any, res:any) {

        // Validate request
        //^


        // Create a note
        const note: FileMetadata = {
            // username: req.body.username,
            // someReal: req.body.someReal,
            // signUpDate: req.body.signUpDate
            id: null,
            name: req.body.name,
            S3uniqueName: req.body.S3uniqueName,
            cloud: req.body.cloud,
            ownedBy: req.body.ownedBy,
            uploadedBy: req.body.uploadedBy,
            sizeOfFile_MB: req.body.sizeOfFile_MB,
            tagsKeys: req.body.tagsKeys,
            tagsValues: req.body.tagsValues,
        };

        db.sequelizeEntity.query('CALL insert_data(\''+ note.name +'\', '+note.sizeOfFile_MB+', \''+ note.S3uniqueName +'\', \''+ note.cloud +'\', \''+ note.uploadedBy +'\', \''+ note.ownedBy +'\', \'{'+ note.tagsKeys +'}\', \'{'+ note.tagsValues +'}\', ' + req.body.clusterId + ');').then((response: any) => {
            res.send(response);
        }).catch((err: { message: string; }) => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the note."
            });
        });
        //
        // Save Tutorial in the database
        // MetadataDB.create(note)
        //     .then((data: never) => {
        //         //res.send(JSON.stringify(data));
        //         console.log("CREATED NEW note: " + data)
        //         res.send(data);
        //     })
        //     .catch((err: { message: string; }) => {
        //         res.status(500).send({
        //             message: err.message || "Some error occurred while creating the note."
        //         });
        //     });
    }

    // Retrieve all notes from the database.
    //We use req.query.title to get query string from the Request and consider it as condition for findAll() method.
    findAll (req:any, res:any){

        const clusterId = req.query.clusterId;
        const condition = clusterId ? {
            clusterId: clusterId
        } : null;


        MetadataDB.findAll({
            attributes: ['id', 'name', 'S3uniqueName', 'cloud', 'uploadedBy', 'ownedBy', 'sizeOfFile_MB', 'tagsKeys', 'tagsValues'],
            include: [{
                model: db.file_clusterSubDB,
                where: condition,
                attributes: []
                }]
            })
            .then((data: any) => {
                console.log("data: " + data)
                res.send(data);
            })
            .catch((err: { message: string; }) => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving tutorials."
                });
            });
    }

    calcUsedSize(req:any, res:any){

        const ownerUserId = req.query.ownerUserId;
        const condition = ownerUserId ? {
            ownerUserId: ownerUserId
        } : null;

        //TODO get db names from configuration and rewrite it in Sequelize syntax
        MetadataDB.findAll({
            attributes: [[db.sequelizeEntity.fn('sum', db.sequelizeEntity.col('sizeOfFile_MB')), 'usedStorageSize']],

            where: {
                id: {
                    [Op.in]: [db.sequelizeEntity.literal(`SELECT "fileId" FROM "file-clusterSubDBs" WHERE "clusterId" IN
(SELECT "clusterId" FROM "clustersDBs" WHERE "ownerUserId" = '`+ ownerUserId + `')`)]
                }
            }
        })
        .then((data: any) => {
            console.log("data: " + data)
            res.send(data);
        })
        .catch((err: { message: string; }) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving tutorials."
            });
        });
    }

//
// // Find a single Tutorial with an id
// exports.findOne = (req, res) => {
//     const id = req.params.id;
//
//     Tutorial.findByPk(id)
//         .then(data => {
//             res.send(data);
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message: "Error retrieving Tutorial with id=" + id
//             });
//         });
// };
//
// // Update a Tutorial by the id in the request
// exports.update = (req, res) => {
//     const id = req.params.id;
//
//     Tutorial.update(req.body, {
//         where: { id: id }
//     })
//         .then(num => {
//             if (num == 1) {
//                 res.send({
//                     message: "Tutorial was updated successfully."
//                 });
//             } else {
//                 res.send({
//                     message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`
//                 });
//             }
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message: "Error updating Tutorial with id=" + id
//             });
//         });
// };
//
// // Delete a Tutorial with the specified id in the request
    delete(req: any, res: any) {
        db.sequelizeEntity.query('delete from filesmetadataview where id = '+ req.query.id +';').then((response: any) => {
            res.send(response);
        }).catch((err: { message: string; }) => {
            res.status(500).send({
                message: err.message || "Some error occurred while deleting the note."
            });
        });
        // MetadataDB.destroy({
        //     where: { id: req.query.id}
        // })
        //     .then((num: number) => {
        //         if (num == 1) {
        //             res.send({
        //                 message: "file metadata was deleted successfully!"
        //             });
        //         } else {
        //             res.send({
        //                 message: `Cannot delete file metadata. Maybe it was not found!`
        //             });
        //         }
        //     })
        //     .catch((err: any) => {
        //         res.status(500).send({
        //             message: err
        //         });
        //     });
    };
//
// // Delete all Tutorials from the database.
// exports.deleteAll = (req, res) => {
//     Tutorial.destroy({
//         where: {},
//         truncate: false
//     })
//         .then(nums => {
//             res.send({ message: `${nums} Tutorials were deleted successfully!` });
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message: err.message || "Some error occurred while removing all tutorials."
//             });
//         });
// };
//
// // Find all published Tutorials
// exports.findAllPublished = (req, res) => {
//     Tutorial.findAll({ where: { published: true } })
//         .then(data => {
//             res.send(data);
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message: err.message || "Some error occurred while retrieving tutorials."
//             });
//         });
// };
}

export default DatabaseController;