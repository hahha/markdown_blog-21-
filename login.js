document.getElementById('loginForm').addEventListener('submit', function(event) {  
    event.preventDefault(); // 阻止表单默认提交行为  
  
    var username = document.getElementById('username').value;  
    var password = document.getElementById('password').value;
  
    var xhr = new XMLHttpRequest();  
    xhr.open('POST', '/login', true); // true表示异步请求  
  
    xhr.setRequestHeader('Content-Type', 'application/json');  
  
  xhr.onreadystatechange = function() {  
    if (xhr.readyState === 4) { // 请求完成  
      try {  
        var data = JSON.parse(xhr.responseText); // 解析服务器返回的JSON  
        console.log(data);
        if (data.success) { // 请求成功  
          alert(data.message); // 显示登录成功的消息  
          // 可以根据返回的数据执行其他操作，如重定向  
          window.location.href = data.redirectUrl; // 重定向到主页  
        } else {  
          // 请求失败（密码不正确）  
          handleError(data.message);  
        }  
      } catch (e) {  
        // 解析JSON失败，可能是服务器返回的不是JSON  
        handleError('Failed to parse server response');  
      }  
    }  
  }; 
  
    var dataToSend = JSON.stringify({ username, password });  
    xhr.send(dataToSend);  
  
    // 错误处理函数  
    function handleError(error) {  
        console.error('Error logging in user:', error);  
        alert('Invalid username or password. Please try again.');  
    }  
});
