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
import {Cluster} from "../../../interfaces/databaseTables";
import * as jwt from "jsonwebtoken";
import AuthMiddleware from "../../../middleware/auth.middleware";
import config from "../../../../util/config";
import * as jwkToPem from "jwk-to-pem";
import {Component} from "react";

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

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;


interface IState {
    newClusterName: string
    clusters: any
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

    async decodeIdToken(idToken: string) {
        const URL = `https://cognito-idp.${config.userPoolRegion}.amazonaws.com/${config.userPoolId}/.well-known/jwks.json`
        const pems: any = {}
        try{
            // @ts-ignore
            const response = await fetch(URL);
            if (response.status !== 200){
                throw `request not successful`
            }
            const data = await response.json()
            const { keys } = data
            for (let index = 0; index < keys.length; index++) {
                const key = keys[index]
                const key_id = key.kid
                const modulus = key.n
                const exponent = key.e
                const key_type = key.kty
                const jwk = { kty: key_type, n: modulus, e: exponent }
                const pem = jwkToPem(jwk)
                pems[key_id] = pem

            }

            console.log("got all pems: " + pems.toString())
        } catch (error) {
            console.log("cannot get pems")
            console.log(error)
        }


        //////pems for IDENTITY TOKEN
        let decodeIDJwt: any = jwt.decode(idToken, {complete: true})
        //console.log(decodeJwt) some info about user is here!!!
        if (!decodeIDJwt) {
            alert("ERROR WITH TOKEN")
        }

        let kid2 = decodeIDJwt.header.kid
        let pem2 = pems[kid2]
        if (!pem2) {
            alert("ERROR WITH pem2")
        }

        const decodedIdToken = await jwt.verify(idToken, pem2, {algorithms: ['RS256']});

        //console.log(`Decoded and verified id token from aws ${JSON.stringify(decodedIdToken)}`);
        // @ts-ignore
        this.setState({userId: decodedIdToken.sub})
    }

    constructor(props: ReduxType) {
        super(props);

    }

    async componentDidMount() {
        await this.props.loadStore()

        await this.decodeIdToken(this.props.idToken)
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

    getUserRole = () => {
        if(this.state.userId == ''){
            return
        }
        //TODO
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
        fetch('/api/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
                USER ROLE IS "{this.state.userRole}"!!<br/>
                Your current used storage size is {this.state.usedStorageSize} MBs
                <Form.Group controlId="formBasicUserName">
                    <Form.Label>UserName</Form.Label>
                    <Form.Control onChange={this._onChangeClusterName} type="string" placeholder="Cluster name"/>
                </Form.Group>
                <Button onClick={this.createCluster} variant="primary">Create Cluster</Button>
                <Button onClick={this.getAllUserClusters} variant="primary">Check all your clusters</Button>
                
                <this.AdminPanel isAdmin={this.state.userRole == "ADMINISTRATOR"}/>

                <Table striped bordered hover variant="dark">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Cluster</th>
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