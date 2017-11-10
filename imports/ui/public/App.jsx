import React, { Component } from 'react';
import {Grid, Image, Menu, Container, Icon, Breadcrumb, Header, Segment} from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import FeedbackForm from './FeedbackForm';

export default class App extends Component {

    render() {
        return (<div>
            <Grid >
                <Grid.Row style={{paddingBottom: '0'}}>
                    <Container><Menu borderless fluid style={{boxShadow: 'none', border: '0'}}>
                        <Link to='/public'><Menu.Header as="div" link={""}>
                            <Image src="/images/mom-logo-share-hd.png" size="small" />
                        </Menu.Header></Link>
                        <Menu.Item position="right">
                            <Image size="small" src="/images/sg-gov-logo.png" />
                        </Menu.Item>
                    </Menu></Container>
                </Grid.Row>
                <Grid.Row style={{background: '#006eab', paddingTop: '0', paddingBottom: '0'}}>
                    <Container><Menu borderless size="massive" fluid inverted
                                     style={{boxShadow: 'none', border: '0', background: '#006eab'}}>
                        <Menu.Item active><Icon name="sidebar" />MENU</Menu.Item>
                        <Menu.Item><Breadcrumb  icon='right angle' sections={[
                            {key: 'home', content: 'Home'},
                            {key: 'eservices', content: 'eServices'},
                            {key: 'ccms-form', content: 'File Feedback'},
                        ]} /></Menu.Item>
                    </Menu></Container>
                </Grid.Row>
                <Grid.Row>
                    <Grid container>
                        <Grid.Row>
                            <Segment size='massive' basic style={{paddingLeft: '100px', paddingRight:'100px'}}>
                                <Header size='large' content="File a Feedback" textAlign='center'/>
                                You can send feedback (Complaint/Compliment) about passes, employment practices,
                                workplace safety and health and general feedback.
                            </Segment>
                            <FeedbackForm />
                        </Grid.Row>
                    </Grid>
                </Grid.Row>
            </Grid>
        </div>)
    }
}