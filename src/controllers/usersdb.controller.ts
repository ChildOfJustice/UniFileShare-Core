import * as express from 'express';

import db from "../models"
import {User} from "../interfaces/user";
import AuthMiddleWare from '../middleware/auth.middleware'

const Usersdb = db.usersDB;
const Op = db.SequelizeService.Op;

class UsersdbController {
    public path = '/users'
    public router = express.Router()

    private authMiddleWare: AuthMiddleWare

    constructor() {
        this.authMiddleWare = new AuthMiddleWare()
        this.initRoutes()
    }


    private initRoutes() {
        this.router.use(this.authMiddleWare.verifyToken)

        // Create a new note
        this.router.post("/create", this.create);

        // Retrieve all Tutorials
        this.router.get("/findAll", this.findAll);

        // // Retrieve all published Tutorials
        // router.get("/published", tutorials.findAllPublished);
        //
        // // Retrieve a single Tutorial with id
        this.router.get("/find", this.findOne);
        //
        // // Update a Tutorial with id
        // router.put("/:id", tutorials.update);
        //
        // // Delete a Tutorial with id
        // router.delete("/:id", tutorials.delete);
        this.router.delete("/delete", this.delete);
        //
        // // Create a new Tutorial
        // router.delete("/", tutorials.deleteAll);

    }

    // Create and Save a new note
    create(req: any, res: any) {

        // Validate request
        //^


        // Create a note
        const note: User = {
            name: req.body.name,
            // someReal: req.body.someReal,
            // signUpDate: req.body.signUpDate
            roleId: req.body.roleId,
            cognitoUserId: req.body.cognitoUserId,
            signUpDate: req.body.signUpDate
        };


        // Save Tutorial in the database
        Usersdb.create(note)
            .then((data: never) => {
                //res.send(JSON.stringify(data));
                console.log("CREATED NEW USER: " + data)
                if (res != null)
                    res.send(data);
            })
            .catch((err: { message: string; }) => {
                if (res != null)
                    res.status(500).send({
                        message: err.message || "Some error occurred while creating the note."
                    });
            });
    }

    // Retrieve all notes from the database.
    //We use req.query.title to get query string from the Request and consider it as condition for findAll() method.
    findAll(req: any, res: any) {
        const ownedBy = req.query.ownedBy;
        const condition = ownedBy ? {
            username: {
                [Op.iLike]: `%${ownedBy}%`
            }
        } : null;

        Usersdb.findAll({where: condition})
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
// // Find a single User with an id
    findOne(req: any, res: any) {
        const id = req.query.userId;
        const condition = id ? {
            cognitoUserId: id
        } : null;

        db.rolesDB.findAll({
            attributes: ['role'],
            include: [{
                model: Usersdb,
                attributes: ['name'],
                where: condition
            }]
        }).then((data: any) => {
            console.log("data: " + data)
            res.send(data);
        })
            .catch((err: { message: string; }) => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving user role."
                });
            });


        // Usersdb.findAll({
        //     where: condition,
        //     attributes: ['name', 'roleId'],
        //     include: [{
        //         model: db.rolesDB,
        //         //attributes: []
        //     }]
        // }).then((data: any) => {
        //         console.log("data: " + data)
        //         res.send(data);
        //     })
        //     .catch((err: { message: string; }) => {
        //         res.status(500).send({
        //             message: err.message || "Some error occurred while retrieving user role."
        //         });
        //     });

        // Usersdb.findByPk(id)
        //     .then((data: any) => {
        //         res.send(data);
        //     })
        //     .catch((err: any) => {
        //         res.status(500).send({
        //             message: "Error retrieving User with id=" + id + ": " + err
        //         });
        //     });
    };

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
        Usersdb.destroy({
            where: {
                cognitoUserId: {
                    [Op.iLike]: `%${req.query.cognitoUserId}%`
                }
            }
        })
            .then((num: number) => {
                if (num == 1) {
                    res.send({
                        message: `user ${req.query.cognitoUserId} was deleted successfully!`
                    });
                } else {
                    res.send({
                        message: `Cannot delete user ${req.query.cognitoUserId}. Maybe it was not found!`
                    });
                }
            })
            .catch((err: any) => {
                res.status(500).send({
                    message: err
                });
            });
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

export default UsersdbController;