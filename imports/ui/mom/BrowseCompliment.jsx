import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import {Grid, Header, Segment, Table, Menu, Input, Dropdown, Checkbox, Select} from 'semantic-ui-react';
import {Feedback} from '../../api/collections';
import {Link, Redirect} from 'react-router-dom';

import moment from 'moment';

class BrowseCompliment extends Component {
    constructor(props) {
        super();
        this.state = {
            complimentsArr: Feedback.find({type: 'compliment'}).fetch(),
            compliment: "",
            redirect: false,
            filter: {type: 'compliment'},
            searchObject: {},
            myAssignment: false,
            assignedTo: "",
            filterArr: [],
            sortBy: '',
            lastFilter: {}
        };
    }

    componentWillReceiveProps(nextProps) {
        const {compliments} = nextProps;
        this.setState({
            compliments,
            complimentsArr: compliments.find({type: 'compliment'}).fetch()
        });
    }

    handleSearchId(evt, data) {
        const {value} = data;
        const {filter, myAssignment, assignedTo} = this.state;
        let searchObject = {type: 'compliment'};
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

        if (!value) {
            delete searchObject._id;
        }

        this.setState({
            searchObject,
            lastFilter: searchObject,
        });

        this.sortTable(searchObject);

    }

    handleFilter(evt, data) {
        const {value} = data;
        const {searchObject, myAssignment, assignedTo} = this.state;
        let filter = {type: 'compliment'};
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
        if (value.indexOf('area-all') !== -1) delete filter.area;
        if (value.indexOf('status-all') !== -1) delete filter.status;

        if (Object.keys(filter).length > 0) {
            filter = Object.assign(searchObject, filter);
        }

        if (value.length === 0) {
            delete filter.area;
            delete filter.status;
        }

        if (myAssignment) {
            filter.assignment = this.props.user.username;
        } else if (assignedTo) {
            filter.assignment = {$regex: assignedTo, $options: 'i'};
        }

        this.setState({
            filter,
            filterArr: value,
            lastFilter: filter,
        });

        this.sortTable(filter);

    }

    handleSearchAssign(evt, data) {
        const {value} = data;
        const {filter, searchObject, myAssignment, filterArr} = this.state;
        this.setState({assignedTo: value});
        if (myAssignment) return;
        let finalFilter = Object.assign(searchObject, filter);
        if (value) {
            finalFilter.assignment = {$regex: value, $options: 'i'};
        } else {
            delete finalFilter.assignment;
        }

        if (filterArr.length === 0) {
            delete filter.area;
            delete filter.status;
        }

        this.setState({
            lastFilter: finalFilter,
        });

        this.sortTable(finalFilter);

    }

    handleMyFilter(evt, data) {
        const {checked} = data;
        let {filter, searchObject, assignedTo, filterArr} = this.state;
        if (checked) {
            filter.assignment = this.props.user.username;
        } else if (assignedTo) {
            filter.assignment = assignedTo;
        } else {
            delete filter.assignment;

        }
        filter = Object.assign(searchObject, filter);

        if (filterArr.length === 0) {
            delete filter.area;
            delete filter.status;
        }

        this.setState({
            filter,
            myAssignment: checked,
            lastFilter: filter,
        });

        this.sortTable(filter);

    }

    handleSort(evt, data) {
        const {lastFilter, sortBy} = this.state;
        let value = data ? data.value : sortBy;
        let options = {};

        if (value === 'lastUpdated') {
            options.sort = {};
            options.sort[value] = -1;
        }

        this.setState({
            sortBy: options,
        });
        this.sortTable(lastFilter, options);
    }

    sortTable(filter, options) {
        const {compliments, lastFilter, sortBy} = this.state;
        if (!filter) filter = lastFilter;
        if (!options && sortBy) {
            options = {sort: sortBy};
        } else if (!options) {
            options = {};
        }
        this.setState({
            complimentsArr: compliments.find(filter, options).fetch()
        })
    }

    render() {
        const {complimentsArr, redirect, compliment} = this.state;
        const filterOptions = [
            {key: 'filter-area-all', text: 'All Categories', value: 'area-all', content: <Header content="Category"/>},
            {key: 'filter-area-workpass', text: 'Work passes and permits', value: 'area-workpass'},
            {key: 'filter-area-practices', text: 'Employment practices', value: 'area-practices'},
            {key: 'filter-area-safetyhealth', text: 'Workplace safety and health', value: 'area-safetyhealth'},
            {key: 'filter-area-employment', text: 'Employment agencies', value: 'area-employment'},
            {key: 'filter-area-general', text: 'General feedback', value: 'area-general'},
            {key: 'filter-status-all', text: 'All Statuses', value: 'status-all', content: <Header content="Status"/>},
            {key: 'filter-status-receive', text: 'Received', value: 'status-receive'},
            {key: 'filter-status-pending', text: 'Pending', value: 'status-pending'},
            {key: 'filter-status-closed', text: 'Closed', value: 'status-closed'},
        ];

        if (redirect) return <Redirect to={'/mom/compliment/' + compliment} push/>;

        return (<Grid>
            <Grid.Row><Grid.Column width={16}>
                <Segment size="massive" basic>
                    <Header textAlign="center" size="large" content="Viewing Compliments"/>
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
                    <Menu.Item>
                        <Select onChange={this.handleSort.bind(this)} options={[
                            {key: 'sort-deadline', value: 'deadline', 'text': 'Deadline'},
                            {key: 'sort-updated', value: 'lastUpdated', 'text': 'Last Updated'},
                        ]}
                                placeholder='Sort by...'/>
                    </Menu.Item>


                    <Menu.Item position='right'>
                        <Input action={{
                            type: 'submit', content: 'Go', onClick: () => {
                                this.setState({redirect: true});
                            }
                        }} placeholder='Navigate to...' onChange={(evt, data) => {
                            this.setState({compliment: data.value})
                        }}/>
                    </Menu.Item>
                </Menu>
            </Grid.Column></Grid.Row>
            <Grid.Row style={{paddingTop: '0px'}}><Grid.Column width={16}>
                <Dropdown onChange={this.handleFilter.bind(this)} fluid text='Filter' icon='filter' multiple selection
                          options={filterOptions}/>
                <Table celled>
                    <Table.Header><Table.Row>
                        <Table.HeaderCell>ID</Table.HeaderCell>
                        <Table.HeaderCell>Category</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Last Updated</Table.HeaderCell>
                        <Table.HeaderCell>Assigned To</Table.HeaderCell>
                    </Table.Row></Table.Header>
                    <Table.Body>{complimentsArr.map((compliment) => {
                        const {_id, area, lastUpdated, status, assignment} = compliment;
                        return (<Table.Row key={_id}>
                            <Table.Cell><Link to={"/mom/compliment/" + _id}>{_id}</Link></Table.Cell>
                            <Table.Cell>{area}</Table.Cell>
                            <Table.Cell>{status}</Table.Cell>
                            <Table.Cell>{moment(lastUpdated).format('lll')}</Table.Cell>
                            <Table.Cell>{assignment ? assignment : "-"}</Table.Cell>
                        </Table.Row>)
                    })}</Table.Body>
                </Table>
            </Grid.Column></Grid.Row>
        </Grid>);
    }
}

export default BrowseComplimentContainer = withTracker(({...rest}) => {
    const handle = Meteor.subscribe('getCompliments');
    return {
        compliemntsLoading: !handle.ready(),
        compliments: Feedback,
        ...rest
    }
})(BrowseCompliment);