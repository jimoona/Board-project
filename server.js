require('dotenv').config();
const { MongoClient } = require('mongodb')

let db
const url = process.env.MONGO_URL; // 환경변수에서 DB URL 가져옴


new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('board')

  app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
  }) //디비 접속 완료 후 서버 띄우기

}).catch((err)=>{
  console.log(err)
})
//몽고디비 라이브러리 셋팅