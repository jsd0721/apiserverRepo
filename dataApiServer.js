const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const cookieParser = require('cookie-parser');
const nodeMMailer = require('nodemailer');
const crypto = require('crypto');
const ejs = require('ejs');
const path = require('path');

const app = express();

const corsOptions = {
	origin: ['https://withdrone.tk',"https://172.30.1.6","https://175.215.182.104",'https://withdrone.co.kr',"http://127.0.0.1:5500"],
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

app.use(express.static(path.join(__dirname, '../public')));

app.use(cookieParser());
app.use(session({
    secret:'iwanttoquitmyjob',
    resave:false,
    proxy:true,
    saveUninitialized:false,
    store : new FileStore(),
    cookie:{
        key:'loginInfo',
        maxAge:60*60*1000,
        httpOnly:true,
        sameSite:'none',
        secure:true,
        rolling : true
    }
}));
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cors(corsOptions));

const port_http = 3000;
 app.listen(port_http,function(){
     console.log(`server start, port : ${port_http}`);
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

//---------------------------------loginApi-------------------------
const hashingPassword = (password,salt)=>{
    const hashedPW = crypto.createHash('sha256').update(password+salt).digest("hex");
    return hashedPW;
}

function getRandomArbitrary(min, max) {
    const num = Math.floor(Math.random() * (max - min) + min);
    return num;
  }

const smtptransport = nodeMMailer.createTransport({
    service:"Gmail",
    host:"smtp.gmail.com",
    port:587,
    auth:{
        user:"noreply4435@gmail.com",
        pass:"oxycthbubozvqspj"
    },
    tls:{
        rejectUnauthorized:false
    }
});



app.post("/join/emailcheck",(req,res)=>{
    let templete;
    const randNum = getRandomArbitrary(111111,999999);//api 호출마다 계속 새로 생성됨->어떻게 해결해야될까
    // console.log(`클라이언트에서 보낸 번호 : ${req.body.authNum}`);
    // console.log(`생성한 번호 : ${randNum}`);
    connection.query(`SELECT email FROM user_info WHERE email = '${req.body.email}'`,(err,rows,field)=>{
        if(err){
            console.log(err);
        }
        if(rows[0] !== undefined){
            res.json({
                log:"email already exist",
                code : 0,
            });
        }else{
            ejs.renderFile("./emailAuth.ejs",{authNum:randNum},(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    templete = data;
                }
            })
            const mailOptions = {
                from:"noreply4435@gmail.com",
                // to:"whtjdehd12@naver.com",
                to:`${req.body.email}`,
                subject:"이메일 인증",
                html : templete,
            };
            
            smtptransport.sendMail(mailOptions,(err,info)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log(`${req.body.email}으로 메일 보냄`);
                    res.json({
                        log : "email send success",
                        code : 1,
                        authNum : randNum
                    });
                }
            });
        }
    });
});

app.post("/join",(req,res)=>{

    const id = req.body.id;
    const password = req.body.password;
    const email = req.body.email;
    const name = req.body.name;
    const position = req.body.position;
    const region = req.body.region;

    const saltValue = crypto.randomBytes(35).toString('base64');
    const hashedPW = hashingPassword(password,saltValue);
    
    connection.query(`INSERT INTO user_info(id,password,email,name,position,region,saltValue)
        values('${id}','${hashedPW}','${email}','${name}','${position}','${region}','${saltValue}');`,(err,rows,fields)=>{
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
    if(req.body.userID === ""){
        res.send("2");
    }else{
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
    }
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
    const password = req.body.password;

    connection.query(`SELECT id,password,name,position,saltValue FROM user_info WHERE id = '${id}';`,(err,rows,field)=>{
        if(err)throw err;
        if(rows[0] !== undefined){
            const hashedPassword = hashingPassword(password,rows[0].saltValue);
            if(rows[0].password === hashedPassword){
                if(req.session.loginInfo){
                    afterSessionSaved(req,res);
                }else{
                    req.session.loginInfo = {
                        ID : rows[0].id,
                        position : rows[0].position,
                        name : rows[0].name
                    };
                    req.session.count = 0;
                    afterSessionSaved(req,res);
                }
            }else{
                res.send("userNotExist");
            }            
        }else{
            res.send("userNotExist");
        }
    });
});

app.get('/loginCheck',(req,res)=>{
    console.log(req.session.loginInfo);
    if(req.session.loginInfo){
        res.send({loggedIn : true, loginID : req.session.loginInfo.id});
    }else{
        res.send({loggedIn : false});
    }
});


//-----------------------------------지적도 api------------------------------------------------------------------
//login

app.post('/data/inquire',function(req,res){

    console.log(req.session);
    const id = req.session.loginInfo.ID;
    const dataSet = req.body.name;

    if(id==='admin'){
        //원하는 데이터 셋이 없을 때 테이블의 전체 데이터 responce
        if(dataSet === null || dataSet === undefined){
            connection.query(`SELECT * FROM instaView_data`,( error,result,field )=>{
                if(error){console.log(error);}
                for(data in result){console.log(data.name);}
                res.send(result);
            });
        }else{
            //dataset의 이름을 받았을때는 그 데이터셋을 보내줌
            connection.query(`SELECT * FROM instaView_data WHERE num = ${dataSet}`,(err,result,field)=>{
                if(err){console.log(err)}
                console.log(result);
                req.session.nowContent = dataSet;
                res.send(result);
            });
        }
    }else if(id==='test'){
         //원하는 데이터 셋이 없을 때 테이블의 전체 데이터 responce
         if(dataSet === null || dataSet === undefined){
            connection.query(`SELECT * FROM instaView_data WHERE id='${id}'`,( error,result,field )=>{
                if(error){console.log(error);}
                for(data in result){console.log(data.name);}
                res.send(result);
            });
        }else{
            //dataset의 이름을 받았을때는 그 데이터셋을 보내줌
            connection.query(`SELECT * FROM instaView_data WHERE num = ${dataSet}`,(err,result,field)=>{
                if(err){console.log(err)}
                console.log(result);
                req.session.nowContent = dataSet;
                res.send(result);
            });
        }
    }else{
        //원하는 데이터 셋이 없을 때 그 유저의 전체 데이터 responce
        if(dataSet === null || dataSet === undefined){
            connection.query(`SELECT * FROM instaView_data WHERE id = '${id}'`,( error,result,field )=>{
                if(error){console.log(error);}
                for(data in result){console.log(result[data].name);}
                res.send(result);
            });
        //데이터셋의 이름을 request 했다면 그 데이터셋을 responce
        }else{
            connection.query(`SELECT * FROM instaView_data WHERE id = '${id}' AND num = ${dataSet}`,(err,result,field)=>{
                if(err){console.log(err)}
                req.session.nowContent = dataSet;
                res.send(result);
            });
        }
    }
})

// custom / favorite 
app.post('/data/favorite/modify',function(req,res){
    const id = req.session.loginInfo.id;
    const name = req.body.name;
    const favorite = req.body.favorite;
    connection.query(`UPDATE instaView_data SET favorite='${favorite}' WHERE id = '${id}' AND name = '${name}'`);
})

//logout
app.post('/user/logout',(req,res)=>{
    if(req.session.loginInfo){
        req.session.destroy();
        res.send('success');
    }else{
        res.send('No users are logged in');
    }
    
})
