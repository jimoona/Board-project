require('dotenv').config();

const express = require('express');
const app = express();
const { MongoClient, ObjectId } = require('mongodb')
const methodOverride = require('method-override')

app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public')); //public폴더의 static파일들 사용
app.set('view engine', 'ejs') //템플릿엔진 사용(DB의 데이터를 ejs파일에 꽂아넣기)
app.use(express.json()) //요청.body를 쓰기 위한 세팅
app.use(express.urlencoded({extended:true})) //요청.body


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
    let result = await db.collection('post').find().toArray() //DB에서 '모든' 데이터 가져오기
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

app.get('/detail/:id', async(요청, 응답) => { 
  try {
    let result = await db.collection('post').findOne({_id : new ObjectId(요청.params.id)}) //DB에서 특정 데이터만 가져오기
    console.log(result) //유저가 url 파라미터 자리에 입력한 값
    if (result == null) {
      응답.status(400).send('이상한 url 입력함')
    } else {
      응답.render('detail.ejs', {게시글 : result})
    }
  } catch(e) {
    console.log(e)
    응답.status(400).send('이상한 url 입력함')
  }
})  

app.get('/edit/:id', async(요청, 응답) => { //URL 파라미터 사용(:을 붙여야)
  let result = await db.collection('post').findOne({_id : new ObjectId(요청.params.id)})
  console.log(result)
  응답.render('edit.ejs', {수정할글 : result})
}) 
//1.수정버튼 누르면 수정 페이지로 이동 (2.기존 글 채워져 있음)

app.put('/edit', async(요청, 응답) => { 
  await db.collection('post').updateOne({_id : new ObjectId(요청.body.id)}, {$set : {title : 요청.body.title, content : 요청.body.content}}) 
  //DB의 document 수정 코드
  console.log(요청.body)
  응답.redirect('/list') //수정 후 list페이지로 이동
})
//3. 전송 누르면 입력한 내용으로 DB 글 수정(서버에 전송 후 서버에서 확인하고 DB 수정)