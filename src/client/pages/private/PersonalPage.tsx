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
}


class PersonalPage extends React.Component<ReduxType, IState> {
    public state: IState = {
        newClusterName: "",
        clusters: [],
        userId: '',
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
    }

    handleTableClick = () => {

    }

    createCluster = () => {
        //TODO
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

    _onChangeClusterName = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({newClusterName: (e.target as HTMLInputElement).value})
    }

    //eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {

        var counter = 0
        const PersonalPage = (
            <div>
                USER IS {this.state.userId}!!
                TEST|{AuthMiddleware.pems_}
                <Form.Group controlId="formBasicUserName">
                    <Form.Label>UserName</Form.Label>
                    <Form.Control onChange={this._onChangeClusterName} type="string" placeholder="Cluster name"/>
                </Form.Group>
                <Button onClick={this.createCluster} variant="primary">Create Cluster</Button>


                <Button onClick={this.getAllUserClusters} variant="primary">Check all your clusters</Button>

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