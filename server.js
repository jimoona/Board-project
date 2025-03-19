require('dotenv').config();

const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public')); //public폴더의 static파일들 사용
app.set('view engine', 'ejs') //템플릿엔진 사용(DB의 데이터를 ejs파일에 꽂아넣기)
app.use(express.json()) //요청.body를 쓰기 위한 세팅
app.use(express.urlencoded({extended:true})) //요청.body

const { MongoClient } = require('mongodb')

let db
const url = process.env.MONGO_URL; // 환경변수에서 DB URL 가져옴
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('board')

  app.listen(8888, () => {
    console.log('http://localhost:8888 에서 서버 실행중')
  }) //디비 접속 완료 후 서버 띄우기

}).catch((err)=>{
  console.log(err)
})
//몽고디비 라이브러리 셋팅
app.get('/', (요청, 응답) => {
     응답.send('Hello, world!')
})
app.get('/list', async(요청, 응답) => {
    let result = await db.collection('post').find().toArray() //DB에서 데이터 가져오기
    console.log(result)
    응답.render('list.ejs', {글목록 : result}) //서버 데이터를 ejs 파일로 전송, 데이터의 이름은 글목록
})
app.get('/write', (요청, 응답) => {
    응답.render('write.ejs')
})
app.post('/add', async(요청, 응답) => {
    console.log(요청.body) //유저가 보낸 데이터 출력 가능, {title: '글제목', content: '글내용'} 형태의 데이터
    try {
      if(요청.body.title == '' || 요청.body.content == '') { //예외_빈칸인 채로 전송될 경우
        응답.send('내용을 입력하세요.')
      } else {
      await db.collection('post').insertOne({title : 요청.body.title, content : 요청.body.content})
    //몽고디비의 post 컬렉션에 title과 content라는 키로 데이터를 저장
    응답.redirect('/list') //서버실행 후 유저를 다른 페이지로 이동시킴
      } 
    } catch(e) {
      console.log(e) //에러메시지 출력
      응답.status(500).send('서버 에러') //프론트에게 에러코드 전송
    }
  })