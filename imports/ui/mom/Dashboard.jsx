import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import {Grid, Header, Segment, Statistic, Table} from 'semantic-ui-react';
import {Feedback} from '../../api/collections';


class Dashboard extends Component {
    constructor(props) {
        super();
        this.state = {
            loading: props.dashboardLoading,
            dashboard: props.dashboardLoading ? {} : props.dashboard,
            stats: {
                high: {count: 0, less: 0, medium: 0, more: 0},
                medium: {count: 0, less: 0, medium: 0, more: 0},
                low: {count: 0, less: 0, medium: 0, more: 0},
                unassigned: {count: 0, less: 0, medium: 0, more: 0},
                compliment: 0
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        const {dashboard} = nextProps;
        let stats = {
            high: {count: 0, less: 0, medium: 0, more: 0},
            medium: {count: 0, less: 0, medium: 0, more: 0},
            low: {count: 0, less: 0, medium: 0, more: 0},
            unassigned: {count: 0, less: 0, medium: 0, more: 0},
            compliment: 0,
            internal: 0,
            external: 0
        };
        dashboard.map((stat) => {
            const {deadline, type, severity, internal} = stat;
            if (type === 'compliment') {
                stats.compliment++;
                return;
            }
            const oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
            const currentDate = new Date();
            const diffDays = Math.round(Math.abs((deadline.getTime() - currentDate.getTime())/(oneDay)));
            const diffDaysCat = diffDays > 30 ? "more" : diffDays < 7 ? "less" : "medium";

            stats[severity].count++;
            stats[severity][diffDaysCat]++;
            if (severity !== 'unassigned') {
                if (internal === "internal") {
                    stats.internal++;
                } else {
                    stats.external++;
                }
            }
        });
        this.setState({stats});
    }

    render() {
        const {stats} = this.state;

        const getComplaintCard = (severity) => {
            let data = stats[severity];

            switch (severity) {
                case "high":
                    data.label = "High Severity";
                    data.color = "red";
                    break;
                case "medium":
                    data.label = "Medium Severity";
                    data.color = "orange";
                    break;
                case "low":
                    data.label = "Low Severity";
                    data.color = "yellow";
                    break;
                case "unassigned":
                    data.label = "Unassigned";
                    data.color = "grey";
                    break;
            }

            return (<div>
                <Statistic size="huge" color={data.color}>
                    <Statistic.Label>{data.label}</Statistic.Label>
                    <Statistic.Value>{data.count}</Statistic.Value>
                </Statistic>
                <Table textAlign="center" basic size="large">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>{"<"}7</Table.HeaderCell>
                            <Table.HeaderCell>{"<"}30</Table.HeaderCell>
                            <Table.HeaderCell>{">"}30</Table.HeaderCell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>{data.less}</Table.Cell>
                            <Table.Cell>{data.medium}</Table.Cell>
                            <Table.Cell>{data.more}</Table.Cell>
                        </Table.Row>
                    </Table.Header>
                </Table>
            </div>)
        };

        const getCountCard = (type) => {
            let data = {count: stats[type]};
            switch (type) {
                case "internal":
                    data.color = "blue";
                    data.label = "Complaints - MoM";
                    break;
                case "external":
                    data.color = "brown";
                    data.label = "Complaints - External";
                    break;
                case "compliment":
                    data.color = "green";
                    data.label = "Compliments";
                    break;
            }

            return (
                <Statistic size="huge" color={data.color}>
                    <Statistic.Label>{data.label}</Statistic.Label>
                    <Statistic.Value>{data.count}</Statistic.Value>
                </Statistic>
            )

        };

        return (<Grid>
            <Grid.Row><Grid.Column width={16}>
                <Segment size='massive' basic style={{paddingLeft: '100px', paddingRight: '100px'}}>
                    <Header size='large' content="CCMS Dashboard" textAlign='center'/>
                </Segment>
            </Grid.Column></Grid.Row>
            <Grid.Row>
                <Grid.Column width={16}>
                    <Header size='large' content="Complaints Status" textAlign='center'/>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={4} textAlign="center">
                <Grid.Column>{getComplaintCard("high")}</Grid.Column>
                <Grid.Column>{getComplaintCard("medium")}</Grid.Column>
                <Grid.Column>{getComplaintCard("low")}</Grid.Column>
                <Grid.Column>{getComplaintCard("unassigned")}</Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column width={16}>
                    <Header size='large' content="Total Count" textAlign='center'/>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={3} textAlign="center">
                <Grid.Column>{getCountCard("internal")}</Grid.Column>
                <Grid.Column>{getCountCard("external")}</Grid.Column>
                <Grid.Column>{getCountCard("compliment")}</Grid.Column>
            </Grid.Row>
        </Grid>)
    }
}

export default DashboardContainer = withTracker(({...rest}) => {
    const handle = Meteor.subscribe('getDashboard');
    return {
        dashboardLoading: !handle.ready(),
        dashboard: Feedback.find({}).fetch(),
        ...rest
    }
})(Dashboard);