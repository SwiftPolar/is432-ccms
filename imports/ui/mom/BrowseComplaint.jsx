import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import {Grid, Header, Segment, Table} from 'semantic-ui-react';
import {Feedback} from '../../api/collections';
import {Link} from 'react-router-dom';

import moment from 'moment';

class BrowseComplaint extends Component {
    constructor(props) {
        super();
        this.state = {
            complaintsArr: []
        };
    }

    componentWillReceiveProps(nextProps) {
        const {complaints} = nextProps;
        this.setState({
            complaints: nextProps.complaints,
            complaintsArr: complaints.find({}).fetch()
        });
    }

    render() {
        const {complaintsArr} = this.state;

        return (<Grid>
            <Grid.Row><Grid.Column width={16}>
                <Segment size="massive" basic>
                    <Header textAlign="center" size="large" content="Viewing Complaints"/>
                </Segment>
            </Grid.Column></Grid.Row>
            <Grid.Row><Grid.Column width={16}>
                <Table celled>
                    <Table.Header><Table.Row>
                        <Table.HeaderCell>ID</Table.HeaderCell>
                        <Table.HeaderCell>Type</Table.HeaderCell>
                        <Table.HeaderCell>Category</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Severity</Table.HeaderCell>
                        <Table.HeaderCell>Deadline</Table.HeaderCell>
                        <Table.HeaderCell>Last Updated</Table.HeaderCell>
                        <Table.HeaderCell>Assigned To</Table.HeaderCell>
                    </Table.Row></Table.Header>
                    <Table.Body>{complaintsArr.map((complaint) => {
                        const {_id, severity, deadline, area, lastUpdated, internal, status, assignment} = complaint;
                        return (<Table.Row key={_id}>
                            <Table.Cell><Link to={"/mom/complaint/" + _id}>{_id}</Link></Table.Cell>
                            <Table.Cell>{internal ? internal : "-"}</Table.Cell>
                            <Table.Cell>{area}</Table.Cell>
                            <Table.Cell>{status}</Table.Cell>
                            <Table.Cell>{severity}</Table.Cell>
                            <Table.Cell>{deadline ? moment(deadline).fromNow() : "-"}</Table.Cell>
                            <Table.Cell>{moment(lastUpdated).format('lll')}</Table.Cell>
                            <Table.Cell>{assignment}</Table.Cell>
                        </Table.Row>)
                    })}</Table.Body>
                </Table>
            </Grid.Column></Grid.Row>
        </Grid>);
    }
}

export default BrowseComplaintContainer = withTracker(({...rest}) => {
    const handle = Meteor.subscribe('getComplaints');
    return {
        complaintsLoading: !handle.ready(),
        complaints: Feedback,
        ...rest
    }
})(BrowseComplaint);