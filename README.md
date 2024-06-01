# 云计算环境下的Blog开发实验报告

## 实验目的

通过简单的开发自己的博客系统，对云计算有一个基本概念，能利用开发环境实现简单的网页博客系统开发，并初步了解并学习了HTML、CSS和JavaScript的基础知识
## 实现的功能

1.博客系统中基本的增删改查

2.注册功能

3.登录功能

4.建立导航页面

5.渲染css文件，实现对blog页面的美化 
## 具体实现

### 基本增删查改功能

首先内联数据库，建立一个基本的文章表单
```js
const mongoose = require('mongoose');
mongoose.connect('mongodb://my-mongo/lsr1');
const articleSchema = new mongoose.Schema({
    title: String,
    description: String
});
const article = mongoose.model('article', articleSchema);
```
以增加为例具体讲解代码
```js
<form action="/new" method="POST">  
    <div>  
        <label for="title">Title</label>  
        <input required type="text" name="title" id="title">  
    </div>  
  
    <div>  
        <label for="description">Description</label>  
        <textarea name="description" id="description"></textarea>  
    </div>  
  
    <a href="/">Cancel</a>  
    <button type="submit">Save</button>  
</form>  
```
通过表单的形式，以POST方法来进行文章的新增，通过label来标识输入区域的性质，在标题区域用input实现单行输入，内容部分用textarea进行多文本输入
```js
app.post('/new', async (req,res) => {
    one = new article({ title: req.body.title, description: req.body.description });
    await one.save();
    res.render('display', { article: one })
})
```
当客户端发送POST请求到/new路径时这段代码会创建一个新的article对象，将其保存到数据库中，并渲染一个名为display的视图来显示这个新创建的article对象。
其他的删、查、改功能的实现与增加相似，这里就不再说明。
### 注册和登录功能
首先我们建立了用户表单，并在server.js中引用该表单
```js
 const UserSchema = new Schema({  
  username: { type: String, required: true, unique: true },  
  password: { type: String }, // select: false 表示在查询时默认不返回此字段  
  email: { type: String, required: true }, 
});  
```
接下来我们分别讲解注册和登录功能

#### 注册
```
app.get('/register', (req, res) => {  
    res.render('register'); // 渲染 register.ejs 文件  
});
//register.ejs
<form action="/register" method="POST" id="registerForm">  
        <label for="username">Username:</label>  
        <input type="text" id="username" name="username" required>  
  
        <label for="password">Password:</label>  
        <input type="password" id="password" name="password" required>  

        <label for="email">Email:</label>  
        <input type="text" id="email" name="email" required> 
  
        <button type="submit">Register</button>  
    </form>  
    <script src="../js/register.js"></script> 
```
利用表格形式接收用户输入的用户名、密码和邮箱信息
```js
//register.js
const username = document.getElementById('username').value;  
        const password = document.getElementById('password').value;  
        const email = document.getElementById('email').value;  
        try {  
            const response = await fetch('/register', {  
                method: 'POST',  
                headers: {  
                    'Content-Type': 'application/json'  
                },  
                body: JSON.stringify({ username, password ,email})  
            });  
```
存储用户输入信息后，使用fetch函数发起请求，将数据以JSON字符串发送到/register路由
```js
app.post('/register', async (req, res) => {  
   // try {  
        const { username, password,email } = req.body;  
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
           res.status(200).send({ status: 'success', message: '注册成功！' });  //检测是否存入成功
        } 
        else{
            console.log('New user created unsuccessfully:');
        }
       }
});
```
在register路由中检测该用户名和邮箱是否重复，如果未重复，则将数据存到用户数据库中，注册成功；否则显示错误。
```js
const saltRounds = 10;
UserSchema.pre('save', async function(next) {    
      this.password = await bcrypt.hash(this.password, saltRounds);  
      console.log('Hashed password:', this.password);  
  next();  
});  
```
在存入密码前使用哈希函数处理密码

#### 登录

