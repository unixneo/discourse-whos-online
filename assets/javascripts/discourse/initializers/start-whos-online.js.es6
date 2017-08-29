import { withPluginApi } from 'discourse/lib/plugin-api';

var inject = Ember.inject;

export default {
  name: 'start-whos-online',

  initialize(container) {
    const onlineService = container.lookup('service:online-service');
    const siteSettings = container.lookup('site-settings:main');

    // If user not allowed, don't display
    if(!onlineService.get('shouldDisplay')) return;

    const indicatorType = siteSettings.whos_online_avatar_indicator;

    // If feature disabled, don't display
    if(indicatorType === 'none') return;

    // Set the html class accordingly
    $('html').addClass(`whos-online-${indicatorType}`);

    withPluginApi('0.2', api => {

      api.modifyClass('component:user-card-contents',{
        onlineService: inject.service('online-service'),
        classNameBindings: ['isOnline:user-online'],

        isOnline: function(){
          if(!this.get('user')){
            return false;
          }
          return this.get('onlineService').isUserOnline(this.get('user').id);
        }.property('onlineService.users.@each', 'user'),
      });

      if(siteSettings.whos_online_avatar_indicator_topic_lists){
        api.modifyClass('component:topic-list-item',{
          onlineService: inject.service('online-service'),
          classNameBindings: ['isOnline:last-poster-online'],

          isOnline: function(){
            return this.get('onlineService').isUserOnline(this.get('topic.lastPoster.id'));
          }.property('onlineService.users.@each', 'user'),
        });

        api.modifyClass('component:latest-topic-list-item',{
          onlineService: inject.service('online-service'),
          classNameBindings: ['isOnline:last-poster-online'],

          isOnline: function(){
            return this.get('onlineService').isUserOnline(this.get('topic.lastPoster.id'));
          }.property('onlineService.users.@each', 'user'),
        });
      }

      api.reopenWidget('post-avatar',
        {
          defaultState() {
            this.appEvents.on("whosonline:changed", () => {
              this.scheduleRerender();
            });
            return {};
          },

          buildClasses(){
            if(onlineService.isUserOnline(this.attrs.user_id)){
              return 'user-online';
            }
            return [];
          }
        }
      );

      api.reopenWidget('topic-participant',
        {
          defaultState() {
            this.appEvents.on("whosonline:changed", () => {
              this.scheduleRerender();
            });
            return {};
          },

          buildClasses(){
            if(onlineService.isUserOnline(this.attrs.id)){
              return 'user-online';
            }
            return [];
          }
        }
      );

    });



  },
};