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
    password: string
}


class PersonalPage extends React.Component<ReduxType, IState> {
    public state: IState = {
        newClusterName: "",
        clusters: [],
        password: '',
    }

    constructor(props: ReduxType) {
        super(props);

    }

    componentDidMount() {
        this.props.loadStore()
        this.getAllUserClusters()
    }

    handleTableClick = () => {

    }

    createCluster = () => {
        //TODO
        let clusterData: Cluster = {
            clusterId: null,
            name: this.state.newClusterName,
            ownerUserId: "1",
            createdDate: Date(),
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

                if (res.ok)
                    console.log("Successfully created new cluster")
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))

        this.getAllUserClusters()
    }

    getAllUserClusters = () => {
        fetch('/clusters/findAll?ownerUserId=1', {
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
                                <td key={l.createdDate}>
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