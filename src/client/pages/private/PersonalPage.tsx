import * as React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import {connect} from 'react-redux';
import {IRootState} from '../../../store';
import {Dispatch} from 'redux';
import * as storeService from '../../../store/demo/store.service'
import {DemoActions} from '../../../store/demo/types';
import {Table} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";
import {Cluster, FileMetadata} from "../../../interfaces/databaseTables";
import * as jwt from "jsonwebtoken";
import AuthMiddleware from "../../../middleware/auth.middleware";
import config from "../../../../util/config";
import * as jwkToPem from "jwk-to-pem";
import {decodeIdToken} from "../../../interfaces/user";
import ClusterOverview from "./ClusterOverview";
import * as AWS from "aws-sdk";
import {History} from "history";
import CognitoService from "../../../services/cognito.service";

const mapStateToProps = ({demo}: IRootState) => {
    const {authToken, idToken, loading} = demo;
    return {authToken, idToken, loading};
}


//to use any action you need to add dispatch as an argument to a function!!
const mapDispatcherToProps = (dispatch: Dispatch<DemoActions>) => {
    return {
        loadStore: () => storeService.loadStore(dispatch),
    }
}

interface IProps {
    history : History
    /* other props for ChildComponent */
}

type ReduxType = IProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;


interface IState {
    newClusterName: string
    clusters: Cluster[]
    userId: string
    userRole: string
    queryToDB: string
    dbResponse: string
    usedStorageSize: number | string
}


class PersonalPage extends React.Component<ReduxType, IState> {
    public state: IState = {
        newClusterName: "",
        clusters: [],
        userId: '',
        userRole: 'NO_ROLE',
        queryToDB: '',
        dbResponse: '',
        usedStorageSize: 0
    }



    constructor(props: ReduxType) {
        super(props);

    }

    async componentDidMount() {
        await this.props.loadStore()

        await decodeIdToken(this.props.idToken).then(userid => this.setState({userId: userid}))
        await this.getAllUserClusters()
        await this.getUserRole()
        await this.getUsedStorageSize()
    }

    handleTableClick = () => {

    }

