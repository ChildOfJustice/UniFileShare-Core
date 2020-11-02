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
import {decodeIdToken} from "../../../interfaces/user";

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
    clusters: any
    userId: string
    userRole: string
}


class PersonalPage extends React.Component<ReduxType, IState> {
    public state: IState = {
        clusters: [],
        userId: '',
        userRole: 'NO_ROLE',
    }

    constructor(props: ReduxType) {
        super(props);
    }

    async componentDidMount() {
        await this.props.loadStore()

        await decodeIdToken(this.props.idToken).then(userid => this.setState({userId: userid}))
        await this.getAllSharedClusters()
        await this.getUserRole()
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

    getAllSharedClusters = () => {
        if(this.state.userId == ''){
            return
        }
        fetch('/cousers/findAll?userId='+this.state.userId, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(res => {
                res.json().then(jsonRes => {
                    console.log("ALL SHARED CLUSTERS: " + jsonRes)
                    this.setState({clusters: jsonRes})
                })

                if (res.ok)
                    console.log("Successfully get all nodes from db")
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))
    }

    handleTableClick = () => {

    }
    //eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {

        var counter = 0

        const PersonalPage = (
            <div>
                Your role is: "{this.state.userRole}".<br/>

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