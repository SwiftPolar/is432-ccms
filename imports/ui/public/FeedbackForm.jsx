
import React, { Component } from 'react';
import {Grid, Form, Input, Select, Step, Button, Container,
    TextArea, Message} from 'semantic-ui-react';

export default class FeedbackForm extends Component {
    constructor() {
        super();
        this.state = {
            currentStep: 1,
            form: {},
            completed: [false, false, false],
            errors: {},
            submitted: false,
            loading: false,
            feedbackID: ""
        }
    }

    validateForm(type, value) {
        const validateNRIC = (str) => {
            if (str.length != 9)
                return false;

            str = str.toUpperCase();

            var i,
                icArray = [];
            for(i = 0; i < 9; i++) {
                icArray[i] = str.charAt(i);
            }

            icArray[1] = parseInt(icArray[1], 10) * 2;
            icArray[2] = parseInt(icArray[2], 10) * 7;
            icArray[3] = parseInt(icArray[3], 10) * 6;
            icArray[4] = parseInt(icArray[4], 10) * 5;
            icArray[5] = parseInt(icArray[5], 10) * 4;
            icArray[6] = parseInt(icArray[6], 10) * 3;
            icArray[7] = parseInt(icArray[7], 10) * 2;

            var weight = 0;
            for(i = 1; i < 8; i++) {
                weight += icArray[i];
            }

            var offset = (icArray[0] == "T" || icArray[0] == "G") ? 4:0;
            var temp = (offset + weight) % 11;

            var st = ["J","Z","I","H","G","F","E","D","C","B","A"];
            var fg = ["X","W","U","T","R","Q","P","N","M","L","K"];

            var theAlpha;
            if (icArray[0] == "S" || icArray[0] == "T") { theAlpha = st[temp]; }
            else if (icArray[0] == "F" || icArray[0] == "G") { theAlpha = fg[temp]; }

            return (icArray[8] === theAlpha);
        };
        const validateEmail = (email) => {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
        };
        if (!value) return false;
        switch(type) {
            case 'id':
                return validateNRIC(value);
            case 'email':
                return validateEmail(value);
            default:
                return true;
        }
    }

    submitForm() {
        const {errors, form, files, filesName} = this.state;
        errors.area = !this.validateForm('blank', form.area);
        errors.type = !this.validateForm('blank', form.type);
        errors.details = !this.validateForm('blank', form.details);
        errors.id = !this.validateForm('id', form.id);
        errors.email = !this.validateForm('email', form.email);
        errors.name = !this.validateForm('blank', form.name);
        let hasError = (errors.id || errors.email || errors.name || errors.details || errors.type || errors.area);
        if (hasError) {
            this.setState({errors});
            console.log("ERROR IN FIELDS");
        } else {
            this.setState({completed: [true, true, true], loading: true});
            if (files && files.length > 0) {
                form.files = files;
                form.filesName = filesName;
            }
            Meteor.call('newFeedback', form, (err, res) => {
                if (err) {
                    console.log(err);
                    return;
                }

                this.setState({submitted: true, loading: false, feedbackID: res});
            })
        }
    }

    handleChange(evt, {name, value}) {
        const {form, errors} = this.state;
        form[name] = value;
        if (errors[name] != undefined) {
            errors[name] = !this.validateForm(name, value);
        }
        if(name === 'attachments') {
            this.handleFiles(evt.target.files);
        }
        this.setState({form: form, errors});
    }

