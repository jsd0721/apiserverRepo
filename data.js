const mysql = require('mysql');
const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');

const app = express();

//데이터베이스 연결 시 필요한 정보들 설정
const connectObject = {
    host : 'withdrone-database.ckgmwbrflaob.us-east-2.rds.amazonaws.com',
    user:'admin',
    password:'Lxlx970040!!',
    database:'withdrone_flatform'
}

const connection = mysql.createConnection(connectObject);

const connectFunction = ()=>{
    try{
        connection.connect();
        console.log("connected");
    }catch(error){
        console.log(error);
    }
}

connectFunction();

app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended : true}));

app.listen(3000,function(){
    console.log(`server start, port : 3000`);
});


//데이터 가져오는 api
//req : 사용자가 호출할 때 보낸 파라미터를 담는 변수
//res : 사용자에게 보낼 객체.
app.get('/users',function(req,res){
    connection.query('SELECT * FROM objectInfo',async (error,result,field)=>{
        if(error){
            console.log(error);
        }
        res.send(result);
    })
});

app.post('/users/save',(req,res)=>{
    try{
        const name = req.body.name;
        const positionX = req.body.position_X; 
        const positionY = req.body.position_Y; 
        console.log(positionX);
        const positionZ = req.body.position_Z;
        const lengthX = req.body.length_X;
        const lengthY = req.body.length_Y;
        const lengthZ = req.body.length_Z; 
        const rad = req.body.Rad;
        connection.query(`INSERT INTO objectInfo (name, positionX, positionY, positionZ, lengthX, lengthY, lengthZ, rad)
        values('${name}', '${positionX}', '${positionY}', '${positionZ}', '${lengthX}', '${lengthY}', '${lengthZ}', '${rad}')`);
        res.send("data saved");
    }catch(e){
        console.log(e);
    }
});


app.get('/users/:type',(req,res)=>{
    const value = req.params.type;
    console.log(value);
    connection.query(`SELECT * FROM userinfo WHERE name = '${value}'`,async (error,result,field)=>{
        if(error){
            console.log("모종의 이유로 데이터를 찾을 수 없습니다");
        }
        res.send(result);
    })
})