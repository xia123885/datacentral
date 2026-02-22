// 数据中心巡检系统 - 主页面逻辑
class InspectionMainSystem {
    constructor() {
        this.rooms = [
            { id: 'room-1', name: '明理楼8210', type: '机房', status: 'unchecked', location: '明理楼8楼', lastInspection: null },
            { id: 'room-2', name: '明理楼8211', type: '机房', status: 'unchecked', location: '明理楼8楼', lastInspection: null },
            { id: 'room-3', name: '明理楼8108', type: '机房', status: 'unchecked', location: '明理楼8楼', lastInspection: null },
            { id: 'room-4', name: '明理楼8112', type: 'UPS机房', status: 'unchecked', location: '明理楼8楼', lastInspection: null },
            { id: 'room-5', name: '明理楼8110', type: 'UPS机房', status: 'unchecked', location: '明理楼8楼', lastInspection: null }
        ];
        
        this.inspectionHistory = {};
        this.currentUser = null;
        this.init();
    }
    
    init() {
        // 检查登录状态
        this.currentUser = this.checkAuth();
        if (!this.currentUser) return;
        
        // 每日重置检查
        this.checkDailyReset();
        
        this.loadFromStorage();
        this.renderUserInfo();
        this.renderRooms();
        this.renderStats();
        this.renderRecentActivities();
        this.setupEventListeners();
        this.setupDashboard();
    }
    
    // 每日重置检查 - 每天早上6点重置所有机房状态
    checkDailyReset() {
        const now = new Date();
        const today = now.toDateString();
        const resetTime = localStorage.getItem('dailyResetDate');
        
        // 如果今天还没有重置过，或者上次重置不是今天
        if (!resetTime || resetTime !== today) {
            // 检查是否到了重置时间（每天6:00 AM）
            const resetHour = 6; // 早上6点重置
            if (now.getHours() >= resetHour) {
                this.resetDailyStatus();
                localStorage.setItem('dailyResetDate', today);
                console.log(`每日巡检状态已重置 - ${today}`);
            }
        }
    }
    
    // 重置每日巡检状态
    resetDailyStatus() {
        // 保存今日之前的历史记录
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 获取昨天的历史记录
        const yesterdayHistory = {};
        for (const roomId in this.inspectionHistory) {
            if (this.inspectionHistory[roomId]) {
                const yesterdayRecords = this.inspectionHistory[roomId].filter(record => {
                    const recordDate = new Date(record.timestamp);
                    return recordDate < today;
                });
                if (yesterdayRecords.length > 0) {
                    yesterdayHistory[roomId] = yesterdayRecords;
                }
            }
        }
        
        // 只保留今天的历史记录
        const todayHistory = {};
        for (const roomId in this.inspectionHistory) {
            if (this.inspectionHistory[roomId]) {
                const todayRecords = this.inspectionHistory[roomId].filter(record => {
                    const recordDate = new Date(record.timestamp);
                    return recordDate >= today;
                });
                if (todayRecords.length > 0) {
                    todayHistory[roomId] = todayRecords;
                }
            }
        }
        
        // 重置所有机房状态为未检查
        this.rooms.forEach(room => {
            room.status = 'unchecked';
            room.lastInspection = null;
        });
        
        // 更新历史记录（只保留今天之前的记录到昨日历史）
        this.inspectionHistory = todayHistory;
        
        // 保存昨日历史到单独存储
        localStorage.setItem('yesterdayInspectionHistory', JSON.stringify(yesterdayHistory));
        
        // 保存重置后的状态
        this.saveToStorage();
        
        // 显示重置提示
        if (this.currentUser && this.currentUser.role === 'admin') {
            setTimeout(() => {
                this.showNotification('每日巡检状态已重置，所有机房状态恢复为"未检查"', 'info');
            }, 1000);
        }
    }
    
    // 检查认证状态
    checkAuth() {
        const userData = localStorage.getItem('user');
        if (!userData) {
            // 未登录，跳转到登录页面
            window.location.href = 'login.html';
            return null;
        }
        
        try {
            const user = JSON.parse(userData);
            
            // 检查用户是否已激活
            if (user.status === 'pending') {
                alert('您的账户正在等待管理员审核，请稍后再试。');
                window.location.href = 'login.html';
                return null;
            }
            
            if (user.status === 'inactive') {
                alert('您的账户已被停用，请联系管理员。');
                window.location.href = 'login.html';
                return null;
            }
            
            return user;
        } catch (error) {
            // 数据解析失败，清除无效数据
            localStorage.removeItem('user');
            window.location.href = 'login.html';
            return null;
        }
    }
    
