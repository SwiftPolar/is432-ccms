import React, {Component} from 'react';
import {
    Grid, Form, Input, Select, Step, Button, Container, Segment,
    Header, TextArea, Message
} from 'semantic-ui-react';

export default class FeedbackForm extends Component {
    constructor() {
        super();
        this.state = {
            form: {},
            loading: false,
            submitted: false,
            results: ""
        }
    }


    submitForm() {
        const {form} = this.state;
        this.setState({loading: true, form: {}});
        Meteor.call('checkFeedback', form.id, form.feedbackId, (err, res) => {
            if (err) {
                console.log('error!');
                return;
            }
            let results = "";
            if (res) {
                results = {
                    id: res._id,
                    status: res.status
                };
            }

            this.setState({
                results,
                loading: false,
                submitted: true
            });
        })

    }

    handleChange(evt, {name, value}) {
        const {form} = this.state;
        form[name] = value;

        this.setState({form: form});
    }

    render() {
        const {loading, submitted, form, results} = this.state;

        return (
            !submitted ? (<div>
                <Segment size='massive' basic style={{paddingLeft: '100px', paddingRight: '100px'}} textAlign='center'>
                    <Header size='large' content="Check Feedback Status" textAlign='center'/>
                    Track and follow the feedback you have submitted.
                </Segment>
                <Grid style={{paddingLeft: '100px', paddingRight: '100px'}} centered stretched>
                    <Grid.Row><Grid.Column width={10}>
                        <Form size='huge' loading={loading} onSubmit={this.submitForm.bind(this)}>
                            <Form.Input onChange={this.handleChange.bind(this)} name="id"
                                        value={form.id} label='NRIC/FIN'/>
                            <Form.Input onChange={this.handleChange.bind(this)} name="feedbackId"
                                        value={form.feedbackId} label='Feedback S/N'/>
                            <Form.Button type="submit" content="Check" size="huge" floated="right"/>
                        </Form>
                    </Grid.Column></Grid.Row>


                </Grid>
            </div>) : (
                <Container text><Message size="massive" success={results} error={!results}>
                    <Message.Header>Feedback Status</Message.Header>
                    <Message.Content>
                        {results ? (<div>
                            Feedback S/N: {results.id}<br />
                            Status: {results.status}
                        </div>) :
                            "No such feedback found."}
                    </Message.Content>
                </Message>
                    <Button size="huge" content="Check another Feedback" floated="right"
                            onClick={()=> {
                                this.setState({submitted: false})
                            }}/>
                </Container>
            )
        )
    }
}