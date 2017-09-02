import Vue from 'vue'
import Router from 'vue-router'
import Game from 'components/game/Game'
import GameDetail from 'components/game-detail/game-detail'
import Service from 'components/service/Service'
import Search from 'components/search/Search'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/game'
    },
    {
      path: '/game',
      name: 'Game',
      component: Game,
      children:[
        {
          path:':id',
          component: GameDetail
        }
      ]
    },
    {
      path: '/service',
      name: 'Service',
      component: Service
    },
    {
      path: '/search',
      name: 'Search',
      component: Search
    }
  ]
})
