import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import {Grid, Header, Segment, Table, Menu, Input, Dropdown, Checkbox} from 'semantic-ui-react';
import {Feedback} from '../../api/collections';
import {Link, Redirect} from 'react-router-dom';

import moment from 'moment';

class BrowseComplaint extends Component {
    constructor(props) {
        super();
        this.state = {
            complaintsArr: Feedback.find({type: 'complaint'}).fetch(),
            complaint: "",
            redirect: false,
            filter: {type: 'complaint'},
            searchObject: {},
            myAssignment: false,
            assignedTo: "",
            filterArr: []
        };
    }

    componentWillReceiveProps(nextProps) {
        const {complaints} = nextProps;
        this.setState({
            complaints,
            complaintsArr: complaints.find({type: 'complaint'}).fetch()
        });
    }

    handleSearchId(evt, data) {
        const {value} = data;
        const {complaints, filter, myAssignment, assignedTo} = this.state;
        let searchObject = {type: 'complaint'};
        if (value) {
            searchObject._id = {$regex: value, $options: 'i'};
        }
        if (Object.keys(filter).length > 0) {
            searchObject = Object.assign(filter, searchObject);
        }

        if (myAssignment) {
            searchObject.assignment = this.props.user.username;
        } else if (assignedTo) {
            searchObject.assignment = {$regex: assignedTo, $options: 'i'};
        }

        this.setState({
            searchObject,
            complaintsArr: complaints.find(searchObject).fetch()
        });
    }

    handleFilter(evt, data) {
        const {value} = data;
        const {complaints, searchObject, myAssignment, assignedTo} = this.state;
        let filter = {type: 'complaint'};
        value.map((val) => {
            let split = val.split('-');
            let k = split[0];
            let v = split[1];
            if (filter[k]) {
                filter[k]['$in'].push(v);
            } else {
                filter[k] = {$in: [v]};
            }
        });

        if (value.indexOf('internal-all') !== -1) delete filter.internal;
        if (value.indexOf('area-all') !== -1) delete filter.area;
        if (value.indexOf('status-all') !== -1) delete filter.status;
        if (value.indexOf('severity-all') !== -1) delete filter.severity;

        if (Object.keys(filter).length > 0) {
            filter = Object.assign(searchObject, filter);
        }

        if (value.length === 0) {
            delete filter.internal;
            delete filter.area;
            delete filter.status;
            delete filter.severity;
        }

        if (myAssignment) {
            filter.assignment = this.props.user.username;
        } else if (assignedTo) {
            filter.assignment = {$regex: assignedTo, $options: 'i'};
        }

        this.setState({
            filter,
            filterArr: value,
            complaintsArr: complaints.find(filter).fetch()
        })
    }

    handleSearchAssign(evt, data) {
        const {value} = data;
        const {complaints, filter, searchObject, myAssignment, filterArr} = this.state;
        this.setState({assignedTo: value});
        if (myAssignment) return;
        let finalFilter = Object.assign(searchObject, filter);
        if (value) {
            finalFilter.assignment = {$regex: value, $options: 'i'};
        } else {
            delete finalFilter.assignment;
        }

        if (filterArr.length === 0) {
            delete filter.internal;
            delete filter.area;
            delete filter.status;
            delete filter.severity;
        }

        this.setState({
            complaintsArr: complaints.find(finalFilter).fetch()
        });

    }

    handleMyFilter(evt, data) {
        const {checked} = data;
        let {filter, searchObject, complaints, assignedTo, filterArr} = this.state;
        if (checked) {
            filter.assignment = this.props.user.username;
        } else if (assignedTo) {
            filter.assignment = assignedTo;
        } else {
            delete filter.assignment;

        }
        filter = Object.assign(searchObject, filter);

        if (filterArr.length === 0) {
            delete filter.internal;
            delete filter.area;
            delete filter.status;
            delete filter.severity;
        }

        this.setState({
            filter,
            myAssignment: checked,
            complaintsArr: complaints.find(filter).fetch()
        })

    }

    render() {
        const {complaintsArr, redirect, complaint} = this.state;
        const filterOptions = [
            {key: 'filter-internal-all', text: 'All Types', value: 'internal-all', content: <Header content="Type" />},
            {key: 'filter-internal-internal', text: 'Internal', value: 'internal-internal'},
            {key: 'filter-internal-external', text: 'External', value: 'internal-external'},
            {key: 'filter-area-all', text: 'All Categories', value: 'area-all', content: <Header content="Category" />},
            {key: 'filter-area-workpass', text: 'Work passes and permits', value: 'area-workpass'},
            {key: 'filter-area-practices', text: 'Employment practices', value: 'area-practices'},
            {key: 'filter-area-safetyhealth', text: 'Workplace safety and health', value: 'area-safetyhealth'},
            {key: 'filter-area-employment', text: 'Employment agencies', value: 'area-employment'},
            {key: 'filter-area-general', text: 'General feedback', value: 'area-general'},
            {key: 'filter-status-all', text: 'All Statuses', value: 'status-all', content: <Header content="Status" />},
            {key: 'filter-status-receive', text: 'Received', value: 'status-receive'},
            {key: 'filter-status-pending', text: 'Pending', value: 'status-pending'},
            {key: 'filter-status-closed', text: 'Closed', value: 'status-closed'},
            {key: 'filter-severity-all', text: 'All Severity', value: 'severity-all', content: <Header content="Severity" />},
            {key: 'filter-severity-high', text: 'High', value: 'severity-high'},
            {key: 'filter-severity-medium', text: 'Medium', value: 'severity-medium'},
            {key: 'filter-severity-low', text: 'Low', value: 'severity-low'},
        ];

        if (redirect) return <Redirect to={'/mom/complaint/' + complaint} push/>;

        return (<Grid>
            <Grid.Row><Grid.Column width={16}>
                <Segment size="massive" basic>
                    <Header textAlign="center" size="large" content="Viewing Complaints"/>
                </Segment>
                <Menu borderless style={{boxShadow: 'none', border: '0'}}>
                    <Menu.Item>
                        <Input onChange={this.handleSearchId.bind(this)} className='icon'
                               icon='search' placeholder='Search...'/>
                    </Menu.Item>
                    <Menu.Item>
                        <Checkbox label="View my assignments" onChange={this.handleMyFilter.bind(this)}/>
                    </Menu.Item>
                    <Menu.Item>
                        <Input onChange={this.handleSearchAssign.bind(this)} className='icon'
                               icon='user' placeholder='Assigned to...'/>
                    </Menu.Item>

                    <Menu.Item position='right'>
                        <Input action={{
                            type: 'submit', content: 'Go', onClick: () => {
                                this.setState({redirect: true});
                            }
                        }} placeholder='Navigate to...' onChange={(evt, data) => {
                            this.setState({complaint: data.value})
                        }}/>
                    </Menu.Item>
                </Menu>
            </Grid.Column></Grid.Row>
            <Grid.Row><Grid.Column width={16}>
                <Dropdown onChange={this.handleFilter.bind(this)} fluid text='Filter' icon='filter' multiple selection options={filterOptions}/>
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
                            <Table.Cell>{assignment ? assignment : "-"}</Table.Cell>
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