    // 渲染用户信息
    renderUserInfo() {
        const userInfo = document.querySelector('.user-info');
        if (userInfo && this.currentUser) {
            // 更新用户头像
            const userAvatar = userInfo.querySelector('.user-avatar');
            if (userAvatar) {
                userAvatar.textContent = this.currentUser.name?.charAt(0) || 'U';
                
                // 如果有自定义头像颜色，应用它
                if (this.currentUser.avatar && this.currentUser.avatar.color) {
                    userAvatar.style.background = this.currentUser.avatar.color;
                } else {
                    userAvatar.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                }
            }
            
            // 更新用户名称
            const userName = userInfo.querySelector('.user-name');
            if (userName) {
                userName.textContent = this.currentUser.name || this.currentUser.username;
                
                // 添加部门信息
                if (this.currentUser.department) {
                    userName.textContent += ` (${this.currentUser.department})`;
                }
            }
            
            // 更新用户角色
            const userRole = userInfo.querySelector('.user-role');
            if (userRole) {
                const roleNames = {
                    'admin': '管理员',
                    'engineer': '巡检工程师',
                    'viewer': '查看者'
                };
                userRole.textContent = roleNames[this.currentUser.role] || this.currentUser.role;
            }
            
            // 更新工号信息
            const employeeId = this.currentUser.employeeId || this.currentUser.studentId;
            if (employeeId) {
                const userDetails = userInfo.querySelector('.user-details');
                if (userDetails && !userDetails.querySelector('.employee-id')) {
                    const employeeEl = document.createElement('div');
                    employeeEl.className = 'employee-id';
                    employeeEl.style.fontSize = '12px';
                    employeeEl.style.color = '#888';
                    employeeEl.textContent = `工号: ${employeeId}`;
                    userDetails.appendChild(employeeEl);
                }
            }
        }
    }
    
    loadFromStorage() {
        const savedHistory = localStorage.getItem('inspectionHistory');
        const savedRooms = localStorage.getItem('rooms');
        
        if (savedHistory) {
            try {
                this.inspectionHistory = JSON.parse(savedHistory);
            } catch (e) {
                this.inspectionHistory = {};
            }
        }
        
        if (savedRooms) {
            try {
                const saved = JSON.parse(savedRooms);
                // 只更新状态，保留其他属性
                this.rooms.forEach(room => {
                    const savedRoom = saved.find(r => r.id === room.id);
                    if (savedRoom) {
                        room.status = savedRoom.status;
                        room.lastInspection = savedRoom.lastInspection;
                    }
                });
            } catch (e) {
                // 解析失败，使用默认数据
            }
        }
    }
    
    saveToStorage() {
        localStorage.setItem('inspectionHistory', JSON.stringify(this.inspectionHistory));
        localStorage.setItem('rooms', JSON.stringify(this.rooms));
    }
    
