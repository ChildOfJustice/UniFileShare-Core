import * as React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { connect } from 'react-redux';
import { IRootState } from '../../../store';

const mapStateToProps = ({ demo }: IRootState) => {
    const { authToken, idToken, loading } = demo;
    return { authToken, idToken, loading };
}

import { Dispatch } from 'redux';
import * as asyncactions from '../../../store/demo/async-actions';
import * as tokensService from '../../../store/demo/tokens.service'
import * as storeService from '../../../store/demo/store.service'
import { DemoActions } from '../../../store/demo/types';
import {NavItem, Table} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap";
import Navbar from "react-bootstrap/Navbar";
import {Link, Route} from 'react-router-dom';
import ClusterOverview from "./ClusterOverview";


//to use any action you need to add dispatch as an argument to a function!!
const mapDispatcherToProps = (dispatch: Dispatch<DemoActions>) => {
    return {
        loadStore: () => storeService.loadStore(dispatch),
    }
}

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;


interface IState {
    clusters: any
    password: string
}


class PersonalPage extends React.Component<ReduxType, IState> {
    public state: IState = {
        clusters: [["", ""]],
        password: '',
    }

    constructor(props: ReduxType) {
        super(props);

    }

    componentDidMount() {
        //alert("ONLOAD!!")
        this.props.loadStore()
    }

    handleTableClick = () => {
        alert("CLICK!")
    }

    getAllNodesFromDB = (event: any) => {
        event.preventDefault()


        fetch('/files/metadata/findAll?username=TEST_USER',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(res => {
                console.log(res)
                res.json().then(jsonRes => {
                    console.log(jsonRes)
                })

                if(res.ok)
                    alert("Successfully get all nodes from db")
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))
    }

    getAllUserClusters = () => {
        fetch('/db/findAll?username=TEST_USER',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(res => {
                console.log(res)
                res.json().then(jsonRes => {
                    console.log(jsonRes)
                })

                if(res.ok)
                    alert("Successfully get all nodes from db")
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))
    }
    //eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {

        const list = [["1","FIRST"], ["2","SECOND"]]

        const PersonalPage = (
            <div>
                <NavItem eventKey={7}>Smth</NavItem>
                <Navbar bg="light">
                    <LinkContainer to="/private/uploadFile">
                        <Navbar.Brand>Upload file</Navbar.Brand>
                    </LinkContainer>
                </Navbar>
                <Table striped bordered hover variant="dark">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Cluster</th>
                    </tr>
                    </thead>
                    <tbody>
                    <Link to={{
                        pathname:'/ideas/:',
                        }}>Ideas</Link>
                    {list.map(
                        l => <LinkContainer to={{
                            pathname:'/private/clusters/'+l[1],
                            }}>
                            <tr onClick={this.handleTableClick}>
                            {l.map(
                                el => <td key={el}>
                                    {el}
                                </td>)}
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