import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import {Feedback} from '../../api/collections.js';
import {Grid, Header, Form, Tab, Table, List, Menu, Icon, Modal, Confirm} from 'semantic-ui-react';

class Complaint extends Component {
    constructor(props) {
        super();
        this.state = {
            feedback: false,
            editFeedback: false,
            loading: props.loading,
            hasEdits: false,
            modal: {
                spam: false,
                closeCase: false
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        let {feedback, loading} = nextProps;
        let {editFeedback} = this.state;
        this.setState({
            feedback: feedback ? feedback : false,
            editFeedback: editFeedback ? editFeedback : feedback ?
                Object.assign({}, feedback) : false,
            loading
        });
    }

    handleChange(evt, {name, value}) {
        const {editFeedback, feedback} = this.state;
        let hasEdits = false;
        if (value != feedback[name]) {
            hasEdits = true;
        } else {
            let editKeys = Object.keys(editFeedback);
            for (let i = 0; i < editKeys.length; i++) {
                let key = editKeys[i];
                if (editFeedback[key] != feedback[key]) {
                    hasEdits = true;
                    break;
                }
            }
        }
        editFeedback[name] = value;
        this.setState({editFeedback, hasEdits});
    }

    render() {
        const {loading, feedback, editFeedback, hasEdits, modal} = this.state;
        const getDetailsForm = () => {
            const typeOptions = [
                {key: "internal", text: "Internal", value: "internal"},
                {key: "external", text: "External", value: "external"}
            ];
            const categoryOptions = [
                {key: 'workpass', text: 'Work passes and permits', value: 'workpass'},
                {key: 'practices', text: 'Employment practices', value: 'practices'},
                {key: 'safetyhealth', text: 'Workplace safety and health', value: 'safetyhealth'},
                {key: 'employment', text: 'Employment agencies', value: 'employment'},
                {key: 'general', text: 'General feedback', value: 'general'},
            ];
            const statusOptions = [
                {key: "status-received", text: "Received", value: "received"},
                {key: "status-pending", text: "Pending", value: "pending"},
                {key: "status-closed", text: "Closed", value: "closed"},
            ];
            const severityOptions = [
                {key: "severity-high", text: "High", value: "high"},
                {key: "severity-medium", text: "Medium", value: "medium"},
                {key: "severity-low", text: "Low", value: "low"},
            ];
            const discardChanges = () => {
                this.setState({editFeedback: feedback, hasEdits: false});
            };
            return (<Form size="massive" style={{paddingRight: '25px'}}>
                <Form.Select label="Type" inline onChange={this.handleChange.bind(this)}
                             name="internal" options={typeOptions} value={editFeedback.internal}/>
                <Form.Select label="Category" inline onChange={this.handleChange.bind(this)}
                             name="area" options={categoryOptions} value={editFeedback.area}/>
                <Form.Select label="Status" inline onChange={this.handleChange.bind(this)}
                             name="status" options={statusOptions} value={editFeedback.status}/>
                <Form.Select label="Severity" inline onChange={this.handleChange.bind(this)}
                             name="severity" options={severityOptions} value={editFeedback.severity}/>
                <Form.Input label="Deadline" inline onChange={this.handleChange.bind(this)}
                            name="deadline" type="date" value={editFeedback.deadline}/>
                <Form.Group>
                    <Form.Input label="Assign" inline onChange={this.handleChange.bind(this)}
                                name="assignment" value={editFeedback.assignment}/>
                    <Form.Button style={{marginTop: '15px'}} content="Take Case" color="grey"/>
                </Form.Group>
                <Form.Group widths={"equal"}>
                    <Form.Button content="Save Changes" color="green" disabled={!hasEdits}/>
                    <Form.Button content="Discard Changes" color="red" disabled={!hasEdits}
                                 onClick={discardChanges.bind(this)}/>
                </Form.Group>
            </Form>)
        };

        const getRightPanel = () => {
            const infoPanel = (<Tab.Pane><Table><Table.Body>
                <Table.Row>
                    <Table.Cell><b>Name</b></Table.Cell>
                    <Table.Cell>{feedback.name}</Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell><b>NRIC/FIN</b></Table.Cell>
                    <Table.Cell>{feedback.id}</Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell><b>Email</b></Table.Cell>
                    <Table.Cell>{feedback.email}</Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell><b>Details</b></Table.Cell>
                    <Table.Cell>{feedback.details}</Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell><b>Attachments</b></Table.Cell>
                    <Table.Cell>{feedback.files ? (<List bulleted>
                        {feedback.files.map((file) => {
                            return <List.Item key={file}>
                                <a target="_blank" href={file}>
                                    {file.substring(file.lastIndexOf('/') + 1)}
                                </a>
                            </List.Item>
                        })}
                    </List>) : ("None")}</Table.Cell>
                </Table.Row>
            </Table.Body></Table></Tab.Pane>);

            const actionPanel = () => {
                const openSpam = () => {
                    modal.spam = !modal.spam;
                    this.setState({modal});
                };
                const okSpam = () => {Meteor.call('markSpam', feedback._id, openSpam)};
                const confirmSpam = (<Confirm open={modal.spam} content="Mark this feedback as spam?"
                             onCancel={openSpam} onConfirm={okSpam}
                    />);


                return (<Tab.Pane><Grid>
                    <Grid.Row columns={1} textAlign="center"><Grid.Column><Menu compact stackable>
                        <Menu.Item link href={"mailto:" + feedback.email}><Icon name="reply"/>Reply Sender</Menu.Item>
                        <Menu.Item link><Icon name="mail forward"/>Forward</Menu.Item>
                        <Menu.Item link><Icon name="close"/>Close</Menu.Item>
                        <Menu.Item link onClick={openSpam}><Icon name="ban"/>Spam</Menu.Item>
                    </Menu></Grid.Column></Grid.Row>
                    <Grid.Row columns={1}><Grid.Column>
                    </Grid.Column></Grid.Row>
                </Grid>{confirmSpam}</Tab.Pane>)
            };

            const notePanel = (<Tab.Pane>
                NOTES
            </Tab.Pane>);

            const panes = [
                {
                    menuItem: {key: 'rightpanel-info', icon: 'info', content: 'Info'},
                    render: () => (infoPanel)
                },
                {
                    menuItem: {key: 'rightpanel-action', icon: 'hand pointer', content: 'Actions'},
                    render: () => (actionPanel())
                },
                {
                    menuItem: {key: 'rightpanel-note', icon: 'sticky note outline', content: 'Notes'},
                    render: () => (notePanel)
                },
            ]
            return (<Tab panes={panes}/>)
        }

        if (loading) return "Loading";
        return (<Grid>
            <Grid.Row columns={1}><Grid.Column>
                <Header size="large" textAlign="center" content={"Complaint ID: " + feedback._id}/>
            </Grid.Column></Grid.Row>
            <Grid.Row columns={2}>
                <Grid.Column><Grid>
                    <Grid.Row columns={1}><Grid.Column>
                        <Header textAlign="center" content="Details"/>
                    </Grid.Column></Grid.Row>
                    <Grid.Row columns={1} textAlign="right"><Grid.Column>
                        {getDetailsForm()}
                    </Grid.Column></Grid.Row>
                </Grid></Grid.Column>
                <Grid.Column>{getRightPanel()}</Grid.Column>
            </Grid.Row>
        </Grid>)
    }
}

export default ComplaintContainer = withTracker((props) => {
    let id = props.match.params.id;
    const handle = Meteor.subscribe('getFeedback', id);
    return {
        feedbackLoading: !handle.ready(),
        feedback: Feedback.findOne({_id: id}),
    };
})(Complaint);