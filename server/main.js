import {Meteor} from 'meteor/meteor';
import  '../imports/api/server/methods';
import  '../imports/api/server/debug';

Meteor.startup(() => {
    // code to run on server at startup
    // TO REPLACE WITH OWN API KEY
    process.env.MAIL_URL = '';
});
