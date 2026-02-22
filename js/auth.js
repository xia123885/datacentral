// 数据中心巡检系统 - 认证模块
class AuthSystem {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkPasswordStrength();
        this.setupDemoAccounts();
    }
    
    setupEventListeners() {
        // 登录表单提交
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // 注册表单提交
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
            
            // 密码强度检测
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.addEventListener('input', () => {
                    this.checkPasswordStrength();
                });
            }
            
            // 密码确认验证
            const confirmPasswordInput = document.getElementById('confirmPassword');
            if (confirmPasswordInput) {
                confirmPasswordInput.addEventListener('input', () => {
                    this.validatePasswordMatch();
                });
            }
        }
    }
    
    // 设置演示账户点击功能
    setupDemoAccounts() {
        const demoAccounts = document.querySelectorAll('.demo-account');
        demoAccounts.forEach(account => {
            account.addEventListener('click', () => {
                const username = account.dataset.username;
                const password = account.dataset.password;
                
                document.getElementById('username').value = username;
                document.getElementById('password').value = password;
                document.getElementById('remember').checked = true;
                
                this.showMessage(`已填充 ${username} 账户信息`, 'info');
                
                // 自动聚焦到登录按钮
                setTimeout(() => {
                    document.querySelector('#loginForm .btn').focus();
                }, 100);
            });
        });
    }
    
    // 密码强度检测
    checkPasswordStrength() {
        const password = document.getElementById('password');
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        if (!password || !strengthBar || !strengthText) return;
        
        const passwordValue = password.value;
        let strength = 0;
        
        // 长度检查
        if (passwordValue.length >= 8) strength += 25;
        if (passwordValue.length >= 12) strength += 25;
        
        // 复杂度检查
        if (/[A-Z]/.test(passwordValue)) strength += 25;
        if (/[0-9]/.test(passwordValue)) strength += 25;
        if (/[^A-Za-z0-9]/.test(passwordValue)) strength += 25;
        
        // 限制最大为100
        strength = Math.min(strength, 100);
        
        // 更新UI
        strengthBar.style.setProperty('--strength', `${strength}%`);
        
        // 设置颜色和文本
        let color, text;
        if (strength < 30) {
            color = '#ff5252';
            text = '弱';
        } else if (strength < 70) {
            color = '#FF9800';
            text = '中';
        } else {
            color = '#4CAF50';
            text = '强';
        }
        
        strengthBar.style.background = `linear-gradient(to right, ${color} ${strength}%, #e0e0e0 ${strength}%)`;
        strengthText.textContent = `密码强度：${text}`;
        strengthText.style.color = color;
    }
    
    // 验证密码匹配
    validatePasswordMatch() {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (!password || !confirmPassword) return;
        
        if (confirmPassword.value && password.value !== confirmPassword.value) {
            confirmPassword.style.borderColor = '#f44336';
            this.showMessage('两次输入的密码不一致', 'error');
            return false;
        } else {
            confirmPassword.style.borderColor = '#4CAF50';
            return true;
        }
    }
    
    // 处理登录
    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember')?.checked || false;
        
        // 验证输入
        if (!username || !password) {
            this.showMessage('请输入用户名和密码', 'error');
            return;
        }
        
        // 显示加载状态
        const submitBtn = document.querySelector('#loginForm .btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="spinner"></div> 登录中...';
        submitBtn.disabled = true;
        
        try {
            // 模拟API请求延迟
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // 演示账户验证
            const demoAccounts = {
                'admin': { 
                    password: 'password123', 
                    role: 'admin', 
                    name: '夏秀平',
                    email: 'admin@swpu.edu.cn',
                    phone: '13800138000'
                },
                'engineer': { 
                    password: 'password123', 
                    role: 'engineer', 
                    name: '陈睿曦',
                    email: 'engineer@swpu.edu.cn',
                    phone: '13900139000'
                },
                'viewer': { 
                    password: 'password123', 
                    role: 'viewer', 
                    name: '张馨',
                    email: 'viewer@swpu.edu.cn',
                    phone: '13700137000'
                }
            };
            
            if (demoAccounts[username] && demoAccounts[username].password === password) {
                // 登录成功
                const userData = {
                    username: username,
                    ...demoAccounts[username],
                    token: this.generateToken(),
                    loginTime: new Date().toISOString(),
                    lastLogin: this.getLastLoginTime(username)
                };
                
                // 保存用户数据
                localStorage.setItem('user', JSON.stringify(userData));
                
                // 更新登录历史
                this.updateLoginHistory(username);
                
                // 如果选择记住我，设置长期存储
                if (remember) {
                    localStorage.setItem('rememberMe', 'true');
                }
                
                this.showMessage(`登录成功，欢迎${userData.name}！`, 'success');
                
                // 跳转到主页
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1200);
            } else {
                // 尝试从本地注册用户中查找
                const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                const user = registeredUsers.find(u => 
                    u.username === username && u.password === password && u.status === 'active'
                );
                
                if (user) {
                    // 本地注册用户登录成功
                    const userData = {
                        ...user,
                        token: this.generateToken(),
                        loginTime: new Date().toISOString(),
                        lastLogin: this.getLastLoginTime(username)
                    };
                    
                    localStorage.setItem('user', JSON.stringify(userData));
                    this.updateLoginHistory(username);
                    
                    this.showMessage(`登录成功，欢迎${user.name}！`, 'success');
                    
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1200);
                } else {
                    throw new Error('用户名或密码错误');
                }
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
        } finally {
            // 恢复按钮状态
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    // 获取上次登录时间
    getLastLoginTime(username) {
        const loginHistory = JSON.parse(localStorage.getItem('loginHistory') || '{}');
        return loginHistory[username] || null;
    }
    
    // 更新登录历史
    updateLoginHistory(username) {
        const loginHistory = JSON.parse(localStorage.getItem('loginHistory') || '{}');
        loginHistory[username] = new Date().toISOString();
        localStorage.setItem('loginHistory', JSON.stringify(loginHistory));
    }
    
    // 处理注册
    async handleRegister() {
        // 验证表单
        if (!this.validateRegisterForm()) {
            return;
        }
        
        const formData = {
            fullname: document.getElementById('fullname').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value,
            role: document.getElementById('role').value,
            department: document.getElementById('department')?.value || '未分配部门'
        };
        
        // 显示加载状态
        const submitBtn = document.querySelector('#registerForm .btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="spinner"></div> 注册中...';
        submitBtn.disabled = true;
        
        try {
            // 模拟API请求延迟
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 检查用户名是否已存在
            const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            if (existingUsers.some(user => user.username === formData.username)) {
                throw new Error('用户名已存在');
            }
            
            // 检查邮箱是否已注册
            if (existingUsers.some(user => user.email === formData.email)) {
                throw new Error('邮箱已注册');
            }
            
            // 添加新用户
            const newUser = {
                ...formData,
                id: this.generateUserId(),
                createdAt: new Date().toISOString(),
                status: 'pending', // 新注册用户需要激活
                verified: false,
                avatar: this.generateAvatar(formData.fullname)
            };
            
            existingUsers.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
            
            this.showMessage('注册成功！请联系管理员激活账户', 'success');
            
            // 跳转到登录页面
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } catch (error) {
            this.showMessage(error.message, 'error');
        } finally {
            // 恢复按钮状态
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    // 生成用户头像
    generateAvatar(name) {
        const colors = [
            '#667eea', '#764ba2', '#f093fb', '#4facfe', 
            '#00f2fe', '#43e97b', '#38f9d7', '#fa709a'
        ];
        const color = colors[name.charCodeAt(0) % colors.length];
        return { 
            text: name.charAt(0).toUpperCase(),
            color: color
        };
    }
    
    // 验证注册表单
    validateRegisterForm() {
        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.getElementById('role').value;
        const agreeTerms = document.getElementById('agreeTerms')?.checked || false;
        
        // 基本验证
        if (!fullname) {
            this.showMessage('请输入姓名', 'error');
            return false;
        }
        
        if (!this.validateEmail(email)) {
            this.showMessage('请输入有效的邮箱地址', 'error');
            return false;
        }
        
        if (!this.validatePhone(phone)) {
            this.showMessage('请输入有效的手机号', 'error');
            return false;
        }
        
        if (username.length < 3) {
            this.showMessage('用户名至少3个字符', 'error');
            return false;
        }
        
        if (username.length > 20) {
            this.showMessage('用户名不能超过20个字符', 'error');
            return false;
        }
        
        if (password.length < 8) {
            this.showMessage('密码至少8个字符', 'error');
            return false;
        }
        
        if (password !== confirmPassword) {
            this.showMessage('两次输入的密码不一致', 'error');
            return false;
        }
        
        if (!role) {
            this.showMessage('请选择用户角色', 'error');
            return false;
        }
        
        if (!agreeTerms) {
            this.showMessage('请同意用户协议和隐私政策', 'error');
            return false;
        }
        
        return true;
    }
    
    // 验证邮箱格式
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // 验证手机号格式
    validatePhone(phone) {
        const re = /^1[3-9]\d{9}$/;
        return re.test(phone);
    }
    
    // 生成用户ID
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // 生成模拟Token
    generateToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 32; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }
    
    // 显示消息提示
    showMessage(text, type = 'info', duration = 3000) {
        // 移除现有消息
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 创建新消息
        const message = document.createElement('div');
        message.className = `message ${type}`;
        
        let icon = '';
        switch(type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            case 'info':
                icon = '<i class="fas fa-info-circle"></i>';
                break;
        }
        
        message.innerHTML = `${icon} <span>${text}</span>`;
        document.body.appendChild(message);
        
        // 自动移除
        setTimeout(() => {
            message.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, duration);
    }
    
    // 检查登录状态（供其他页面使用）
    static checkAuth() {
        const userData = localStorage.getItem('user');
        if (!userData) {
            // 未登录，跳转到登录页面
            window.location.href = 'login.html';
            return null;
        }
        
        try {
            return JSON.parse(userData);
        } catch (error) {
            // 数据解析失败，清除无效数据
            localStorage.removeItem('user');
            window.location.href = 'login.html';
            return null;
        }
    }
    
    // 登出
    static logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        window.location.href = 'login.html';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
});

// 全局辅助函数
window.AuthSystem = AuthSystem;