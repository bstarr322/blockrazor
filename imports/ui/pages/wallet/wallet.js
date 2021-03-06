import { Template } from 'meteor/templating';
import {FlowRouter} from 'meteor/staringatlights:flow-router';
import { Wallet, UserData } from '/imports/api/indexDB.js';

import '/imports/ui/components/notLoggedIn.html'
import './wallet.html'
import './wallet.scss'

Template.wallet.onCreated(function bodyOnCreated() {

  var self = this
  self.autorun(function() {
    SubsCache.subscribe('wallet');
    SubsCache.subscribe('users');
  })
});

Template.wallet.helpers({
  otherBalance: (cur) => {
    let user = UserData.findOne({
      _id: Meteor.userId()
    })

    if (user) {
      return user.others && user.others[cur] ? user.others[cur] : 0
    }
  },
  balance () {
    return UserData.findOne({}, {fields: {balance: 1}}).balance
  },
  currencyNotifications: (currency) => {
	  return Wallet.find({
		  owner: Meteor.userId(),
		  type: "transaction",
		  currency: currency,
		  read: false
	  }).count();
  }
});

Template.wallet.events({
  'click #js-add': (event, templateInstance) => {
    event.preventDefault()

    Meteor.call('addOthers', $('#js-cur').val(), parseFloat($('#js-amount').val()), (err, data) => {
      if (err) {
        sAlert.error(err.reason)
      } else {
        sAlert.success('Successfully deposited.')
      }
    })
  },
  'click .currency-card .card-content': function(event) {
    FlowRouter.go('/wallet/'+event.currentTarget.getAttribute('data-value'))
  }
});
