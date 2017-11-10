import React, {Component} from 'react';
import {Grid, Header, Segment, Statistic, Table} from 'semantic-ui-react';

export default class Dashboard extends Component {
    render() {

        const getComplaintCard = (severity) => {
            let data = {};
            data.value = "2,204";
            data.deadline = {
                less: "10",
                medium: "20",
                more: "30"
            };

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
                    <Statistic.Value>{data.value}</Statistic.Value>
                </Statistic>
                <Table textAlign="center" basic size="large">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>{"<"}7</Table.HeaderCell>
                            <Table.HeaderCell>{"<"}30</Table.HeaderCell>
                            <Table.HeaderCell>{">"}30</Table.HeaderCell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>{data.deadline.less}</Table.Cell>
                            <Table.Cell>{data.deadline.medium}</Table.Cell>
                            <Table.Cell>{data.deadline.more}</Table.Cell>
                        </Table.Row>
                    </Table.Header>
                </Table>
            </div>)
        };

        const getCountCard = (type) => {
            let data = {};
            data.value = "120";
            switch(type) {
                case "internal":
                    data.color = "blue";
                    data.label = "Complaints - MoM";
                    break;
                case "external":
                    data.color = "brown";
                    data.label = "Complaints - External";
                    break;
                case "compliments":
                    data.color = "green";
                    data.label = "Compliments";
                    break;
            }

            return(
                <Statistic size="huge" color={data.color}>
                    <Statistic.Label>{data.label}</Statistic.Label>
                    <Statistic.Value>{data.value}</Statistic.Value>
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
                <Grid.Column>{getCountCard("compliments")}</Grid.Column>
            </Grid.Row>
        </Grid>)
    }
}