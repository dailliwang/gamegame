<template>
  <div class="game">
    <scroll ref="scroll" class="game-content"
            :data="gamelist"
            :pullup="pullup"
            @scrollNearEnd="addMore"
    >
      <div>
        <div class="slider-wrapper" v-if="focuslist.length">
          <slider ref="slider">
            <div v-for="item in focuslist" @click="toDetail(item)">
                <img class="needsclick" @load="loadImage" :src="item.imgpath"/>
            </div>
          </slider>
        </div>
        <div class="newgamelist-wrapper" v-if="newgamelist.length">
          <div class="newgamelist-title">
            <h1 class="title-text">新游下载</h1>
          </div>
          <div class="newgamelist" v-if="newgamelist.length">
            <scroll-x ref="scrollx">
              <li class="newgamelist-item" v-for="item in newgamelist" @click="toDetail(item)">
                <div class="pic">
                  <img width="60" height="60" :src="item.ioc_path" :onerror="defaultImg"/>
                </div>
                <div class="name">{{item.name}}</div>
                <div class="typename">{{item.typename}}</div>
                <div class="download-btn" @click.stop="download(item)">下载</div>
              </li>
            </scroll-x>
          </div>
        </div>
        <grey-bar></grey-bar>
        <div class="gamelist-wrapper">
          <ul>
            <game-list :data="gamelist" @toDetail="toDetail" @download="download"></game-list>
            <div class="loadsucc" v-show="loadsucc">
              <loading title="" v-show="hasMore && gamelist.length"></loading>
              <div class="no-more" v-show="!hasMore">
                <div class="line"></div>
                <div class="text">我是有底线的</div>
                <div class="line"></div>
              </div>
            </div>
            <div class="loadfail" v-show="!loadsucc && !showLoading">
              网络出错了
            </div>

          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="showLoading">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
  import scroll from 'base/scroll/scroll'
  import slider from 'base/slider/slider'
  import scrollX from 'base/scroll-x/scroll-x'
  import gameList from 'base/game-list/game-list'
  import greyBar from 'base/grey-bar/grey-bar'
  import loading from 'base/loading/loading'
  import {getGamelist,addMoreGamelist} from 'api/game'
  import {normalizeImage} from 'common/js/game-img'
  import storage from 'good-storage'

  export default{
    data () {
      return {
        focuslist:[],
        newgamelist:[],
        gamelist:[],
        page:1,
        pullup:true,
        loadsucc:false,
        hasMore:true,
        showLoading:true,
        defaultImg: 'this.src='+'"static/img/error.png"'
      }
    },
    created(){
      console.log('game-created');
      this.initData();
    },
    methods:{
      initData(){
        this.showLoading = true;        //只在第一次请求数据时使用，请求结束，不管成功与否都消失
        getGamelist().then((res)=>{
          this.showLoading = false;
          this.loadsucc = true;     //加载成功，可以显示addmore和底线
          console.log(res);
          storage.set('firstpage-json',res);       // 存储更新storage数据
          this.focuslist = normalizeImage(res.focuslist);
          this.newgamelist = normalizeImage(res.newgamelist);
          this.$nextTick(()=>{
            this.$refs.slider.initSlider();
            this.$refs.scrollx.initScrollX()
            this.gamelist = normalizeImage(res.gamelist);
          })
        }).catch((err)=>{
          this.showLoading = false;
          this.loadsucc = false;     //加载失败，显示网络出错，不能显示addmore和底线

          //TODO-----------
          //this.page--;           //首页从缓存读了，联网后该从哪一页加载？


          console.log('net error');
          var firPagejson = storage.get('firstpage-json', 404);
          if(firPagejson===404){
          	console.log('no storage');
          }else{
          	console.log('use storage');
	          this.focuslist = normalizeImage(firPagejson.focuslist);
	          this.newgamelist = normalizeImage(firPagejson.newgamelist);
	          this.$nextTick(()=>{
              this.$refs.slider.initSlider();
              this.$refs.scrollx.initScrollX()
              this.gamelist = normalizeImage(firPagejson.gamelist);
	          })
          }
        })
      },
      addMore(){
        if(!this.hasMore){
          return
        }
        this.page++;
        addMoreGamelist(this.page).then((res)=>{
          this.loadsucc = true;    //加载成功，可以显示addmore和底线
          this.gamelist = this.gamelist.concat( normalizeImage(res.gamelist) );
          if(this.page===res.total_page){
            this.hasMore = false;
          }
          this.$nextTick(()=>{
            this.$refs.scroll.refresh();
          })
        }).catch((err)=>{
          this.page--;
          this.loadsucc = false;     //加载失败，显示网络出错，不能显示addmore和底线
        })
      },
      loadImage(){
        if (!this.checkLoaded){
          this.$refs.scroll.refresh();
          this.checkLoaded = true;
        }
      },
      toDetail(item){
        this.$router.push({path:'/game/'+item.gameid});
      },
      download(item){
        console.log(item.name);
        window.location.href = "http://f3.market.xiaomi.com/download/AppStore/06e095d3f6a226d76d97e3bb3c30f5e171e4252fa/com.tencent.qqmusic.apk";
      }
    },
    beforeRouteEnter(to, from, next){
    		next(true)
	    	window.document.location = "js://webview?network=1"
    },
    components:{
      scroll,
      slider,
      scrollX,
      gameList,
      greyBar,
      loading
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .game{
    position: fixed;
    top: 0;
    bottom: 60px;
    width: 100%;
  }
  .game .game-content{
    height: 100%;
    overflow: hidden;
  }
  .game .slider-wrapper{
    position: relative;
    width: 100%;
    overflow: hidden;
  }
  .game .newgamelist-wrapper{
    height: 180px;
    overflow: hidden;
  }
  .game .newgamelist-wrapper .newgamelist-title{
    position: relative;
    padding: 10px 15px 5px;
    height:30px;
    font-size:16px;
    line-height: 30px;
  }
  .game .newgamelist-wrapper .newgamelist-title .icon{
    position: absolute;
    right: 15px;
    top:10px;
  }
  .game .newgamelist-wrapper .newgamelist{
    width:100%;
    height:130px;
    overflow: hidden;
  }
  .game .newgamelist-wrapper .newgamelist .newgamelist-item{
    display: inline-block;
    width:90px;
    height:130px;
    box-sizing: border-box;
    overflow: hidden;
    text-align: center;
  }
  .game .newgamelist-wrapper .newgamelist .newgamelist-item .name{
    margin: 0 auto;
    width: 70px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    line-height:24px;
  }
  .game .newgamelist-wrapper .newgamelist .newgamelist-item .typename{
    font-size: 10px;
    color: #a4a4a4;
  }
  .game .newgamelist-wrapper .newgamelist .newgamelist-item .download-btn{
    font-size: 12px;
    line-height:22px;
    width:50px;
    margin: 5px auto 0;
    border:1px solid #ffb952;
    border-radius:12px;
    color: #ffb952;
  }
  .game .gamelist-wrapper{
    width:100%;
    overflow: hidden;
  }
  .game .gamelist-wrapper .gamelist-item{
    display: flex;
    box-sizing: border-box;
    align-items: center;
    padding:15px;
  }
  .game .gamelist-wrapper .gamelist-item .pic{
    flex:0 0 75px;
    width:75px;
    font-size:0;
  }
  .game .gamelist-wrapper .gamelist-item .desc{
    flex:1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
  }
  .game .gamelist-wrapper .gamelist-item .desc .name{
    margin-bottom:4px;
    font-size:14px;
  }
  .game .gamelist-wrapper .gamelist-item .desc .name .text{
    display: inline-block;
    vertical-align: middle;
  }
  .game .gamelist-wrapper .gamelist-item .desc .size-role-percent{
    font-size:12px;
    line-height:16px;
  }
  .game .gamelist-wrapper .gamelist-item .desc .size-role-percent .roundbg{
    display: inline-block;
    margin-right:3px;
    padding:1px 2px;
    border-radius:3px;
    color: #fff;
  }
  .game .gamelist-wrapper .gamelist-item .desc .size-role-percent .size{
    background:#ff6600;
  }
  .game .gamelist-wrapper .gamelist-item .desc .size-role-percent .role{
    background:#6fa924;
  }
  .game .gamelist-wrapper .gamelist-item .desc .size-role-percent .percent{
    background:#ff6600;
  }
  .game .gamelist-wrapper .gamelist-item .desc .sketch{
    font-size:12px;
    line-height:18px;
    padding-right:20px;
    color: #a4a4a4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
   }
  .game .gamelist-wrapper .gamelist-item .download-btn{
    flex:0 0 50px;
    width:50px;
    height: 50px;
    text-align: center;
    line-height:50px;
    font-size:14px;
    color: #00a98f;
    border:1px solid #00a98f;
    border-radius:25px;
  }
  .game .gamelist-wrapper .no-more{
    display:flex;
    width:80%;
    margin:12px auto 8px;
  }
  .game .gamelist-wrapper .no-more .line{
    flex:1;
    position:relative;
    top: -7px;
    border-bottom: 1px solid #eee;
  }
  .game .gamelist-wrapper .no-more .text{
    padding:0 12px;
    font-size:12px;
    text-align: center;
    color:#dcdcdc;
  }
  .game .gamelist-wrapper .loadfail{
    text-align: center;
    line-height:40px;
  }
  .game .game-content .loading-container{
    position: absolute;
    width: 100%;
    top: 60%;
    transform: translateY(-50%);
  }
</style>
