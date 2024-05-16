const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');  

const mongoose = require('mongoose');
mongoose.connect('mongodb://my-mongo/lsr1');

//文章表单
const articleSchema = new mongoose.Schema({
    title: String,
    description: String
});
const article = mongoose.model('article', articleSchema);
// 

const User = require('./User');  
//用户表单

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.use(bodyParser.urlencoded({ extended: true })); // 用于解析application/x-www-form-urlencoded数据    
app.use(express.json());
app.use(express.static('public'));
app.use(session({  
  secret: 'your secret key', // 替换为你的密钥  
  resave: false,  
  saveUninitialized: true,  
  cookie: { maxAge: 60000 } // 设置session的过期时间，这里为1分钟  
}));  


app.get('/login', (req, res) => {  
    res.render('login'); // 渲染 login.ejs 文件  
});  

app.get('/', async (req, res) => { 
  const articles = await article.find();  
  res.render('all', { articles: articles });  
});  

//登录路由
app.post('/login', async (req, res) => {  
  //try {  
    const { username, password } = req.body;  
    console.log('Received login request:', req.body); // 添加日志语句  
    // 从数据库中查找用户  
    const user = await User.findOne({ username : req.body.username });  
    if (!user) {  
      // 用户不存在，返回错误响应  
      console.log('User does not exist, redirecting to register');
       res.status(400).send('Invalid credentials.Please Register!');  
    }
    else { 
    // 验证密码 
    console.log('EXIST!');
    const isMatch = await user.comparePassword(req.body.password, user.password);  
    if (isMatch) {  
    // 验证成功，返回JSON响应  
       const user = { username,password };  
       res.setHeader('Content-Type', 'application/json'); 
       console.log('The password is right!');  
    // 假设您有一个用户对象 user，这里我们只返回一个简单的消息  
       res.json({ success: true, message: '登录成功！', redirectUrl: '/' });  
    } else {  
    // 密码不正确，返回错误响应  
      console.log('The password is not right!');  
      res.status(401).json({ success: false, message: '密码不正确' });  
}  
  }
  //} catch (err) {  
    // 数据库查询或其他异步操作中的错误  
    //res.status(500).send('数据库查询或其他异步操作中的错误/Error logging in user: ' + err);  
  //}  
});

  
app.get('/register', (req, res) => {  
    res.render('register'); // 渲染 register.ejs 文件  
});

//注册路由
app.post('/register', async (req, res) => {  
   // try {  
        const { username, password,email } = req.body;  
        //console.log("用户名已存在，返回错误");
        console.log('Received register request:', req.body); // 添加日志语句  
        // 检查用户名是否已存在  
        const existingUser = await User.findOne({ username });  
        if (existingUser) {  
            console.log('用户名已存在，返回错误'); 
            res.status(401).send('用户名已存在，返回错误/Invalid username or password');  
        }  
        else{
        // 用户名不存在，可以安全地保存新用户  
        const newUser = new User({ username, password ,email });  
        console.log('New user created:', newUser);
        await newUser.save();  
        const existingUser2 = await User.findOne({ username }); 
        if (existingUser2) {  
            // 用户名已存在 
           console.log('New user created successfully:', newUser);
           res.status(200).send({ status: 'success', message: '注册成功！' });  
        } 
        else{
            console.log('New user created unsuccessfully:');
        }
       }
    //} //catch (err) {  
        // 处理任何在保存过程中出现的错误  
        //res.status(500).send('Error registering user: ' + err);  
    //}  
});  

// 将scene1.html移动到一个新的路径，比如'/scene1'  
app.get('/html/scene1', (req, res) => {    
    res.sendFile(path.join(__dirname, 'public', 'scene1.html'));    
});  
  
// 根路径'/'现在只负责渲染包含文章列表的视图  


app.get('/new', (req, res) => {
  res.render('new');
})


app.get('/edit/:id', async (req, res) => {
    const one = await article.findOne({ _id: req.params.id });
    res.render('edit', { article: one })
})

app.use(express.urlencoded({ extended: false }))

app.post('/new', async (req,res) => {
    one = new article({ title: req.body.title, description: req.body.description });
    await one.save();
    res.render('display', { article: one })
})

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

app.delete('/:id', async (req, res) => {
  await article.deleteMany({ _id: req.params.id });
  res.redirect('/')
})

app.put('/:id', async (req, res) => {
    let data = {}
    data.title = req.body.title
    data.description = req.body.description

    var one = await article.findOne({ _id: req.params.id });
    if (one != null) {
        one.title = data.title;
        one.description = data.description;
        await one.save();       
    }  
    res.render('display', { article: data })
})

app.listen(12321)