    renderRooms() {
        const roomList = document.getElementById('room-list');
        const upsRoomList = document.getElementById('ups-room-list');
        
        if (!roomList || !upsRoomList) return;
        
        roomList.innerHTML = '';
        upsRoomList.innerHTML = '';
        
        // 计算今天的巡检完成情况
        const today = new Date().toDateString();
        const todayInspections = {};
        
        for (const roomId in this.inspectionHistory) {
            if (this.inspectionHistory[roomId]) {
                const todayRecords = this.inspectionHistory[roomId].filter(record => 
                    new Date(record.timestamp).toDateString() === today
                );
                if (todayRecords.length > 0) {
                    todayInspections[roomId] = todayRecords[todayRecords.length - 1]; // 取最新的记录
                }
            }
        }
        
        this.rooms.forEach(room => {
            const todayRecord = todayInspections[room.id];
            let statusText, statusClass;
            
            if (todayRecord) {
                statusText = this.getStatusText(todayRecord.status);
                statusClass = this.getStatusClass(todayRecord.status);
            } else {
                statusText = '未检查';
                statusClass = 'status-unchecked';
            }
            
            const lastInspection = room.lastInspection ? 
                new Date(room.lastInspection).toLocaleDateString('zh-CN') : '从未检查';
            
            const roomElement = document.createElement('a');
            roomElement.href = `detail.html?roomId=${room.id}`;
            roomElement.className = 'location-item';
            roomElement.dataset.id = room.id;
            
            roomElement.innerHTML = `
                <div class="location-header">
                    <i class="fas ${room.type === 'UPS机房' ? 'fa-car-battery' : 'fa-server'}"></i>
                    <div class="location-name">${room.name}</div>
                </div>
                <div class="location-details">
                    <div class="status-badge ${statusClass}">${statusText}</div>
                    <div class="location-meta">
                        <span class="meta-item"><i class="far fa-calendar"></i> ${lastInspection}</span>
                        <span class="meta-item"><i class="fas fa-map-marker-alt"></i> ${room.location}</span>
                    </div>
                    ${todayRecord ? 
                        `<div class="inspection-time">
                            <i class="far fa-clock"></i> ${new Date(todayRecord.timestamp).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})}
                        </div>` : ''
                    }
                </div>
            `;
            
            if (room.type === '机房') {
                roomList.appendChild(roomElement);
            } else {
                upsRoomList.appendChild(roomElement);
            }
        });
    }
    
    renderStats() {
        const totalRooms = this.rooms.length;
        
        // 计算今天的巡检状态
        const today = new Date().toDateString();
        let uncheckedRooms = 0;
        let normalRooms = 0;
        let warningRooms = 0;
        let errorRooms = 0;
        
        for (const room of this.rooms) {
            const roomId = room.id;
            const todayRecords = this.inspectionHistory[roomId]?.filter(record => 
                new Date(record.timestamp).toDateString() === today
            ) || [];
            
            if (todayRecords.length === 0) {
                uncheckedRooms++;
            } else {
                const latestRecord = todayRecords[todayRecords.length - 1];
                if (latestRecord.status === 'normal') normalRooms++;
                else if (latestRecord.status === 'warning') warningRooms++;
                else if (latestRecord.status === 'error') errorRooms++;
            }
        }
        
        const problemRooms = warningRooms + errorRooms;
        const todayInspections = totalRooms - uncheckedRooms;
        
        // 更新统计数字
        document.getElementById('total-rooms').textContent = totalRooms;
        document.getElementById('unchecked-rooms').textContent = uncheckedRooms;
        document.getElementById('normal-rooms').textContent = normalRooms;
        document.getElementById('problem-rooms').textContent = problemRooms;
        
        // 添加今日巡检统计
        const todayStat = document.getElementById('today-inspections') || 
            document.querySelector('.stat-item:nth-child(5)');
        if (todayStat) {
            todayStat.querySelector('.stat-value').textContent = todayInspections;
        }
        
        // 更新进度条
        this.updateProgressBar(todayInspections, totalRooms);
    }
    
    updateProgressBar(completed, total) {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
            progressBar.style.width = `${percentage}%`;
            
            const progressText = progressBar.parentElement.querySelector('.progress-text');
            if (progressText) {
                progressText.textContent = `${completed}/${total} (${percentage}%)`;
            }
        }
    }
    
    renderRecentActivities() {
        const activitiesContainer = document.getElementById('recent-activities');
        if (!activitiesContainer) return;
        
        activitiesContainer.innerHTML = '';
        
        // 收集今天的所有巡检记录
        const today = new Date().toDateString();
        let todayActivities = [];
        
        for (const roomId in this.inspectionHistory) {
            if (this.inspectionHistory[roomId]) {
                this.inspectionHistory[roomId].forEach(record => {
                    if (new Date(record.timestamp).toDateString() === today) {
                        todayActivities.push({
                            roomId,
                            roomName: this.getRoomNameById(roomId),
                            ...record
                        });
                    }
                });
            }
        }
        
        // 按时间排序，最新的在前面
        todayActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // 只显示最近的5条
        const recentActivities = todayActivities.slice(0, 5);
        
        if (recentActivities.length === 0) {
            activitiesContainer.innerHTML = `
                <li class="activity-item">
                    <div class="activity-icon empty">
                        <i class="far fa-calendar"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-title">今日暂无巡检记录</div>
                        <div class="activity-desc">开始今天的巡检工作吧！</div>
                    </div>
                </li>
            `;
            return;
        }
        
        recentActivities.forEach(activity => {
            const activityItem = document.createElement('li');
            activityItem.className = 'activity-item';
            
            let iconClass = 'inspection';
            let icon = 'fa-clipboard-check';
            
            if (activity.status === 'warning') {
                iconClass = 'alert';
                icon = 'fa-exclamation-triangle';
            } else if (activity.status === 'error') {
                iconClass = 'alert';
                icon = 'fa-times-circle';
            }
            
            const timeStr = new Date(activity.timestamp).toLocaleString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            activityItem.innerHTML = `
                <div class="activity-icon ${iconClass}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-title">${activity.roomName} - ${this.getStatusText(activity.status)}</div>
                    <div class="activity-desc">${activity.inspector || '系统'}</div>
                    <div class="activity-time">${timeStr}</div>
                </div>
            `;
            
            // 点击跳转到对应机房详情
            activityItem.style.cursor = 'pointer';
            activityItem.addEventListener('click', () => {
                window.location.href = `detail.html?roomId=${activity.roomId}`;
            });
            
            activitiesContainer.appendChild(activityItem);
        });
    }
    
    getStatusText(status) {
        switch(status) {
            case 'unchecked': return '未检查';
            case 'normal': return '正常';
            case 'warning': return '警告';
            case 'error': return '异常';
            default: return '未知';
        }
    }
    
    getStatusClass(status) {
        switch(status) {
            case 'unchecked': return 'status-unchecked';
            case 'normal': return 'status-normal';
            case 'warning': return 'status-warning';
            case 'error': return 'status-error';
            default: return 'status-unchecked';
        }
    }
    
    getRoomNameById(roomId) {
        const room = this.rooms.find(r => r.id === roomId);
        return room ? room.name : '未知机房';
    }
    
    setupEventListeners() {
        // 登出按钮
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        // 手动重置今日状态按钮（仅管理员可见）
        const resetTodayBtn = document.getElementById('reset-today-btn');
        if (resetTodayBtn) {
            resetTodayBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('确定要手动重置今日巡检状态吗？这将把所有机房状态恢复为"未检查"，但不会删除今日的巡检记录。')) {
                    this.resetDailyStatus();
                    this.renderRooms();
                    this.renderStats();
                    this.showNotification('今日巡检状态已手动重置', 'success');
                }
            });
        }
        
        // 查看全部记录按钮
        const viewAllBtn = document.querySelector('a[href="detail.html?view=all"]');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'detail.html?view=all';
            });
        }
        
        // 设备项点击事件
        document.querySelectorAll('.device-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const deviceName = item.textContent.trim();
                this.showDeviceInfo(deviceName);
            });
        });
        
        // 管理页面项点击事件
        document.querySelectorAll('.management-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const pageName = item.textContent.trim();
                this.openManagementPage(pageName);
            });
        });
        
        // 定期更新数据（每分钟检查一次）
        setInterval(() => {
            this.updateData();
        }, 60000);
        
        // 检查重置时间（每小时检查一次）
        setInterval(() => {
            this.checkDailyReset();
        }, 3600000);
    }
    
    setupDashboard() {
        // 添加欢迎消息
        this.showWelcomeMessage();
        
        // 检查今日巡检提醒
        this.checkTodayInspections();
        
        // 初始化图表（如果有）
        this.initCharts();
    }
    
    showWelcomeMessage() {
        const welcomeTime = this.getGreetingTime();
        const userName = this.currentUser.name || this.currentUser.username;
        
        // 显示欢迎消息
        const now = new Date();
        const todayStr = now.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        setTimeout(() => {
            this.showNotification(`${welcomeTime}，${userName}！今天是${todayStr}，请完成今日的巡检任务。`, 'info', 5000);
        }, 1500);
    }
    
    getGreetingTime() {
        const hour = new Date().getHours();
        if (hour < 6) return '夜深了';
        if (hour < 9) return '早上好';
        if (hour < 12) return '上午好';
        if (hour < 14) return '中午好';
        if (hour < 18) return '下午好';
        if (hour < 22) return '晚上好';
        return '夜深了';
    }
    
    checkTodayInspections() {
        // 计算今天未检查的机房数量
        const today = new Date().toDateString();
        let uncheckedCount = 0;
        
        for (const room of this.rooms) {
            const roomId = room.id;
            const todayRecords = this.inspectionHistory[roomId]?.filter(record => 
                new Date(record.timestamp).toDateString() === today
            ) || [];
            
            if (todayRecords.length === 0) {
                uncheckedCount++;
            }
        }
        
        // 如果是巡检工程师且有未检查的机房，显示提醒
        if (uncheckedCount > 0 && this.currentUser.role === 'engineer') {
            setTimeout(() => {
                this.showNotification(`您今天还有${uncheckedCount}个机房需要巡检`, 'warning');
            }, 3000);
        }
    }
    
    initCharts() {
        // 如果有图表库，可以在这里初始化
        // 例如：Chart.js, ECharts等
    }
    
    updateData() {
        this.loadFromStorage();
        this.renderRooms();
        this.renderStats();
        this.renderRecentActivities();
    }
    
    logout() {
        if (confirm('确定要退出登录吗？')) {
            localStorage.removeItem('user');
            localStorage.removeItem('rememberMe');
            window.location.href = 'login.html';
        }
    }
    
    showDeviceInfo(deviceName) {
        this.showNotification(`正在加载设备：${deviceName}`, 'info');
        
        // 模拟API调用
        setTimeout(() => {
            // 跳转到详情页，传递设备信息
            window.location.href = `detail.html?device=${encodeURIComponent(deviceName)}`;
        }, 500);
    }
    
    openManagementPage(pageName) {
        this.showNotification(`正在打开：${pageName}`, 'info');
        
        // 模拟加载
        setTimeout(() => {
            // 这里可以跳转到对应的管理页面
            // 暂时使用详情页代替
            window.location.href = `detail.html?management=${encodeURIComponent(pageName)}`;
        }, 500);
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        // 移除现有通知
        const existingNotif = document.querySelector('.notification');
        if (existingNotif) {
            existingNotif.remove();
        }
        
        // 创建新通知
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 添加关闭按钮事件
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // 自动隐藏（信息类通知）
        if (type === 'info') {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        notification.remove();
                    }, 300);
                }
            }, duration);
        }
    }
    
    getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }
}

