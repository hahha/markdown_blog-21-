document.addEventListener('DOMContentLoaded', function() {  
    var form = document.getElementById('registerForm');  
      
    form.addEventListener('submit', async function(event) {  
        event.preventDefault(); // 阻止表单默认提交行为  
  
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
  
            if (!response.ok) {  
                throw new Error('Failed to register user');  
            }  
  
            alert('User registered successfully!');  
            // 可以重定向到登录页面或其他页面  
            // 例如: window.location.href = '/login';  
        } catch (error) {  
            console.error('Error registering user:', error);  
            alert('Error registering user. Please try again.');  
        }  
    });  
});
