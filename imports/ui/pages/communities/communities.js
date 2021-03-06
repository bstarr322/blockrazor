import { Template } from 'meteor/templating';
import { Currencies, Ratings, Bounties } from '/imports/api/indexDB.js';
import Cookies from 'js-cookie'

import './communities.html'
import './commCurrencyChoices'
import './commQuestions'

Template.communities.onCreated(function() {
    this.autorun(() => {
        SubsCache.subscribe('approvedcurrencies')
        SubsCache.subscribe('ratings')
        SubsCache.subscribe('communityBounty')
    })

    this.name = new ReactiveVar('')
    this.symbol = new ReactiveVar('')
    this.cnt = 0
    this.ties = 0

    this.now = new ReactiveVar(Date.now())
    Meteor.setInterval(() => {
        this.now.set(Date.now())
    }, 1000)
})

Template.communities.onRendered(function() {
    this.autorun(function() {
        if (Template.instance().subscriptionsReady()) {
            const count = Ratings.find({
                $or: [{
                    answered: false,
                    catagory: 'community'
                }, {
                    answered: false,
                    context: 'community'
                }]
            }).count()

            $('#outstandingRatings').toggle(!!count)
            $('#currencyChoices').toggle(!count)
        }
    })
})

Template.communities.events({
    'click #elo': (event, templateInstance) => {
        Meteor.call('tabulateElo', (err, data) => {})
    },
    'click #communities': (event, templateInstance) => {
        Meteor.call('averageElo', 'community', (err, data) => {})
    },
    'keyup #js-name, keyup #js-symbol': (event, templateInstance) => {
        event.preventDefault()

        templateInstance[event.currentTarget.id.substring(3)].set($(event.currentTarget).val())
    },
    'click #populateRatings': (event, templateInstance) => {
        Meteor.call('populateCommunityRatings', (err, result) => {
            if (err) {
				swal({
                    icon: "error",
                    text: err.reason,
                    button: { className: 'btn btn-primary' }
                });
            } else {
				swal({
					icon: "warning",
					title: "We detect lazy answering!",
					text: _lazyAnsweringWarningText,
					button: { text: 'continue', className: 'btn btn-primary' }
				}).then((value) => {
					if (!Ratings.findOne({
	                    $or: [{
	                        answered: false,
	                        catagory: 'community'
	                    }, {
	                        answered: false,
	                        context: 'community'
	                    }]
	                })) {
						swal({
		                    icon: "error",
		                    text: 'Please add some communities to continue.',
		                    button: { className: 'btn btn-primary' }
		                });
	                }
				});
            }
        })
    },
    'click #js-cancel': (event, templateInstance) => {
        event.preventDefault()

        Meteor.call('deleteNewBountyClient', 'new-community', (err, data) => {})
        Cookies.set('workingBounty', false, { expires: 1 })

        FlowRouter.go('/')
    },
    'click .toggle': function(event, templateInstance) {
        $(`#links_${this._id}`).toggle()
    }
})

Template.communities.helpers({
    activeBounty: () => {
        let bounty = Bounties.find({
            userId: Meteor.userId(),
            type: 'new-community',
            completed: false
        }, {
            sort: {
                expiresAt: -1
            }
        }).fetch()[0]
        console.log(bounty)

        return bounty && bounty.expiresAt > Date.now()
    },
    timeRemaining: () => {
        let bounty = Bounties.find({
            userId: Meteor.userId(),
            type: 'new-community',
            completed: false
        }, {
            sort: {
                expiresAt: -1
            }
        }).fetch()[0]

        return `You have ${Math.round((bounty.expiresAt - Template.instance().now.get())/1000/60)} minutes to complete the bounty for ${Number(bounty.currentReward).toFixed(2)} KZR.`;
    },
    questions: () => {
        return Ratings.findOne({
            $or: [{
                answered: false,
                catagory: 'community'
            }, {
                answered: false,
                context: 'community'
            }]
        })
    }
})