// 通知样式
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    z-index: 1000;
    transform: translateX(120%);
    transition: transform 0.3s ease;
    max-width: 400px;
    min-width: 300px;
}

.notification.show {
    transform: translateX(0);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
}

.notification.success {
    border-left: 4px solid #4CAF50;
}

.notification.error {
    border-left: 4px solid #f44336;
}

.notification.warning {
    border-left: 4px solid #FF9800;
}

.notification.info {
    border-left: 4px solid #2196F3;
}

.notification-content i {
    font-size: 18px;
}

.notification.success .notification-content i {
    color: #4CAF50;
}

.notification.error .notification-content i {
    color: #f44336;
}

.notification.warning .notification-content i {
    color: #FF9800;
}

.notification.info .notification-content i {
    color: #2196F3;
}

.notification-close {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 5px;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.notification-close:hover {
    background: #f5f5f5;
    color: #333;
}

/* 巡检时间样式 */
.inspection-time {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #666;
    margin-top: 5px;
}

.inspection-time i {
    font-size: 11px;
}

/* 空状态图标 */
.activity-icon.empty {
    background: #f0f0f0;
    color: #999;
}
`;

// 添加到页面
document.head.appendChild(notificationStyle);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.inspectionSystem = new InspectionMainSystem();
});

// 全局辅助函数
window.logout = function() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        window.location.href = 'login.html';
    }
};

// 检查用户权限
function checkPermission(requiredRole) {
    const userData = localStorage.getItem('user');
    if (!userData) return false;
    
    try {
        const user = JSON.parse(userData);
        if (user.role === 'admin') return true; // 管理员有所有权限
        return user.role === requiredRole;
    } catch (error) {
        return false;
    }
}

// 根据用户角色显示/隐藏元素
function updateUIByRole() {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    
    try {
        const user = JSON.parse(userData);
        
        // 隐藏管理员专属功能（如果用户不是管理员）
        if (user.role !== 'admin') {
            const adminElements = document.querySelectorAll('[data-role="admin"]');
            adminElements.forEach(el => {
                el.style.display = 'none';
            });
        }
        
        // 隐藏巡检工程师专属功能（如果用户不是巡检工程师）
        if (user.role !== 'engineer') {
            const engineerElements = document.querySelectorAll('[data-role="engineer"]');
            engineerElements.forEach(el => {
                el.style.display = 'none';
            });
        }
        
        // 设置页面标题
        const roleTitles = {
            'admin': '管理员控制台',
            'engineer': '巡检工作台',
            'viewer': '数据监控台'
        };
        
        const title = roleTitles[user.role];
        if (title) {
            document.title = title + ' - 数据中心巡检系统';
        }
    } catch (error) {
        console.error('更新角色UI失败:', error);
    }
}

// 页面加载时执行权限检查
document.addEventListener('DOMContentLoaded', updateUIByRole);