登录功能的实现与注册功能类似，这里不再赘述。特别的，登录时需要对存储的哈希处理过的密码和用户输入的密码进行比对，在这里我们用到了bcrypt库中的compare函数
```js
UserSchema.methods.comparePassword = async function(candidatePassword, hashedPassword) {  
  try {  
    // 直接比较候选密码和传入的哈希密码  
    return await bcrypt.compare(candidatePassword, hashedPassword);  
  } catch (error) {  
    // 处理错误，例如返回 false 或抛出异常  
    console.error('Error comparing passwords:', error);  
    return false;  
  }  
};
```
如果密码正确，进入首页，否则显示错误。
```js
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
```
### 建立页面导航
```js
<div class="welcome-container">  
  <div class="welcome-header">Welcome to the blessed world of Heaven.</div>  
  <a href="/login" class="welcome-link">Click here to login!</a>  
  <a href="/register" class="welcome-link">Click here to register!</a>  
</div>  
```
我们在进入博客系统登陆注册页面前加入了一个页面导航，利用超链接元素来进入登录和注册页面。

### 利用CSS美化页面

在页面设计上，我的灵感其实来源于一本我很喜欢的书，叫《天官赐福》。所以我们选取的页面背景是这本书对应漫画的图片。为了和这张图片敦煌风格相匹配，我们设置了文本框的格式、背景色、字体、按钮等。
```css
<style>  
   body {  
      background-image: url('/pic3.jpg');  
      background-size: cover;  
      background-position: center;  
      background-repeat: no-repeat;  
      min-height: 100vh;  
      margin: 0;  
      padding: 0;  
      color: #333; /* 基础文本颜色，与背景形成对比 */  
      font-family: 'SimHei', 'FangSong', serif; /* 使用中文传统字体 */  
    }  
  
    .container {  
      max-width: 800px;  
      margin: 20px auto;  
      background-color: rgba(255, 255, 255, 0.8);  
      padding: 20px;  
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);  
      border-radius: 10px;  
    }  
  
    h1 {  
      color: #FF9933;  
      text-align: center;  
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);  
    }  
  
    h2 {  
      color: #FFCC66;  
      text-align: left;  
      font-size: 1.2em;  
    }  
  
    a {  
      color: #FF6633;  
      text-decoration: none;  
      border-bottom: 2px solid #FF6633;  
      transition: all 0.3s ease;  
    }  
  
    a:hover {  
      color: #FFCC66;  
      border-bottom-color: #FFCC66;  
    }  
  
    .article-list {  
      list-style-type: none;  
      padding: 0;  
    }  
  
    .article-list li {  
      margin-bottom: 20px;  
    }  
  
    .article-title {  
      font-size: 1.2em;  
      font-weight: bold;  
    }  
  
    .article-description {  
      font-size: 0.9em;  
      color: #666;  
    }    
    .article-actions {  
      display: flex;  
      justify-content: space-between;  
      align-items: center;  
    }  
  
    .article-actions button {  
      margin-left: 10px; /* 设置按钮之间的间距 */  
    }  
  
    .article-actions button:first-child {  
      margin-left: 0; /* 第一个按钮不需要左边距 */  
    }  
  </style>  
```
## 实验结果

通过以上步骤，我们基本实现了一个 美观且基本功能齐全的博客。

## 实验不足

没有把article加入到用户数据库中，与现实中的博客系统仍有差距。


| 工作量统计表 | 基础功能 | 新增功能1 | 新增功能2 | 新增功能3 | 新增功能4 | 新增功能5 | 新增功能6 | 新增功能7 | 
| --- | --- | --- | --- | --- | --- | --- | --- | --- | 
| 描述  | 对博客系统中博文的增删改查操作 | 原博客系统CSS美化 | 目录结构优化 | 页面导航设计 | 登录页面的制作 | 注册页面的制作 | 登录功能和注册功能的实现 | 用户信息加密 |
| 学时  | 8   | 3   | 3   | 2   | 3   |4   | 10  | 3 |
