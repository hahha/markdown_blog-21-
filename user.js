const mongoose = require('mongoose');  
const { Schema } = mongoose;  
const bcrypt = require('bcrypt');  
  
const saltRounds = 10; // 它决定了计算哈希所需的复杂度  
  
const UserSchema = new Schema({  
  username: { type: String, required: true, unique: true },  
  password: { type: String }, // select: false 表示在查询时默认不返回此字段  
  email: { type: String, required: true }, 
});  
  
// 预处理钩子：在保存之前自动哈希密码  
UserSchema.pre('save', async function(next) {    
      this.password = await bcrypt.hash(this.password, saltRounds);  
      console.log('Hashed password:', this.password);  
  next();  
});  
  
// 比较密码的函数  
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
  
module.exports = mongoose.model('User', UserSchema);
