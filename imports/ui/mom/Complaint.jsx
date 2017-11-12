import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import {Feedback} from '../../api/collections.js';
import {
    Grid, Header, Form, Tab, Table, List, Menu, Icon, TextArea,
    Segment, Button, Modal, Confirm, Label, Select, Input
} from 'semantic-ui-react';

class Complaint extends Component {
    constructor(props) {
        super();
        this.state = {
            user: props.user,
            feedback: false,
            editFeedback: "",
            loading: props.loading,
            hasEdits: false,
            modal: {
                spam: false,
                closeCase: false
            },
            actionPanelSegment: 'default'
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
        const changeExceptions = ['finalRemarks', 'forwardMessage', 'forwardDepartment'];
        if (changeExceptions.indexOf(name) !== -1) {

        } else if (value != feedback[name]) {
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

    uploadAdditionalFiles() {
        const {files, filesName, feedback} = this.state;
        Meteor.call('uploadAdditionalFiles', feedback._id, files, filesName);
    }

    render() {
        const {loading, feedback, editFeedback, hasEdits, modal, user} = this.state;
        const isSupervisor = user.role === "supervisor";

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
            const severityOptions = [
                {key: "severity-high", text: "High", value: "high"},
                {key: "severity-medium", text: "Medium", value: "medium"},
                {key: "severity-low", text: "Low", value: "low"},
            ];
            const discardChanges = () => {
                this.setState({editFeedback: feedback, hasEdits: false});
            };
            const saveChanges = () => {
                Meteor.call('updateFeedbackInfo', feedback._id, editFeedback, (err, res) => {
                    if (err) return;
                    this.setState({editFeedback: feedback, hasEdits: false});
                });
            };
            const getDate = () => {
                try {
                    let date = new Date(editFeedback.deadline).toISOString().substring(0, 10);
                    return date;
                } catch (err) {
                    return new Date().toISOString().substring(0, 10)
                }
            };

            return (<Form size="large" style={{paddingRight: '25px'}}>
                <Form.Select label="Type" inline onChange={this.handleChange.bind(this)}
                             name="internal" options={typeOptions} value={editFeedback.internal}/>
                <Form.Select label="Category" inline onChange={this.handleChange.bind(this)}
                             name="area" options={categoryOptions} value={editFeedback.area}/>
                <Form.Select label="Severity" inline onChange={this.handleChange.bind(this)}
                             name="severity" options={severityOptions} value={editFeedback.severity}/>
                <Form.Input label="Deadline" inline onChange={this.handleChange.bind(this)}
                            name="deadline" type="date"
                            value={getDate()}/>
                <Form.Group>
                    <Form.Input label="Assign" inline onChange={this.handleChange.bind(this)}
                                name="assignment" value={editFeedback.assignment} disabled={!isSupervisor}/>
                    <Form.Button content="Take Case" color="grey"
                                 onClick={this.handleChange.bind(this, '', {
                                     name: 'assignment',
                                     value: user.username
                                 })}/>
                </Form.Group>
                <Form.Group widths={"equal"}>
                    <Form.Button content="Save Changes" color="green" disabled={!hasEdits}
                                 onClick={saveChanges.bind(this)}/>
                    <Form.Button content="Discard Changes" color="red" disabled={!hasEdits}
                                 onClick={discardChanges.bind(this)}/>
                </Form.Group>
            </Form>)
        };

        const getLeftPanel = () => {
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

            const additionalInfo = () => {
                const handleFiles = (evt, data) => {
                    const files = evt.target.files;
                    this.setState({files: [], filesName: []});
                    for (var i = 0; i < files.length; i++) {
                        let file = files.item(i);
                        let fileReader = new FileReader(),
                            method, encoding = 'binary', type = type || 'binary';
                        switch (type) {
                            case 'text':
                                method = 'readAsText';
                                encoding = 'utf8';
                                break;
                            case 'binary':
                                method = 'readAsBinaryString';
                                encoding = 'binary';
                                break;
                            default:
                                method = 'readAsBinaryString';
                                encoding = 'binary';
                                break;
                        }
                        fileReader.onload = (res) => {
                            let {files, filesName} = this.state;
                            files.push(res.target.result);
                            filesName.push(file.name);
                            this.setState({files, filesName});
                        };
                        fileReader[method](file);

                    }
                };

                return (<Tab.Pane>
                    <Form>
                        <Form.Input onChange={handleFiles.bind(this)} type="file" multiple
                                    label='Upload Additional Files' placeholder='Select Files'/>
                        <Form.Button content="Upload" onClick={this.uploadAdditionalFiles.bind(this)}/>
                    </Form>
                    <Header content="Additional Files Uploaded"/>
                    {feedback.additionalFiles ? (<List bulleted>
                        {feedback.additionalFiles.map((file) => {
                            return <List.Item key={file}>
                                <a target="_blank" href={file}>
                                    {file.substring(file.lastIndexOf('/') + 1)}
                                </a>
                            </List.Item>
                        })}
                    </List>) : ("None")}
                </Tab.Pane>);
            };

            const panes = [
                {
                    menuItem: {key: 'leftpanel-form', icon: 'info', content: 'Info'},
                    render: () => (<Tab.Pane>{getDetailsForm()}</Tab.Pane>)
                },
                {
                    menuItem: {key: 'leftpanel-info', icon: 'wpforms', content: 'Feedback'},
                    render: () => (infoPanel)
                },
                {
                    menuItem: {key: 'leftpanel-additionalinfo', icon: 'info circle', content: 'Additional'},
                    render: () => (additionalInfo())
                },
            ]

            return (<Tab panes={panes}/>)
        };

        const getRightPanel = () => {

            const actionPanel = () => {
                const okSpam = () => {
                    Meteor.call('markSpam', feedback._id, openSpam)
                };
                const closeCase = (evt, data) => {
                    const finalRemarks = editFeedback.finalRemarks;
                    editFeedback.finalRemarks = "";
                    this.setState({editFeedback: editFeedback});

                    if (data.negative) return;

                    Meteor.call('closeCase', feedback._id, finalRemarks);
                };

                const forwardMessage = (evt, data) => {
                    const message = editFeedback.forwardMessage;
                    const department = editFeedback.forwardDepartment;
                    editFeedback.forwardMessage = "";
                    editFeedback.forwardDepartment = "";
                    this.setState({editFeedback: editFeedback});

                    if (data.negative) return;

                    Meteor.call('forwardFeedback', feedback._id, message, department);
                };

                const getActionSegments = () => {
                    const {actionPanelSegment} = this.state;
                    let content = "";
                    switch (actionPanelSegment) {
                        case 'forward':
                            content = (<Form>
                                <Header content="Choose department to forward to"/>
                                <Select name="forwardDepartment" value={editFeedback.forwardDepartment}
                                        onChange={this.handleChange.bind(this)} fluid
                                        placeholder="Select department to forward to..." options={[
                                    {key: 'momdept-foreign', value: 'foreign', text: 'Foreign Manpower'},
                                    {key: 'momdept-hr', value: 'hr', text: 'Human Resource'},
                                    {key: 'momdept-legal', value: 'legal', text: 'Legal Services'},
                                    {key: 'momdept-safetyhealth', value: 'safetyhealth', text: 'Safety and Health'},
                                    {key: 'momdept-workpass', value: 'workpass', text: 'Work Pass'},
                                ]}/>
                                <TextArea style={{marginTop: '14px'}} name="forwardMessage" rows="6"
                                          value={editFeedback.forwardMessage}
                                          placeholder="Addtional message details"
                                          onChange={this.handleChange.bind(this)}/>

                                <Button.Group floated="right" style={{paddingTop: "20px"}}>
                                    <Button onClick={forwardMessage} content="Reset" icon="cancel" negative/>
                                    <Button onClick={forwardMessage} content="Forward" icon="check" positive/>
                                </Button.Group>
                            </Form>);
                            break;
                        case 'spam':
                            content = (<div>
                                <Header content="Mark as Spam?"/>
                                <Button onClick={okSpam} content="Confirm" icon="check" positive floated="right"/>
                            </div>);
                            break;
                        case 'close':
                            content = (<Form>
                                <Header content="Final Remarks"/>
                                <TextArea name="finalRemarks" rows="6" value={editFeedback.finalRemarks}
                                          placeholder="e.g. Actions taken / Followed up by / Verdict etc."
                                          onChange={this.handleChange.bind(this)}/>
                                <Button.Group floated="right" style={{paddingTop: "20px"}}>
                                    <Button onClick={closeCase} content="Discard Changes" icon="cancel" negative/>
                                    <Button onClick={closeCase} content="Close Feedback" icon="check" positive/>
                                </Button.Group>
                            </Form>);
                            break;
                        default:
                            content = "Last Updated: " + feedback.lastUpdated;
                            break;
                    }

                    return (<Segment basic style={{paddingTop: '0px'}}>{content}</Segment>)
                };

                const setActionSegment = (segment) => this.setState({actionPanelSegment: segment});

                return (<Tab.Pane><Grid>
                    <Grid.Row columns={1} textAlign="center"><Grid.Column><Menu compact stackable>
                        <Menu.Item link href={"mailto:" + feedback.email}><Icon name="reply"/>Reply Sender</Menu.Item>
                        <Menu.Item link onClick={setActionSegment.bind(this, 'forward')}><Icon name="mail forward"/>Forward</Menu.Item>
                        <Menu.Item link onClick={setActionSegment.bind(this, 'close')}><Icon
                            name="close"/>Close</Menu.Item>
                        <Menu.Item link onClick={setActionSegment.bind(this, 'spam')}><Icon name="ban"/>Spam</Menu.Item>
                    </Menu></Grid.Column></Grid.Row>
                    <Grid.Row columns={1}><Grid.Column>
                        {getActionSegments()}
                    </Grid.Column></Grid.Row>
                </Grid></Tab.Pane>)
            };

            const notePanel = (<Tab.Pane>
                NOTES
            </Tab.Pane>);

            const historyPanel = (<Tab.Pane>
                HISTORY
            </Tab.Pane>);

            const panes = [
                {
                    menuItem: {key: 'rightpanel-action', icon: 'hand pointer', content: 'Actions'},
                    render: () => (actionPanel())
                },
                {
                    menuItem: {key: 'rightpanel-note', icon: 'sticky note outline', content: 'Notes'},
                    render: () => (notePanel)
                },
                {
                    menuItem: {key: 'rightpanel-history', icon: 'history', content: 'History'},
                    render: () => (historyPanel)
                },
            ];
            return (<Tab panes={panes}/>)
        };

        if (loading) return "Loading";
        return (<Grid>
            <Grid.Row columns={1} textAlign="center"><Grid.Column>
                <Header size="large" textAlign="center" content={"Complaint ID: " + feedback._id}/>
                <Label size="large" content="Status" detail={feedback.status}/>
            </Grid.Column></Grid.Row>
            <Grid.Row columns={2}>
                <Grid.Column><Grid>
                    <Grid.Row columns={1}><Grid.Column>
                        {getLeftPanel()}
                    </Grid.Column></Grid.Row>
                </Grid></Grid.Column>
                <Grid.Column>{getRightPanel()}</Grid.Column>
            </Grid.Row>
        </Grid>)
    }
}

export default ComplaintContainer = withTracker(({...props}) => {
    let id = props.match.params.id;
    const handle = Meteor.subscribe('getFeedback', id);
    return {
        feedbackLoading: !handle.ready(),
        feedback: Feedback.findOne({_id: id}),
        ...props
    };
})(Complaint);