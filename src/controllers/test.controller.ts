import db from "../models"
const Test = db.testDB;
const Op = db.SequelizeService.Op;

// Create and Save a new note
export function create (req:any, res:any) {

    // Validate request
    if (!req.body.title) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a note
    const note = {
        username: req.body.username,
        someReal: req.body.someReal,
        signUpDate: req.body.signUpDate
    };

    // Save Tutorial in the database
    Test.create(note)
        .then((data: never) => {
            //res.send(JSON.stringify(data));
            res.send(data);
        })
        .catch((err: { message: string; }) => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Tutorial."
            });
        });
}

// Retrieve all notes from the database.
//We use req.query.title to get query string from the Request and consider it as condition for findAll() method.
export function findAll (req:any, res:any){
    const username = req.query.username;
    const condition = username ? {
        username: {
            [Op.iLike]: `%${username}%`
        }
    } : null;

    Test.findAll({ where: condition })
        .then((data: any) => {
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
// exports.delete = (req, res) => {
//     const id = req.params.id;
//
//     Tutorial.destroy({
//         where: { id: id }
//     })
//         .then(num => {
//             if (num == 1) {
//                 res.send({
//                     message: "Tutorial was deleted successfully!"
//                 });
//             } else {
//                 res.send({
//                     message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`
//                 });
//             }
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message: "Could not delete Tutorial with id=" + id
//             });
//         });
// };
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