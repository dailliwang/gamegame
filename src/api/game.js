import jsonp from 'common/js/jsonp'

export function getGamelist(){
  const url = 'http://app.kf989.com/api/data?cpsid=130'
  return jsonp(url, {}, {timeout:3000})
}

export function addMoreGamelist(page){
  const url = 'http://app.kf989.com/api/paging?cpsid=133'
  return jsonp(url, {page:page}, {timeout:3000})
}

export function getDetail(id){
  const url = 'http://app.kf989.com/api/gameinfo?cpsid=1000'
  return jsonp(url,{gameid:id},{timeout:3000})
}


