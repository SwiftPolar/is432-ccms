import {Meteor} from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
    createMomUser(username, password, role) {
        let userId = Accounts.createUser({username, password});
        Meteor.users.update(userId, {$set: {role}});
    }
});