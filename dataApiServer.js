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

app.get('/objects',function(req,res){
    connection.query('SELECT * FROM objectInfo',( error,result,field )=>{
        if(error){console.log(error);}
        
        res.send(result);
    });
});


app.post('/objects/save',(req,res)=>{
    try{
        const name = req.body.name;
        const positionX = req.body.position_X; 
        const positionY = req.body.position_Y; 
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

app.post('/objects/modify',(req,res) =>{
    try {
        const id = req.body.id;
        const name = req.body.name;
        const positionX = req.body.position_X; 
        const positionY = req.body.position_Y; 
        const positionZ = req.body.position_Z;
        const lengthX = req.body.length_X;
        const lengthY = req.body.length_Y;
        const lengthZ = req.body.length_Z; 
        const rad = req.body.Rad;
        connection.query(`UPDATE objectInfo SET name= '${name}' , lengthX = '${lengthX}', lengthY = '${lengthY}', lengthZ = '${lengthZ}',
            rad = '${rad}' WHERE id='${id}' `);
        res.send("completed to modify");
    } catch (e) {
        console.log(e)
    }
})

app.post('/objects/delete',(req,res) =>{
    try {
        const id = req.body.id;
        const name = req.body.name;
        connection.query(`DELETE FROM objectInfo WHERE id = '${id}' and  name = '${name}' `);
        res.send('id :'+ id + ', name :' +name);
        res.send('completed to delete');
    } catch (error) {
        console.log(error)
    }
})

app.get('/objects/:objectname',(req,res)=>{
    const value = req.params.objectname;
    console.log(value);
    connection.query(`SELECT * FROM objectInfo WHERE name = '${value}'`,( error,result,field )=>{
        if(error){
            console.log("모종의 이유로 데이터를 찾을 수 없습니다");
        }else if(result === null){
            res.send("데이터를 찾을 수 없음.")
        }
        res.send(result[0]);
    })
})

//login
let id;
app.post('/login', function(req,res){
    id = req.body.id;
    const pw = req.body.pw;
    connection.query(`SELECT * FROM user_info WHERE id='${id}'`,( error,result,field )=>{
        if(error){console.log(error);}
        console.log(result);
        if(result[0].password===pw){
            res.send(true);
        }else{
            res.send(false);
        }
    });
});

app.get('/login/toCustom',function(req,res){
    if(id==='user'){
        connection.query(`SELECT * FROM instaView_data`,( error,result,field )=>{
            if(error){console.log(error);}
            console.log(result);
            res.send(result);
        });
    }else{
        connection.query(`SELECT * FROM instaView_data WHERE id = '${id}'`,( error,result,field )=>{
            if(error){console.log(error);}
            console.log(result);
            res.send(result);
        });
    }
})

// instaView
app.get('/instaView/load', function(req,res){
    connection.query('SELECT * FROM instaView_data',( error,result,field )=>{
        if(error){console.log(error);}
        res.send(result);
    });
});

// custom
let customData;
app.post('/custom/data',(req,res)=>{
    try {
        customData = req.body;
        console.log("post");
        console.log(customData);
    } catch (e) {
        console.log(e)
    }
});

app.get('/custom/data',(req,res) =>{
    try {
        console.log(customData);
        console.log("get");
        if(id.length!=0 || typeof id != 'undefined'){
            res.send(customData)
        }
    } catch (e) {
        console.log(e);
    }
});

//logout
app.get('/logout',function(){
    id="";
})