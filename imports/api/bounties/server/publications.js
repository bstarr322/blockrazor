import { Meteor } from 'meteor/meteor'
import { Bounties, BountyTypes } from '/imports/api/indexDB.js'

Meteor.publish('bounties', function(id) {
  if(!id) {
    return Bounties.find();
  } else {
    return Bounties.find({_id: id, currentUsername: Meteor.user().username});
  }
});
Meteor.publish('bountytypes', function(type) {
  if(!type) {
    return BountyTypes.find();
  } else {
    return BountyTypes.find({type: type});
  }
});
['currency', 'hashpower', 'codebase', 'wallet', 'community'].forEach(i => {
  Meteor.publish(`${i}Bounty`, userId => Bounties.find({
    userId: Meteor.userId(),
    type: `new-${i}`
  }))
})
