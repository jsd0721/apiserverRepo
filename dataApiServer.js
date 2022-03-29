const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const cookieParser = require('cookie-parser');
const https = require('https');
const fs = require('fs');
const port = process.env.PORT || 8443;

const app = express();

const server = https.createServer(app);


const https_options = {
    key : fs.readFileSync("./key/server.key"),
    cert : fs.readFileSync("./key/server.crt"),
    ca: fs.readFileSync("./key/server.csr")
}

const corsOptions = {
    origin: 'https://withdrone.tk',
    credentials : true
  };



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

app.use(cookieParser());
app.use(session({
    secret:'iwanttoquitmyjob',
    resave:false,
    saveUninitialized:false,
    store : new FileStore(),
    cookie:{
        key:'loginInfo',
        maxAge:60*60*1000,
        httpOnly:true,
        sameSite:'none',
        secure:true
    }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(cors(corsOptions));

// app.listen(3000,function(){
//     console.log(`server start, port : 3000`);
// });


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
//-----------------------------------지적도 api------------------------------------------------------------------
//login

app.get('/login/toCustom',function(req,res){
    const id = req.session.loginInfo.id;
    
    console.log(id);
    if(id_global==='user'){
        connection.query(`SELECT * FROM instaView_data`,( error,result,field )=>{
            if(error){console.log(error);}
            console.log(result);
            res.send(result);
        });
    }else{
        connection.query(`SELECT * FROM instaView_data WHERE id = 'jsd123'`,( error,result,field )=>{
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
        res.send(customData)
    } catch (e) {
        console.log(e);
    }
});

//logout
app.get('/logout',function(){
    id="";
})


//---------------------------------loginApi-------------------------

app.post("/join",(req,res)=>{

    const id = req.body.id;
    const password = req.body.password;
    
    connection.query(`INSERT INTO user_info(id,password)values('${id}','${password}');`,(err,rows,fields)=>{
        if(err){
            console.log(err);
            res.send("에러");
        }else{
            res.send('1');
        }
    });

});

//중복확인 api
app.post('/join/isidoverlap',(req,res)=>{
    connection.query(`SELECT * FROM user_info WHERE id = '${req.body.userID}'`,(err,rows,fields)=>{
        if(err){
            res.send(err);
        }else{
            if(rows[0] !== undefined){
                console.log(rows);
                res.send("1");
            }else{
                res.send("0");
            }
        }
    });

});

app.get('/',(req,res)=>{
    res.send('연결이 가능합니다.');
});

const afterSessionSaved = (req,res)=>{
    req.session.save(()=>{
        req.session.count += 1;
        res.send('userExist');
    });
}

app.post('/login',(req,res)=>{
    const id = req.body.id;
    id_global =id;
    const password = req.body.password;
    connection.query(`SELECT id,password FROM user_info WHERE id = '${id}' AND password = '${password}'`,(err,rows,field)=>{
        if(err)throw err;
        console.log(rows[0]);
        if(rows[0] !== undefined){
            if(req.session.loginInfo){
                afterSessionSaved(req,res);
            }else{
                req.session.loginInfo = {id : rows[0].id,password : rows[0].password};
                req.session.count = 0;
                afterSessionSaved(req,res);
            }
        }else{
            res.send("userNotExist");
        }
    });
});

app.get('/loginCheck',(req,res)=>{
    console.log(req.session);
    if(req.session.loginInfo){
        res.send({loggedIn : true, loginID : req.session.loginInfo.id});
    }else{
        res.send({loggedIn : false});
    }
});

https.createServer(https_options,app,(req,res)=>{
    res.send("hello");
}).listen(port,function(){
    console.log(port + "connected");
});