    createCluster = () => {

        let clusterData: Cluster = {
            clusterId: null,
            name: this.state.newClusterName,
            ownerUserId: this.state.userId,
        }

        fetch('/clusters/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(clusterData)
        })
            .then(res => {
                res.json().then(jsonRes => {
                    console.log(jsonRes)
                })

                if (res.ok) {
                    console.log("Successfully created new cluster")
                    this.getAllUserClusters()
                }
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))
    }
    deleteFile = (S3uniqueName:string, fileId: number | null) => {

        AWS.config.update({
            region: config.AWS.S3.bucketRegion,
            credentials: new AWS.CognitoIdentityCredentials({
                IdentityPoolId: config.AWS.IdentityPool.IdentityPoolId
            })
        });

        var s3 = new AWS.S3({
            apiVersion: '2006-03-01',
            params: {Bucket: config.AWS.S3.bucketName}
        });

        var params = {  Bucket: config.AWS.S3.bucketName, Key: S3uniqueName };

        s3.deleteObject(params, function(err, data) {
            if (err) {
                alert("Cannot delete this file from S3 bucket!")
                console.log(err, err.stack);  // error
            }
            else {
                console.log();
                alert("File has been deleted.")
            }
        })

        // @ts-ignore
        var clusterId_ = this.props.match.params.clusterId

        fetch('/file_cluster/delete?fileId='+fileId+"&clusterId="+clusterId_, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(res => {
                res.json().then(jsonRes => {
                    console.log(jsonRes)
                })

                if (res.ok) {
                    console.log("Successfully deleted file-cluster")

                    fetch('/files/metadata/delete?id='+fileId, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                            // 'Content-Type': 'application/x-www-form-urlencoded',
                        }
                    })
                        .then(res => {
                            res.json().then(jsonRes => {
                                console.log(jsonRes)
                            })

                            if (res.ok) {
                                console.log("Successfully deleted file metadata")
                                // @ts-ignore
                                this.loadFilesMetadata(this.props.match.params.clusterId)
                            }
                            else alert("Error, see logs for more info")
                        })
                        .catch(error => alert("Fetch error: " + error))
                    ///^
                }
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))
        ///^
    }

    async deleteCluster(clusterId: number | null){

        var files: FileMetadata[]

        //get all files stored in this cluster
        await fetch('/files/metadata/findAll?clusterId='+clusterId,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(res => {
                //console.log(res)
                res.json().then(jsonRes => {
                    console.log(jsonRes)
                    files = jsonRes
                    if(files.length != 0){
                        alert("You need to delete all files first!")
                        return
                    }
                    //TODO use async and wait files to be deleted
                    //delete each file from file-cluster table and from metadata table:
                    files.forEach(file => {
                        this.deleteFile(file.S3uniqueName, file.id)
                    })



                })

                if(res.ok)
                    console.log("Successfully get all nodes from db")
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))



        //delete cousers associated with this cluster
        await fetch('/cousers/deleteAllAssociatedWithCluster?clusterId='+clusterId, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(res => {
                res.json().then(jsonRes => {
                    console.log(jsonRes)
                })

                if (res.ok) {
                    console.log("Successfully deleted all cousers associated with the cluster")
                    this.getAllUserClusters()
                }
                else alert("Error with deleting associated cousers")
            })
            .catch(error => alert("Fetch error: " + error))

        //delete cluster
        await fetch('/clusters/delete?clusterId='+clusterId, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(res => {
                res.json().then(jsonRes => {
                    console.log(jsonRes)
                })

                if (res.ok) {
                    console.log("Successfully deleted cluster")
                    this.getAllUserClusters()
                }
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))

        this.props.history.push("/private/area")

    }

    async deleteUser() {
        if(this.state.clusters.length != 0){
            alert("You need to delete all clusters first!")
            return
        }
        for (const cluster of this.state.clusters) {
            await this.deleteCluster(cluster.clusterId)
        }

        const cognito = new CognitoService();
        await cognito.deleteUser(this.props.authToken)
            .then(promiseOutput =>{
                if(promiseOutput.success){
                    console.log("user successfully deleted: " + promiseOutput.msg)
                    // @ts-ignore
                    //userCognitoId = promiseOutput.msg.UserSub
                } else {
                    console.log("ERROR WITH DELETING USER: " + promiseOutput.msg)
                    return
                }
            });

        //delete user
        await fetch('/users/delete?cognitoUserId='+this.state.userId, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(res => {
                res.json().then(jsonRes => {
                    console.log(jsonRes)
                })

                if (res.ok) {
                    console.log("Successfully deleted user")
                    this.props.history.push("/")
                }
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))
    }


    getUserRole = () => {
        if(this.state.userId == ''){
            return
        }
        fetch('/users/find?userId='+this.state.userId, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(res => {
                res.json().then(jsonRes => {
                    console.log(JSON.stringify(jsonRes))
                    //alert(JSON.stringify(jsonRes));
                    this.setState({userRole: jsonRes[0].role})
                })

                if (res.ok)
                    console.log("Successfully get all nodes from db")
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))
    }

    getAllUserClusters = () => {
        if(this.state.userId == ''){
            return
        }
        fetch('/clusters/findAll?ownerUserId='+this.state.userId, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(res => {
                res.json().then(jsonRes => {
                    console.log(jsonRes)
                    this.setState({clusters: jsonRes})
                })

                if (res.ok)
                    console.log("Successfully get all nodes from db")
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))
    }

    getUsedStorageSize = () => {

        fetch('/files/metadata/calcUsedSize?ownerUserId='+this.state.userId, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(res => {
                res.json().then(jsonRes => {
                    console.log(jsonRes)
                    if(jsonRes[0].usedStorageSize == null)
                        this.setState({usedStorageSize: 0})
                    else this.setState({usedStorageSize: jsonRes[0].usedStorageSize})
                })

                if (res.ok)
                    console.log("Successfully get all nodes from db")
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))
    }

    makeAdminQuery = () => {
        if(this.state.queryToDB == ''){
            return
        }

        const data = {
            query: this.state.queryToDB
        }
        const { authToken, idToken, loading} = this.props;
        fetch('/protected/adminQuery', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Auth': authToken,
                'Identity': idToken
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                res.json().then(jsonRes => {
                    console.log(jsonRes)
                    this.setState({dbResponse: JSON.stringify(jsonRes[0])})
                })

                if (res.ok)
                    console.log("Successfully get all nodes from db")
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))
    }

    _onChangeClusterName = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({newClusterName: (e.target as HTMLInputElement).value})
    }
    _onChangeQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({queryToDB: (e.target as HTMLInputElement).value})
    }


    // @ts-ignore
    AdminPanel = ({ isAdmin }) => (
        <div className="hello">
            {isAdmin ? <Form.Group controlId="adminPanel">
                <Form.Label>Query to Database</Form.Label>
                <Form.Control onChange={this._onChangeQuery} type="string" placeholder="Query"/>
                <Button onClick={this.makeAdminQuery} variant="primary">Make request</Button>

                <Form.Label>Response</Form.Label>
                <Form.Control as="textarea" value={this.state.dbResponse}/>
            </Form.Group> : ''}
        </div>
    );

    //eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {

        var counter = 0

        const PersonalPage = (
            <div>
                Your user id is: "{this.state.userId}".<br/>
                Your role is: "{this.state.userRole}".<br/>
                Your current used storage size is {this.state.usedStorageSize} MB.
                <Button onClick={() => this.deleteUser()} variant="danger">DELETE THIS ACCOUNT</Button> <br/>

                <Form.Group controlId="formBasicUserName">
                    <Form.Label>Cluster Name</Form.Label>
                    <Form.Control onChange={this._onChangeClusterName} type="string" placeholder="Cluster name"/>
                </Form.Group>
                <Button onClick={this.createCluster} variant="primary">Create Cluster</Button>

                <Button onClick={this.getAllUserClusters} variant="primary">Update clusters</Button>
                
                <this.AdminPanel isAdmin={this.state.userRole == "ADMINISTRATOR"}/>

                <br/>
                <LinkContainer to="/private/sharedWithMeClusters">
                    <Button variant="primary">Shared with me</Button>
                </LinkContainer>

                <Table striped bordered hover variant="dark">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Cluster</th>
                        <th>Delete</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.clusters.map(
                        (l: Cluster) => <LinkContainer to={{
                            pathname: '/private/clusters/' + l.clusterId,
                        }}>
                            <tr onClick={this.handleTableClick}>
                                <td key={counter}>
                                    {counter++}
                                </td>
                                <td>
                                    {l.name}
                                </td>
                                <td>
                                    <Button onClick={() => this.deleteCluster(l.clusterId)} variant="danger">X</Button>
                                </td>
                            </tr>
                        </LinkContainer>
                    )}

                    </tbody>
                </Table>
            </div>

        )


        return (
            PersonalPage
        )
    }


}

export default connect(mapStateToProps, mapDispatcherToProps)(PersonalPage);