    handleFiles(files) {
        this.setState({files: [], filesName: []})
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
                console.log(this.state);
            };
            fileReader[method](file);

        }
    }

    changeCurrentStep(step) {
        const {form, errors, completed, currentStep} = this.state;
        let stepHasError = false;
        switch (currentStep) {
            case 1:
                errors.area = !this.validateForm('blank', form.area);
                errors.type = !this.validateForm('blank', form.type);
                stepHasError = (errors.area || errors.type);
                completed[0] = !stepHasError;
                break;
            case 2:
                errors.details = !this.validateForm('blank', form.details);
                stepHasError = (errors.details);
                completed[1] = !stepHasError;
                break;
            case 3:
                errors.id = !this.validateForm('id', form.id);
                errors.email = !this.validateForm('email', form.email);
                errors.name = !this.validateForm('blank', form.name);
                stepHasError = (errors.id || errors.email || errors.name);
                completed[2] = !stepHasError;
                break;
        }

        this.setState({currentStep: stepHasError && step > currentStep ? currentStep : step, errors, completed})
    };

    render() {
        const optionsFeedback = [
            { key: 'workpass', text: 'Work passes and permits', value: 'workpass' },
            { key: 'practices', text: 'Employment practices', value: 'practices' },
            { key: 'safetyhealth', text: 'Workplace safety and health', value: 'safetyhealth' },
            { key: 'employment', text: 'Employment agencies', value: 'employment' },
            { key: 'general', text: 'General feedback', value: 'general' },
        ];
        const optionsFeedbackType = [
            { key: 'compliment', text: 'Compliment', value: 'compliment' },
            { key: 'complaint', text: 'Complaint', value: 'complaint' },

        ];

        const {currentStep, errors, completed, submitted, feedbackID, loading} = this.state;

        const formHasError = () => {
            const {errors} = this.state;
            let keys = Object.keys(errors);
            for (let i = 0; i < keys.length; i++) {
                if (errors[keys[i]]) return true;
            }
            return false;
        };

        return(
            !submitted ? (<Grid style={{paddingLeft: '100px', paddingRight:'100px'}} centered>
                <Grid.Row>
                    <Step.Group ordered stackable='tablet'>
                        <Step link active={currentStep === 1} completed={completed[0]}
                              onClick={this.changeCurrentStep.bind(this, 1)}
                              title="Feedback Type" description="What is this feedback?"/>
                        <Step link active={currentStep === 2} completed={completed[1]}
                              onClick={this.changeCurrentStep.bind(this, 2)}
                              title="Feedback Info" description="Tell us more about your feedback."/>
                        <Step link active={currentStep === 3} completed={completed[2]}
                              onClick={this.changeCurrentStep.bind(this, 3)}
                              title="Contact Info" description="Let us know who you are."/>
                    </Step.Group>
                </Grid.Row>

                <Grid.Row><Grid.Column width={10}>
                    <Form size='huge' error={formHasError()} loading={loading}>
                        <div style={{display: currentStep === 1 ? 'inherit' : 'none'}}>
                            <Form.Field control={Select} label='I am providing feedback on...' name="area"
                                        onChange={this.handleChange.bind(this)} error={errors.area}
                                        options={optionsFeedback} placeholder='Feedback Area' />
                            <Form.Field control={Select} label='My feedback is a...' name="type"
                                        onChange={this.handleChange.bind(this)} error={errors.type}
                                        options={optionsFeedbackType} placeholder='Feedback Type' />
                        </div>
                        <div style={{display: currentStep === 2 ? 'inherit' : 'none'}}>
                            <Form.Field control={TextArea} label='Feedback Details' name="details"
                                        onChange={this.handleChange.bind(this)} error={errors.details}
                                        placeholder='Tell us more about your feedback' />
                            <Form.Input onChange={this.handleChange.bind(this)} type="file" multiple name="attachments"
                                        label='Attachments' placeholder='Select Files' />
                        </div>
                        <div style={{display: currentStep === 3 ? 'inherit' : 'none'}}>
                            <Form.Input type="email" onChange={this.handleChange.bind(this)} name="email"
                                        label='Email' error={errors.email} />
                            <Form.Input onChange={this.handleChange.bind(this)} name="id"
                                        label='NRIC/FIN' error={errors.id} />
                            <Form.Input onChange={this.handleChange.bind(this)} name="name"
                                        label='Name (as per NRIC/WorkPass)' error={errors.name} />
                        </div>

                    </Form>
                </Grid.Column></Grid.Row>

                <Grid.Row>
                    <Grid.Column width={3} floated='left'>
                        {currentStep === 3 || currentStep === 2 ?
                            <Button size='huge' fluid content="Prev"
                                    onClick={this.changeCurrentStep.bind(this, currentStep - 1)}/> : ""}
                    </Grid.Column>
                    <Grid.Column width={3} floated='right'>
                        {currentStep === 1 || currentStep === 2 ?
                            <Button size='huge' fluid content="Next"
                                    onClick={this.changeCurrentStep.bind(this, currentStep + 1)}/> : ""}
                        {currentStep === 3 && !loading ?
                            <Button size='huge' fluid content="Submit" onClick={this.submitForm.bind(this)} /> : ""}
                    </Grid.Column>
                </Grid.Row>


            </Grid>) : (
                <Container text><Message size="massive" success>
                    <Message.Header>We have received your feedback!</Message.Header>
                    <Message.Content>
                        Thank you for your feedback! Your feedback S/N is {feedbackID}.
                        Should there be any actions required from you, we will contact you through
                        your email address.
                    </Message.Content>
                </Message></Container>
            )
        )
    }
}