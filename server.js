require('dotenv').config();

const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public')); //public폴더의 static파일들 사용
app.set('view engine', 'ejs') //템플릿엔진 사용

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
app.get('/', (요청, 응답) =>{
     응답.send('Hello, world!')
   })
app.get('/list', (요청, 응답) =>{
    응답.render('list.ejs')
  })