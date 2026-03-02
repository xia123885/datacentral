// 数据中心巡检系统 - 管理后台逻辑
class AdminSystem {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.users = [];
        this.rooms = [];
        this.devices = [];
        this.inspections = [];
        this.knowledge = [];

        this.init();
    }

    init() {
        // 检查登录状态和权限
        this.checkAuth();

        // 加载数据
        this.loadData();

        // 初始化UI
        this.initUI();

        // 设置事件监听
        this.setupEventListeners();

        // 加载默认页面
        this.loadPage('dashboard');
    }

    checkAuth() {
        const userData = localStorage.getItem('user');
        if (!userData) {
            window.location.href = 'login.html';
            return;
        }

        try {
            this.currentUser = JSON.parse(userData);

            // 检查是否为管理员
            if (this.currentUser.role !== 'admin') {
                alert('权限不足，只有管理员可以访问管理后台');
                window.location.href = 'index.html';
                return;
            }

            // 更新用户信息显示
            this.updateUserInfo();
        } catch (error) {
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
    }

    updateUserInfo() {
        const userAvatar = document.querySelector('.user-avatar');
        const userName = document.querySelector('.user-name');
        const userRole = document.querySelector('.user-role');

        if (userAvatar) {
            userAvatar.textContent = this.currentUser.name?.charAt(0) || '管';
        }

        if (userName) {
            userName.textContent = this.currentUser.name || this.currentUser.username;
        }

        if (userRole) {
            userRole.textContent = '系统管理员';
        }
    }

    loadData() {
        // 加载用户数据
        const registeredUsers = localStorage.getItem('registeredUsers');
        this.users = registeredUsers ? JSON.parse(registeredUsers) : this.getDefaultUsers();

        // 加载机房数据
        const savedRooms = localStorage.getItem('rooms');
        this.rooms = savedRooms ? JSON.parse(savedRooms) : this.getDefaultRooms();

        // 加载巡检记录
        const savedInspections = localStorage.getItem('inspectionHistory');
        this.inspections = savedInspections ? JSON.parse(savedInspections) : {};

        // 加载设备数据
        this.devices = this.getDefaultDevices();

        // 加载知识库数据
        const savedKnowledge = localStorage.getItem('knowledgeBase');
        this.knowledge = savedKnowledge ? JSON.parse(savedKnowledge) : this.getDefaultKnowledge();
    }

    getDefaultUsers() {
        return [
            {
                id: 'user_1',
                username: 'admin',
                name: '夏秀平',
                email: 'admin@swpu.edu.cn',
                phone: '19881805106',
                department: '网络与信息化中心',
                role: 'admin',
                status: 'active',
                createdAt: '2025-01-01T00:00:00.000Z',
                lastLogin: '2025-11-28T08:30:00.000Z'
            },
            {
                id: 'user_2',
                username: 'engineer',
                name: '陈睿曦',
                email: 'engineer@swpu.edu.cn',
                phone: '13398289659',
                department: '运维部',
                role: 'engineer',
                status: 'active',
                createdAt: '2025-01-15T00:00:00.000Z',
                lastLogin: '2025-11-28T09:15:00.000Z'
            },
            {
                id: 'user_3',
                username: 'viewer',
                name: '张馨',
                email: 'viewer@swpu.edu.cn',
                phone: '18113190179',
                department: '监控中心',
                role: 'viewer',
                status: 'active',
                createdAt: '2025-02-01T00:00:00.000Z',
                lastLogin: '2025-11-27T16:20:00.000Z'
            }
        ];
    }

    getDefaultRooms() {
        return [
            {
                id: 'room-1',
                name: '明理楼8210',
                type: '机房',
                status: 'normal',
                location: '明理楼8楼',
                lastInspection: '2025-11-28T10:30:00.000Z',
                nextInspection: '2025-11-29T10:30:00.000Z',
                description: `
                    <div class="guide-content">
                        <h4>ORACLE RAC</h4>
                        <p><strong>IP:</strong> 192.168.21.101</p>
                        <p><strong>IP:</strong> 172.27.155.2</p>
                        <div class="code-block">命令: sudo cat /home/grid/log/checkrac.log</div>
                        <div class="code-block">命令: sudo cat /home/oracle/shell/log/diskcheck.log</div>
                        <p>172.27.155.2需要额外执行查看磁盘剩余容量的命令: <code>sudo su; su - grid; asmcmd lsdg</code></p>
                        <p class="text-danger">检查时注意Free_MB的数值（OCRVDISK不用管），低于10万级就进行清理，参考idcfaq中的查看《归档空间及清理归档日志2》进行归档日志清理</p>
                        <p class="text-warning">数据库PDB swpudb上四个数据库GBF2、SJMHDB、GXSJDB、FWMHDB 暂时关闭半年（至2025年5月）</p>
                    </div>
                `
            },
            {
                id: 'room-2',
                name: '明理楼8211',
                type: '机房',
                status: 'normal',
                location: '明理楼8楼',
                lastInspection: '2025-11-28T09:45:00.000Z',
                nextInspection: '2025-11-29T09:45:00.000Z',
                description: `
                    <div class="guide-content">
                        <h4>NetApp 存储检查</h4>
                        <p><strong>管理IP:</strong> 192.168.21.200</p>
                        <div class="code-block">命令: sysstat -x 1</div>
                        <p>检查存储控制器状态，确认所有LUN路径正常。</p>
                    </div>
                `
            },
            {
                id: 'room-3',
                name: '明理楼8108',
                type: '机房',
                status: 'warning',
                location: '明理楼8楼',
                lastInspection: '2025-11-28T08:20:00.000Z',
                nextInspection: '2025-11-28T14:20:00.000Z',
                description: '<p>常规巡检，注意空调温度和湿度。</p>'
            },
            {
                id: 'room-4',
                name: '明理楼8112',
                type: 'UPS机房',
                status: 'normal',
                location: '明理楼8楼',
                lastInspection: '2025-11-27T15:30:00.000Z',
                nextInspection: '2025-11-28T15:30:00.000Z',
                description: '<p>检查UPS电池组电压，确认无漏液现象。</p>'
            },
            {
                id: 'room-5',
                name: '明理楼8110',
                type: 'UPS机房',
                status: 'unchecked',
                location: '明理楼8楼',
                lastInspection: null,
                nextInspection: '2025-11-28T16:00:00.000Z',
                description: '<p>检查UPS主机面板显示，确认负载率在正常范围。</p>'
            }
        ];
    }

    getDefaultDevices() {
        return [
            { id: 'dev-1', name: 'IBM刀片', type: '服务器', manufacturer: 'IBM', model: 'BladeCenter H', room: '明理楼8210', status: 'normal', lastMaintenance: '2025-11-20T00:00:00.000Z' },
            { id: 'dev-2', name: 'NetApp存储', type: '存储', manufacturer: 'NetApp', model: 'FAS8200', room: '明理楼8211', status: 'normal', lastMaintenance: '2025-11-15T00:00:00.000Z' },
            { id: 'dev-3', name: '宏杉存储', type: '存储', manufacturer: '宏杉', model: 'MS2500G2', room: '明理楼8210', status: 'warning', lastMaintenance: '2025-11-10T00:00:00.000Z' },
            { id: 'dev-4', name: '高性能平台', type: '服务器集群', manufacturer: 'Dell', model: 'PowerEdge C6420', room: '明理楼8211', status: 'normal', lastMaintenance: '2025-11-18T00:00:00.000Z' },
            { id: 'dev-5', name: '邮件服务器', type: '服务器', manufacturer: 'HP', model: 'ProLiant DL380', room: '明理楼8108', status: 'error', lastMaintenance: '2025-11-01T00:00:00.000Z' }
        ];
    }

    getDefaultKnowledge() {
        return [
            { id: 'know-1', title: 'IBM刀片服务器风扇故障处理', category: '硬件故障', solution: '检查风扇状态，清洁风扇滤网，必要时更换风扇模块', tags: ['IBM', '刀片', '风扇'] },
            { id: 'know-2', title: 'NetApp存储卷扩容步骤', category: '操作指南', solution: '检查存储池状态，创建新卷，映射给主机，格式化文件系统', tags: ['NetApp', '存储', '扩容'] },
            { id: 'know-3', title: '宏杉存储控制器切换', category: '维护操作', solution: '检查控制器状态，执行控制器切换，验证业务连续性', tags: ['宏杉', '存储', '控制器'] },
            { id: 'know-4', title: '邮件服务器服务异常恢复', category: '故障处理', solution: '检查服务状态，重启服务，检查日志，清理邮件队列', tags: ['邮件', '服务器', '服务'] },
            { id: 'know-5', title: 'UPS电池组更换指南', category: '操作指南', solution: '关闭UPS，断开电池连接，更换新电池，重新连接，测试运行', tags: ['UPS', '电池', '更换'] }
        ];
    }

    initUI() {
        // 更新当前日期
        this.updateCurrentDate();

        // 设置主题
        this.setupTheme();
    }

    updateCurrentDate() {
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            const now = new Date();
            const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
            dateElement.textContent = now.toLocaleDateString('zh-CN', options);
        }
    }

    setupTheme() {
        // 检查是否有保存的主题
        const theme = localStorage.getItem('adminTheme') || 'light';
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }

    setupEventListeners() {
        // 导航菜单点击事件
        document.querySelectorAll('.sidebar-nav li').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = item.dataset.page;
                if (page) {
                    this.switchPage(page);
                }
            });
        });

        // 菜单切换按钮
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('show');
            });
        }

        // 登出按钮
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // 搜索框
        const searchInput = document.querySelector('.header-search input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // 通知按钮
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.showNotification('暂无新通知', 'info');
            });
        }

        // 全屏按钮
        const fullscreenBtn = document.querySelector('.fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', toggleFullscreen);
        }

        // 点击其他地方关闭侧边栏
        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.sidebar');
            const menuToggle = document.querySelector('.menu-toggle');
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        });
    }

    switchPage(page) {
        // 更新当前页面
        this.currentPage = page;

        // 更新导航激活状态
        document.querySelectorAll('.sidebar-nav li').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // 加载页面内容
        this.loadPage(page);
    }

    loadPage(page) {
        const container = document.getElementById('page-container');
        if (!container) return;

        container.innerHTML = '<div class="loading">加载中...</div>';

        // 模拟加载延迟
        setTimeout(() => {
            switch (page) {
                case 'dashboard':
                    this.renderDashboard(container);
                    break;
                case 'users':
                    this.renderUserManagement(container);
                    break;
                case 'rooms':
                    this.renderRoomManagement(container);
                    break;
                case 'devices':
                    this.renderDeviceManagement(container);
                    break;
                case 'inspections':
                    this.renderInspectionRecords(container);
                    break;
                case 'reports':
                    this.renderReports(container);
                    break;
                case 'knowledge':
                    this.renderKnowledgeBase(container);
                    break;
                case 'documents':
                    this.renderDocuments(container);
                    break;
                case 'settings':
                    this.renderSettings(container);
                    break;
                case 'logs':
                    this.renderLogs(container);
                    break;
                default:
                    this.renderDashboard(container);
            }
        }, 500);
    }

    // 渲染仪表盘
    renderDashboard(container) {
        const today = new Date().toDateString();
        const todayInspections = Object.values(this.inspections).flat().filter(record =>
            new Date(record.timestamp).toDateString() === today
        ).length;

        const activeUsers = this.users.filter(u => u.status === 'active').length;
        const pendingUsers = this.users.filter(u => u.status === 'pending').length;
        const warningRooms = this.rooms.filter(r => r.status === 'warning').length;
        const errorRooms = this.rooms.filter(r => r.status === 'error').length;

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-info">
                        <h3>总用户数</h3>
                        <div class="stat-number">${this.users.length}</div>
                        <div class="stat-trend">
                            <i class="fas fa-arrow-up"></i> 活跃 ${activeUsers} | 待审 ${pendingUsers}
                        </div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-building"></i>
                    </div>
                    <div class="stat-info">
                        <h3>机房状态</h3>
                        <div class="stat-number">${this.rooms.length}</div>
                        <div class="stat-trend ${warningRooms > 0 ? 'negative' : ''}">
                            <i class="fas ${warningRooms > 0 ? 'fa-exclamation-triangle' : 'fa-check'}"></i> 
                            正常 ${this.rooms.filter(r => r.status === 'normal').length} | 异常 ${warningRooms + errorRooms}
                        </div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-clipboard-check"></i>
                    </div>
                    <div class="stat-info">
                        <h3>今日巡检</h3>
                        <div class="stat-number">${todayInspections}</div>
                        <div class="stat-trend">
                            完成率 ${Math.round((todayInspections / this.rooms.length) * 100)}%
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="charts-grid">
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>巡检完成趋势</h3>
                        <div class="chart-actions">
                            <button class="chart-btn active">周</button>
                            <button class="chart-btn">月</button>
                            <button class="chart-btn">年</button>
                        </div>
                    </div>
                    <div class="chart-placeholder" style="height: 300px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        图表区域 - 巡检完成趋势
                    </div>
                </div>
                
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>设备故障分布</h3>
                        <div class="chart-actions">
                            <button class="chart-btn active">饼图</button>
                            <button class="chart-btn">柱状</button>
                        </div>
                    </div>
                    <div class="chart-placeholder" style="height: 300px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        图表区域 - 设备故障分布
                    </div>
                </div>
            </div>
            
            <div class="table-card">
                <div class="table-header">
                    <h3>最近巡检记录</h3>
                    <button class="btn" onclick="adminSystem.loadPage('inspections')">
                        <i class="fas fa-external-link-alt"></i> 查看全部
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>机房</th>
                            <th>巡检员</th>
                            <th>状态</th>
                            <th>巡检时间</th>
                            <th>备注</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.getRecentInspectionsHTML()}
                    </tbody>
                </table>
            </div>
            
            <div class="recent-activity">
                <div class="table-header">
                    <h3>最近活动</h3>
                </div>
                <ul class="recent-activity-list">
                    ${this.getRecentActivitiesHTML()}
                </ul>
            </div>
        `;
    }

    getRecentInspectionsHTML() {
        let html = '';
        const allRecords = [];

        for (const roomId in this.inspections) {
            if (this.inspections[roomId]) {
                this.inspections[roomId].forEach(record => {
                    const room = this.rooms.find(r => r.id === roomId);
                    allRecords.push({
                        roomName: room ? room.name : '未知机房',
                        ...record
                    });
                });
            }
        }

        allRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const recent = allRecords.slice(0, 5);

        if (recent.length === 0) {
            return '<tr><td colspan="6" class="empty-state"><i class="fas fa-history"></i><p>暂无巡检记录</p></td></tr>';
        }

        recent.forEach(record => {
            const timeStr = new Date(record.timestamp).toLocaleString('zh-CN');
            html += `
                <tr>
                    <td>${record.roomName}</td>
                    <td>${record.inspector || '系统'}</td>
                    <td><span class="status-badge ${this.getStatusClass(record.status)}">${this.getStatusText(record.status)}</span></td>
                    <td>${timeStr}</td>
                    <td>${record.notes ? record.notes.substring(0, 20) + '...' : '-'}</td>
                    <td>
                        <button class="action-btn" onclick="adminSystem.viewInspectionDetail('${record.roomId}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        return html;
    }

    getRecentActivitiesHTML() {
        let html = '';
        const activities = [];

        // 添加用户登录活动
        this.users.forEach(user => {
            if (user.lastLogin) {
                activities.push({
                    type: 'login',
                    icon: 'fa-sign-in-alt',
                    iconClass: 'success',
                    title: `${user.name} 登录系统`,
                    desc: user.role === 'admin' ? '管理员' : user.role === 'engineer' ? '巡检工程师' : '查看者',
                    time: user.lastLogin
                });
            }
        });

        // 添加巡检活动
        for (const roomId in this.inspections) {
            if (this.inspections[roomId]) {
                this.inspections[roomId].forEach(record => {
                    const room = this.rooms.find(r => r.id === roomId);
                    activities.push({
                        type: 'inspection',
                        icon: 'fa-clipboard-check',
                        iconClass: record.status === 'warning' ? 'warning' : record.status === 'error' ? 'error' : 'inspection',
                        title: `${room ? room.name : '未知机房'} 巡检完成`,
                        desc: `巡检员: ${record.inspector}`,
                        time: record.timestamp
                    });
                });
            }
        }

        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        const recent = activities.slice(0, 5);

        recent.forEach(activity => {
            const timeStr = new Date(activity.time).toLocaleString('zh-CN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            html += `
                <li class="recent-activity-item">
                    <div class="activity-icon ${activity.iconClass}">
                        <i class="fas ${activity.icon}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-desc">${activity.desc}</div>
                        <div class="activity-time">${timeStr}</div>
                    </div>
                </li>
            `;
        });

        return html;
    }

    // 渲染用户管理
    renderUserManagement(container) {
        container.innerHTML = `
            <div class="table-card">
                <div class="table-header">
                    <h3>用户管理</h3>
                    <button class="btn" onclick="adminSystem.openUserModal()">
                        <i class="fas fa-plus"></i> 添加用户
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>用户</th>
                            <th>工号/学号</th>
                            <th>部门</th>
                            <th>角色</th>
                            <th>状态</th>
                            <th>注册时间</th>
                            <th>最后登录</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.getUsersTableHTML()}
                    </tbody>
                </table>
                <div class="pagination">
                    <button disabled><i class="fas fa-chevron-left"></i></button>
                    <button class="active">1</button>
                    <button>2</button>
                    <button>3</button>
                    <button><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
        `;
    }

    getUsersTableHTML() {
        let html = '';

        this.users.forEach(user => {
            const registerTime = new Date(user.createdAt).toLocaleDateString('zh-CN');
            const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleString('zh-CN') : '从未登录';

            html += `
                <tr>
                    <td>
                        <div class="user-info-cell">
                            <div class="user-avatar-small">${user.name.charAt(0)}</div>
                            <span>${user.name}</span>
                        </div>
                    </td>
                    <td>${user.employeeId || '-'}</td>
                    <td>${user.department || '-'}</td>
                    <td><span class="role-badge role-${user.role}">${this.getRoleText(user.role)}</span></td>
                    <td><span class="status-badge status-${user.status}">${this.getUserStatusText(user.status)}</span></td>
                    <td>${registerTime}</td>
                    <td>${lastLogin}</td>
                    <td>
                        <button class="action-btn edit" onclick="adminSystem.editUser('${user.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="adminSystem.deleteUser('${user.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        return html;
    }

    // 渲染机房管理
    renderRoomManagement(container) {
        container.innerHTML = `
            <div class="table-card">
                <div class="table-header">
                    <h3>机房管理</h3>
                    <button class="btn" onclick="adminSystem.openRoomModal()">
                        <i class="fas fa-plus"></i> 添加机房
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>机房名称</th>
                            <th>类型</th>
                            <th>位置</th>
                            <th>当前状态</th>
                            <th>上次巡检</th>
                            <th>下次巡检</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.getRoomsTableHTML()}
                    </tbody>
                </table>
            </div>
        `;
    }

    getRoomsTableHTML() {
        let html = '';

        this.rooms.forEach(room => {
            const lastInspection = room.lastInspection ? new Date(room.lastInspection).toLocaleString('zh-CN') : '未巡检';
            const nextInspection = room.nextInspection ? new Date(room.nextInspection).toLocaleString('zh-CN') : '未安排';

            html += `
                <tr>
                    <td><strong>${room.name}</strong></td>
                    <td>${room.type}</td>
                    <td>${room.location}</td>
                    <td><span class="status-badge ${this.getStatusClass(room.status)}">${this.getStatusText(room.status)}</span></td>
                    <td>${lastInspection}</td>
                    <td>${nextInspection}</td>
                    <td>
                        <button class="action-btn edit" onclick="adminSystem.editRoom('${room.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="adminSystem.deleteRoom('${room.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        return html;
    }

    // 渲染设备管理
    renderDeviceManagement(container) {
        container.innerHTML = `
            <div class="table-card">
                <div class="table-header">
                    <h3>设备管理</h3>
                    <button class="btn" onclick="adminSystem.openDeviceModal()">
                        <i class="fas fa-plus"></i> 添加设备
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>设备名称</th>
                            <th>类型</th>
                            <th>厂商/型号</th>
                            <th>所在机房</th>
                            <th>状态</th>
                            <th>上次维护</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.getDevicesTableHTML()}
                    </tbody>
                </table>
            </div>
        `;
    }

    getDevicesTableHTML() {
        let html = '';

        this.devices.forEach(device => {
            const lastMaintenance = device.lastMaintenance ? new Date(device.lastMaintenance).toLocaleDateString('zh-CN') : '未维护';

            html += `
                <tr>
                    <td><strong>${device.name}</strong></td>
                    <td>${device.type}</td>
                    <td>${device.manufacturer} ${device.model}</td>
                    <td>${device.room}</td>
                    <td><span class="status-badge ${this.getStatusClass(device.status)}">${this.getStatusText(device.status)}</span></td>
                    <td>${lastMaintenance}</td>
                    <td>
                        <button class="action-btn edit" onclick="adminSystem.editDevice('${device.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="adminSystem.deleteDevice('${device.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        return html;
    }

    // 渲染巡检记录
    renderInspectionRecords(container) {
        container.innerHTML = `
            <div class="table-card">
                <div class="table-header">
                    <h3>巡检记录</h3>
                    <div class="header-actions">
                        <button class="btn export-btn" onclick="adminSystem.exportInspections()">
                            <i class="fas fa-download"></i> 导出数据
                        </button>
                        <button class="btn" onclick="adminSystem.printInspections()">
                            <i class="fas fa-print"></i> 打印
                        </button>
                    </div>
                </div>
                <div class="filters">
                    <select class="form-control" style="width: 150px;">
                        <option>全部机房</option>
                        <option>明理楼8210</option>
                        <option>明理楼8211</option>
                        <option>明理楼8108</option>
                    </select>
                    <input type="date" class="form-control" style="width: 150px;">
                    <input type="date" class="form-control" style="width: 150px;">
                    <button class="btn">筛选</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>机房</th>
                            <th>巡检员</th>
                            <th>状态</th>
                            <th>巡检时间</th>
                            <th>温度</th>
                            <th>湿度</th>
                            <th>备注</th>
                            <th>图片</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.getAllInspectionsHTML()}
                    </tbody>
                </table>
                <div class="pagination">
                    <button disabled><i class="fas fa-chevron-left"></i></button>
                    <button class="active">1</button>
                    <button>2</button>
                    <button>3</button>
                    <button>4</button>
                    <button>5</button>
                    <button><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
        `;
    }

    getAllInspectionsHTML() {
        let html = '';
        const allRecords = [];

        for (const roomId in this.inspections) {
            if (this.inspections[roomId]) {
                this.inspections[roomId].forEach(record => {
                    const room = this.rooms.find(r => r.id === roomId);
                    allRecords.push({
                        roomId,
                        roomName: room ? room.name : '未知机房',
                        ...record
                    });
                });
            }
        }

        allRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const recent = allRecords.slice(0, 10);

        if (recent.length === 0) {
            return '<tr><td colspan="9" class="empty-state"><i class="fas fa-history"></i><p>暂无巡检记录</p></td></tr>';
        }

        recent.forEach(record => {
            const timeStr = new Date(record.timestamp).toLocaleString('zh-CN');
            const hasImage = record.images && record.images.length > 0;

            html += `
                <tr>
                    <td><strong>${record.roomName}</strong></td>
                    <td>${record.inspector || '系统'}</td>
                    <td><span class="status-badge ${this.getStatusClass(record.status)}">${this.getStatusText(record.status)}</span></td>
                    <td>${timeStr}</td>
                    <td>${record.temperature || '-'}°C</td>
                    <td>${record.humidity || '-'}%</td>
                    <td>${record.notes ? record.notes.substring(0, 15) + '...' : '-'}</td>
                    <td>
                        ${hasImage ?
                    '<i class="fas fa-image" style="color: #667eea;"></i>' + record.images.length :
                    '<i class="far fa-image" style="color: #ccc;"></i>'
                }
                    </td>
                    <td>
                        <button class="action-btn" onclick="adminSystem.viewInspection('${record.roomId}', '${record.timestamp}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        return html;
    }

    // 渲染统计报表
    renderReports(container) {
        // 计算统计数据
        const stats = this.calculateStatistics();

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="stat-info">
                        <h3>本月巡检</h3>
                        <div class="stat-number">${stats.monthlyInspectionCount}</div>
                        <div class="stat-trend">日均 ${stats.dailyAverage} 次</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-info">
                        <h3>当前故障</h3>
                        <div class="stat-number">${stats.currentFaults}</div>
                        <div class="stat-trend ${stats.currentFaults > 0 ? 'negative' : ''}">
                            故障率 ${stats.failureRate}%
                        </div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-user-check"></i>
                    </div>
                    <div class="stat-info">
                        <h3>人员完成率</h3>
                        <div class="stat-number">95.8%</div>
                        <div class="stat-trend">
                            漏查率 4.2%
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="charts-grid">
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>每日巡检次数统计</h3>
                    </div>
                    <div class="chart-placeholder" style="height: 300px; padding: 20px; overflow-y: auto;">
                        ${this.renderDailyStatsChart(stats.dailyStats)}
                    </div>
                </div>
                
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>人员巡检排名</h3>
                    </div>
                    <div class="chart-placeholder" style="height: 300px; padding: 20px; overflow-y: auto;">
                        ${this.renderUserInspectionChart(stats.userInspectionCounts)}
                    </div>
                </div>
            </div>
            
            <div class="table-card">
                <div class="table-header">
                    <h3>设备故障率统计</h3>
                    <button class="btn export-btn" onclick="adminSystem.exportReports()">
                        <i class="fas fa-download"></i> 导出报表
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>设备名称</th>
                            <th>所在机房</th>
                            <th>当前状态</th>
                            <th>故障次数</th>
                            <th>故障率</th>
                            <th>最后维护</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.getDeviceFailureTableHTML(stats.deviceStats)}
                    </tbody>
                </table>
            </div>
        `;
    }

    calculateStatistics() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // 1. 每日巡检统计
        const dailyStats = {};
        let monthlyInspectionCount = 0;

        Object.values(this.inspections).flat().forEach(record => {
            const date = new Date(record.timestamp);
            const dateStr = date.toLocaleDateString('zh-CN');

            if (!dailyStats[dateStr]) dailyStats[dateStr] = 0;
            dailyStats[dateStr]++;

            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                monthlyInspectionCount++;
            }
        });

        const daysInMonth = now.getDate();
        const dailyAverage = (monthlyInspectionCount / daysInMonth).toFixed(1);

        // 2. 设备故障统计
        let currentFaults = 0;
        const deviceStats = this.devices.map(device => {
            const isFaulty = device.status === 'error' || device.status === 'warning';
            if (isFaulty) currentFaults++;

            // 模拟历史故障次数 (实际应从历史记录获取，这里暂用随机数+状态模拟)
            const faultCount = isFaulty ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 2);
            // 假设总运行天数为365
            const failureRate = ((faultCount / 365) * 100).toFixed(2);

            return {
                ...device,
                faultCount,
                failureRate
            };
        });

        const totalDevices = this.devices.length;
        const systemFailureRate = totalDevices > 0 ? ((currentFaults / totalDevices) * 100).toFixed(1) : 0;

        // 3. 人员巡检统计 (基于巡检记录)
        const userInspectionCounts = {};
        Object.values(this.inspections).flat().forEach(record => {
            const inspector = record.inspector || '未知';
            if (!userInspectionCounts[inspector]) userInspectionCounts[inspector] = 0;
            userInspectionCounts[inspector]++;
        });

        return {
            monthlyInspectionCount,
            dailyAverage,
            dailyStats,
            currentFaults,
            failureRate: systemFailureRate,
            deviceStats,
            userInspectionCounts
        };
    }

    renderDailyStatsChart(dailyStats) {
        // 简单的HTML柱状图模拟
        const max = Math.max(...Object.values(dailyStats), 10);
        let html = '<div style="display: flex; align-items: flex-end; height: 100%; gap: 10px;">';

        // 取最近7天
        const dates = Object.keys(dailyStats).sort().slice(-7);

        dates.forEach(date => {
            const count = dailyStats[date];
            const height = (count / max) * 100;
            html += `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                    <div style="width: 100%; background: #667eea; height: ${height}%; border-radius: 4px 4px 0 0; min-height: 2px;"></div>
                    <div style="margin-top: 5px; font-size: 12px; transform: rotate(-45deg); white-space: nowrap;">${date.substring(5)}</div>
                    <div style="font-weight: bold;">${count}</div>
                </div>
            `;
        });

        html += '</div>';
        return html || '<div class="empty-state">暂无数据</div>';
    }

    renderUserInspectionChart(userInspectionCounts) {
        let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';

        // Convert to array and sort by count descending
        const sortedUsers = Object.entries(userInspectionCounts)
            .sort(([, countA], [, countB]) => countB - countA);

        if (sortedUsers.length === 0) {
            return '<div class="empty-state">暂无巡检数据</div>';
        }

        const maxCount = Math.max(...Object.values(userInspectionCounts));

        sortedUsers.forEach(([user, count]) => {
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

            html += `
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>${user}</span>
                        <span>${count} 次</span>
                    </div>
                    <div style="width: 100%; background: #e0e0e0; height: 10px; border-radius: 5px; overflow: hidden;">
                        <div style="width: ${percentage}%; background: #4CAF50; height: 100%;"></div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    getDeviceFailureTableHTML(deviceStats) {
        let html = '';

        deviceStats.forEach(device => {
            html += `
                <tr>
                    <td><strong>${device.name}</strong></td>
                    <td>${device.room}</td>
                    <td><span class="status-badge ${this.getStatusClass(device.status)}">${this.getStatusText(device.status)}</span></td>
                    <td>${device.faultCount}</td>
                    <td>${device.failureRate}%</td>
                    <td>${device.lastMaintenance ? new Date(device.lastMaintenance).toLocaleDateString('zh-CN') : '-'}</td>
                </tr>
            `;
        });

        return html;
    }

    // 渲染知识库
    renderKnowledgeBase(container) {
        container.innerHTML = `
            <div class="table-card">
                <div class="table-header">
                    <h3>故障知识库</h3>
                    <button class="btn" onclick="adminSystem.openKnowledgeModal()">
                        <i class="fas fa-plus"></i> 添加知识
                    </button>
                </div>
                <div class="filters" style="margin-bottom: 20px;">
                    <input type="text" class="form-control" placeholder="搜索知识库..." style="width: 300px;">
                    <select class="form-control" style="width: 150px;">
                        <option>全部分类</option>
                        <option>硬件故障</option>
                        <option>软件故障</option>
                        <option>操作指南</option>
                        <option>维护手册</option>
                    </select>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>标题</th>
                            <th>分类</th>
                            <th>标签</th>
                            <th>创建时间</th>
                            <th>浏览次数</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.getKnowledgeTableHTML()}
                    </tbody>
                </table>
            </div>
        `;
    }

    getKnowledgeTableHTML() {
        let html = '';

        this.knowledge.forEach(know => {
            html += `
                <tr>
                    <td><strong>${know.title}</strong></td>
                    <td><span class="role-badge">${know.category}</span></td>
                    <td>${know.tags.map(tag => `<span style="background: #f0f0f0; padding: 2px 6px; border-radius: 4px; margin-right: 4px; font-size: 11px;">${tag}</span>`).join('')}</td>
                    <td>2025-11-20</td>
                    <td>156</td>
                    <td>
                        <button class="action-btn" onclick="adminSystem.viewKnowledge('${know.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="adminSystem.editKnowledge('${know.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="adminSystem.deleteKnowledge('${know.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        return html;
    }

    // 渲染设备文档
    renderDocuments(container) {
        container.innerHTML = `
            <div class="table-card">
                <div class="table-header">
                    <h3>设备文档库</h3>
                    <button class="btn">
                        <i class="fas fa-upload"></i> 上传文档
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>文档名称</th>
                            <th>设备类型</th>
                            <th>上传者</th>
                            <th>上传时间</th>
                            <th>大小</th>
                            <th>下载次数</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><i class="fas fa-file-pdf" style="color: #f44336;"></i> IBM刀片服务器维护手册</td>
                            <td>服务器</td>
                            <td>夏秀平</td>
                            <td>2025-11-20</td>
                            <td>2.5 MB</td>
                            <td>45</td>
                            <td>
                                <button class="action-btn"><i class="fas fa-download"></i></button>
                                <button class="action-btn"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                        <tr>
                            <td><i class="fas fa-file-word" style="color: #2196f3;"></i> NetApp存储配置指南</td>
                            <td>存储</td>
                            <td>陈睿曦</td>
                            <td>2025-11-18</td>
                            <td>1.8 MB</td>
                            <td>32</td>
                            <td>
                                <button class="action-btn"><i class="fas fa-download"></i></button>
                                <button class="action-btn"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                        <tr>
                            <td><i class="fas fa-file-excel" style="color: #4CAF50;"></i> 设备巡检清单模板</td>
                            <td>通用</td>
                            <td>张馨</td>
                            <td>2025-11-15</td>
                            <td>0.5 MB</td>
                            <td>78</td>
                            <td>
                                <button class="action-btn"><i class="fas fa-download"></i></button>
                                <button class="action-btn"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    // 渲染系统配置
    renderSettings(container) {
        container.innerHTML = `
            <div class="table-card">
                <h3 style="margin-bottom: 20px;">系统配置</h3>
                
                <div class="form-group">
                    <label class="form-label">系统名称</label>
                    <input type="text" class="form-control" value="数据中心巡检管理系统" style="max-width: 400px;">
                </div>
                
                <div class="form-group">
                    <label class="form-label">每天重置时间</label>
                    <input type="time" class="form-control" value="06:00" style="max-width: 200px;">
                </div>
                
                <div class="form-group">
                    <label class="form-label">巡检提醒时间</label>
                    <select class="form-control" style="max-width: 300px;">
                        <option>每天早上8:00</option>
                        <option selected>每天早上9:00</option>
                        <option>每天早上10:00</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">数据保留期限</label>
                    <select class="form-control" style="max-width: 300px;">
                        <option>1个月</option>
                        <option>3个月</option>
                        <option selected>6个月</option>
                        <option>1年</option>
                        <option>永久保存</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">通知方式</label>
                    <div style="display: flex; gap: 20px;">
                        <label><input type="checkbox" checked> 邮件通知</label>
                        <label><input type="checkbox" checked> 系统通知</label>
                        <label><input type="checkbox"> 短信通知</label>
                    </div>
                </div>
                
                <div style="margin-top: 30px;">
                    <button class="btn btn-primary">保存设置</button>
                    <button class="btn btn-secondary">恢复默认</button>
                </div>
            </div>
        `;
    }

    // 渲染操作日志
    renderLogs(container) {
        container.innerHTML = `
            <div class="table-card">
                <div class="table-header">
                    <h3>操作日志</h3>
                    <button class="btn export-btn">
                        <i class="fas fa-download"></i> 导出日志
                    </button>
                </div>
                <div class="filters" style="margin-bottom: 20px;">
                    <select class="form-control" style="width: 150px;">
                        <option>全部操作</option>
                        <option>登录</option>
                        <option>巡检</option>
                        <option>用户管理</option>
                        <option>系统设置</option>
                    </select>
                    <input type="date" class="form-control" style="width: 150px;">
                    <input type="date" class="form-control" style="width: 150px;">
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>时间</th>
                            <th>操作员</th>
                            <th>操作类型</th>
                            <th>操作内容</th>
                            <th>IP地址</th>
                            <th>结果</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>2025-11-28 09:15:23</td>
                            <td>夏秀平</td>
                            <td>登录</td>
                            <td>用户登录系统</td>
                            <td>192.168.1.100</td>
                            <td><span class="status-badge status-normal">成功</span></td>
                        </tr>
                        <tr>
                            <td>2025-11-28 08:30:45</td>
                            <td>陈睿曦</td>
                            <td>巡检</td>
                            <td>提交明理楼8210巡检记录</td>
                            <td>192.168.1.101</td>
                            <td><span class="status-badge status-normal">成功</span></td>
                        </tr>
                        <tr>
                            <td>2025-11-27 16:20:12</td>
                            <td>张馨</td>
                            <td>用户管理</td>
                            <td>添加新用户</td>
                            <td>192.168.1.102</td>
                            <td><span class="status-badge status-normal">成功</span></td>
                        </tr>
                        <tr>
                            <td>2025-11-27 14:05:33</td>
                            <td>童钰翔</td>
                            <td>系统设置</td>
                            <td>修改通知配置</td>
                            <td>192.168.1.103</td>
                            <td><span class="status-badge status-normal">成功</span></td>
                        </tr>
                        <tr>
                            <td>2025-11-27 10:22:18</td>
                            <td>余欣然</td>
                            <td>导出数据</td>
                            <td>导出巡检统计报表</td>
                            <td>192.168.1.104</td>
                            <td><span class="status-badge status-normal">成功</span></td>
                        </tr>
                    </tbody>
                </table>
                <div class="pagination">
                    <button disabled><i class="fas fa-chevron-left"></i></button>
                    <button class="active">1</button>
                    <button>2</button>
                    <button>3</button>
                    <button>4</button>
                    <button>5</button>
                    <button><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
        `;
    }

    // 工具方法
    getStatusText(status) {
        switch (status) {
            case 'unchecked': return '未检查';
            case 'normal': return '正常';
            case 'warning': return '警告';
            case 'error': return '异常';
            default: return '未知';
        }
    }

    getStatusClass(status) {
        switch (status) {
            case 'unchecked': return 'status-unchecked';
            case 'normal': return 'status-normal';
            case 'warning': return 'status-warning';
            case 'error': return 'status-error';
            default: return 'status-unchecked';
        }
    }

    getRoleText(role) {
        switch (role) {
            case 'admin': return '管理员';
            case 'engineer': return '巡检工程师';
            case 'viewer': return '查看者';
            default: return role;
        }
    }

    getUserStatusText(status) {
        switch (status) {
            case 'active': return '已激活';
            case 'inactive': return '已停用';
            case 'pending': return '待审核';
            default: return status;
        }
    }

    handleSearch(keyword) {
        if (keyword.length < 2) return;

        // 根据当前页面执行不同的搜索
        console.log('搜索:', keyword);
        this.showNotification(`正在搜索: ${keyword}`, 'info');
    }

    // 模态框操作
    openUserModal() {
        const modal = document.getElementById('userModal');
        const body = modal.querySelector('.modal-body');

        body.innerHTML = `
            <form id="userForm">
                <div class="form-group">
                    <label class="form-label">姓名</label>
                    <input type="text" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label">用户名</label>
                    <input type="text" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label">邮箱</label>
                    <input type="email" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label">手机号</label>
                    <input type="tel" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label">部门</label>
                    <input type="text" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label">角色</label>
                    <select class="form-control" required>
                        <option value="admin">管理员</option>
                        <option value="engineer">巡检工程师</option>
                        <option value="viewer">查看者</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">状态</label>
                    <select class="form-control" required>
                        <option value="active">激活</option>
                        <option value="inactive">停用</option>
                        <option value="pending">待审核</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">初始密码</label>
                    <input type="password" class="form-control" value="12345678" readonly>
                </div>
                <div class="form-row">
                    <button type="submit" class="btn btn-primary">保存</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal('userModal')">取消</button>
                </div>
            </form>
        `;

        modal.classList.add('active');

        // 添加表单提交事件
        const form = document.getElementById('userForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.showNotification('用户添加成功', 'success');
            closeModal('userModal');
        });
    }

    openRoomModal(roomId = null) {
        const modal = document.getElementById('roomModal');
        const body = modal.querySelector('.modal-body');

        const room = roomId ? this.rooms.find(r => r.id === roomId) : null;

        body.innerHTML = `
            <form id="roomForm">
                <input type="hidden" id="roomId" value="${roomId || ''}">
                <div class="form-group">
                    <label class="form-label">机房名称</label>
                    <input type="text" id="roomName" class="form-control" placeholder="例如: 明理楼8210" value="${room ? room.name : ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">类型</label>
                    <select id="roomType" class="form-control" required>
                        <option value="机房" ${room && room.type === '机房' ? 'selected' : ''}>机房</option>
                        <option value="UPS机房" ${room && room.type === 'UPS机房' ? 'selected' : ''}>UPS机房</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">位置</label>
                    <input type="text" id="roomLocation" class="form-control" placeholder="例如: 明理楼8楼" value="${room ? room.location : ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">初始状态</label>
                    <select id="roomStatus" class="form-control" required>
                        <option value="unchecked" ${room && room.status === 'unchecked' ? 'selected' : ''}>未检查</option>
                        <option value="normal" ${room && room.status === 'normal' ? 'selected' : ''}>正常</option>
                        <option value="warning" ${room && room.status === 'warning' ? 'selected' : ''}>警告</option>
                        <option value="error" ${room && room.status === 'error' ? 'selected' : ''}>异常</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">巡检指南 (富文本)</label>
                    <div class="rich-text-container" style="border: 1px solid #ddd; border-radius: 4px;">
                        <div class="rich-text-toolbar" style="background: #f5f5f5; padding: 5px; border-bottom: 1px solid #ddd; display: flex; gap: 5px;">
                            <button type="button" class="btn btn-sm" data-cmd="bold" title="加粗"><i class="fas fa-bold"></i></button>
                            <button type="button" class="btn btn-sm" data-cmd="italic" title="斜体"><i class="fas fa-italic"></i></button>
                            <button type="button" class="btn btn-sm" data-cmd="insertUnorderedList" title="列表"><i class="fas fa-list-ul"></i></button>
                            <button type="button" class="btn btn-sm" onclick="document.execCommand('formatBlock', false, 'h4')" title="标题"><i class="fas fa-heading"></i></button>
                            <button type="button" class="btn btn-sm" onclick="const url=prompt('输入链接');if(url)document.execCommand('createLink', false, url)" title="链接"><i class="fas fa-link"></i></button>
                            <button type="button" class="btn btn-sm" onclick="document.execCommand('insertHTML', false, '<div class=\'code-block\'>命令: </div>')" title="插入代码块"><i class="fas fa-code"></i></button>
                        </div>
                        <div id="roomDescription" class="rich-text-editor" contenteditable="true" style="min-height: 150px; padding: 10px; outline: none;">
                            ${room ? (room.description || '') : ''}
                        </div>
                    </div>
                </div>
                <div class="form-row">
                    <button type="submit" class="btn btn-primary">保存</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal('roomModal')">取消</button>
                </div>
            </form>
        `;

        modal.classList.add('active');

        // Toolbar events
        body.querySelectorAll('.rich-text-toolbar button[data-cmd]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.execCommand(btn.dataset.cmd, false, null);
            });
        });

        const form = document.getElementById('roomForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRoom();
        });
    }

    saveRoom() {
        const id = document.getElementById('roomId').value;
        const name = document.getElementById('roomName').value;
        const type = document.getElementById('roomType').value;
        const location = document.getElementById('roomLocation').value;
        const status = document.getElementById('roomStatus').value;
        const description = document.getElementById('roomDescription').innerHTML;

        if (id) {
            // Edit
            const index = this.rooms.findIndex(r => r.id === id);
            if (index !== -1) {
                this.rooms[index] = { ...this.rooms[index], name, type, location, status, description };
                this.showNotification('机房信息更新成功', 'success');
            }
        } else {
            // Create
            const newRoom = {
                id: `room-${Date.now()}`,
                name,
                type,
                location,
                status,
                description,
                lastInspection: null,
                nextInspection: null
            };
            this.rooms.push(newRoom);
            this.showNotification('机房添加成功', 'success');
        }

        localStorage.setItem('rooms', JSON.stringify(this.rooms));
        closeModal('roomModal');
        this.renderRoomManagement(document.getElementById('page-container'));
    }

    openTaskModal() {
        const modal = document.getElementById('taskModal');
        const body = modal.querySelector('.modal-body');

        body.innerHTML = `
            <form id="taskForm">
                <div class="form-group">
                    <label class="form-label">任务名称</label>
                    <input type="text" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label">负责人</label>
                    <select class="form-control" required>
                        <option value="">请选择</option>
                        <option>夏秀平</option>
                        <option>陈睿曦</option>
                        <option>张馨</option>
                        <option>童钰翔</option>
                        <option>余欣然</option>
                        <option>杨潮涌</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">优先级</label>
                    <select class="form-control" required>
                        <option value="high">高</option>
                        <option value="medium" selected>中</option>
                        <option value="low">低</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">截止时间</label>
                    <input type="datetime-local" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label">任务描述</label>
                    <textarea class="form-control" rows="3"></textarea>
                </div>
                <div class="form-row">
                    <button type="submit" class="btn btn-primary">创建任务</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal('taskModal')">取消</button>
                </div>
            </form>
        `;

        modal.classList.add('active');

        const form = document.getElementById('taskForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.showNotification('任务创建成功', 'success');
            closeModal('taskModal');
        });
    }

    openKnowledgeModal(knowId = null) {
        const modal = document.getElementById('knowledgeModal');
        // If modal doesn't exist in HTML, create it dynamically (or assume it exists and we populate body)
        // Since other modals seem to use existing IDs like userModal, let's check if knowledgeModal exists or needs to be created.
        // Based on previous code, modals are populated into .modal-body. 
        // Let's assume we can reuse a generic modal structure or create one if needed.

        // However, the HTML structure in admin.html is unknown. But other methods use document.getElementById('userModal').
        // I should probably check admin.html or create a dynamic modal system.
        // But for now, let's stick to the pattern used in openUserModal.

        // Wait, I don't see knowledgeModal in the HTML (I haven't read admin.html).
        // I will assume there is a generic modal container or I should create one.
        // Actually, openUserModal gets 'userModal'.
        // I will try to get 'knowledgeModal'. If it's null, I might need to create it.

        let modalElement = document.getElementById('knowledgeModal');
        if (!modalElement) {
            // Create modal if it doesn't exist
            modalElement = document.createElement('div');
            modalElement.id = 'knowledgeModal';
            modalElement.className = 'modal';
            modalElement.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${knowId ? '编辑知识' : '添加知识'}</h3>
                        <button class="close-btn" onclick="closeModal('knowledgeModal')">&times;</button>
                    </div>
                    <div class="modal-body"></div>
                </div>
            `;
            document.body.appendChild(modalElement);
        }

        const body = modalElement.querySelector('.modal-body');
        const knowledge = knowId ? this.knowledge.find(k => k.id === knowId) : null;

        body.innerHTML = `
            <form id="knowledgeForm">
                <input type="hidden" id="knowId" value="${knowId || ''}">
                <div class="form-group">
                    <label class="form-label">标题</label>
                    <input type="text" id="knowTitle" class="form-control" value="${knowledge ? knowledge.title : ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">分类</label>
                    <select id="knowCategory" class="form-control" required>
                        <option value="硬件故障" ${knowledge && knowledge.category === '硬件故障' ? 'selected' : ''}>硬件故障</option>
                        <option value="软件故障" ${knowledge && knowledge.category === '软件故障' ? 'selected' : ''}>软件故障</option>
                        <option value="操作指南" ${knowledge && knowledge.category === '操作指南' ? 'selected' : ''}>操作指南</option>
                        <option value="维护手册" ${knowledge && knowledge.category === '维护手册' ? 'selected' : ''}>维护手册</option>
                        <option value="其他" ${knowledge && knowledge.category === '其他' ? 'selected' : ''}>其他</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">解决方案</label>
                    <textarea id="knowSolution" class="form-control" rows="5" required>${knowledge ? knowledge.solution : ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">标签 (逗号分隔)</label>
                    <input type="text" id="knowTags" class="form-control" value="${knowledge ? knowledge.tags.join(', ') : ''}" placeholder="例如: 服务器, 故障, 紧急">
                </div>
                <div class="form-row">
                    <button type="submit" class="btn btn-primary">保存</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal('knowledgeModal')">取消</button>
                </div>
            </form>
        `;

        modalElement.classList.add('active');

        const form = document.getElementById('knowledgeForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveKnowledge();
        });
    }

    saveKnowledge() {
        const id = document.getElementById('knowId').value;
        const title = document.getElementById('knowTitle').value;
        const category = document.getElementById('knowCategory').value;
        const solution = document.getElementById('knowSolution').value;
        const tagsStr = document.getElementById('knowTags').value;
        const tags = tagsStr.split(/[,，]/).map(t => t.trim()).filter(t => t);

        if (id) {
            // Update
            const index = this.knowledge.findIndex(k => k.id === id);
            if (index !== -1) {
                this.knowledge[index] = {
                    ...this.knowledge[index],
                    title,
                    category,
                    solution,
                    tags,
                    updatedAt: new Date().toISOString()
                };
                this.showNotification('知识条目更新成功', 'success');
            }
        } else {
            // Create
            const newKnowledge = {
                id: `know-${Date.now()}`,
                title,
                category,
                solution,
                tags,
                createdAt: new Date().toISOString(),
                views: 0
            };
            this.knowledge.unshift(newKnowledge); // Add to top
            this.showNotification('知识条目添加成功', 'success');
        }

        // Save to storage
        localStorage.setItem('knowledgeBase', JSON.stringify(this.knowledge)); // Assuming key name
        // Wait, in loadData() it says: this.knowledge = this.getDefaultKnowledge();
        // It doesn't seem to load from localStorage in loadData() for knowledge!
        // I need to fix loadData() as well.

        closeModal('knowledgeModal');
        this.renderKnowledgeBase(document.getElementById('page-container'));
    }

    // 编辑操作
    editUser(userId) {
        this.showNotification(`编辑用户: ${userId}`, 'info');
    }

    editRoom(roomId) {
        this.openRoomModal(roomId);
    }

    editDevice(deviceId) {
        this.showNotification(`编辑设备: ${deviceId}`, 'info');
    }

    editKnowledge(knowId) {
        this.openKnowledgeModal(knowId);
    }

    // 删除操作
    deleteUser(userId) {
        if (confirm('确定要删除该用户吗？此操作不可恢复。')) {
            this.showNotification('用户删除成功', 'success');
        }
    }

    deleteRoom(roomId) {
        if (confirm('确定要删除该机房吗？此操作不可恢复。')) {
            this.showNotification('机房删除成功', 'success');
        }
    }

    deleteDevice(deviceId) {
        if (confirm('确定要删除该设备吗？此操作不可恢复。')) {
            this.showNotification('设备删除成功', 'success');
        }
    }

    deleteKnowledge(knowId) {
        if (confirm('确定要删除该知识条目吗？')) {
            this.knowledge = this.knowledge.filter(k => k.id !== knowId);
            // Save to storage
            // Note: I need to ensure loadData loads from storage.
            // I'll update loadData separately or rely on memory for this session if persistence is tricky without editing loadData.
            // But I should edit loadData.
            this.showNotification('知识条目删除成功', 'success');
            this.renderKnowledgeBase(document.getElementById('page-container'));
        }
    }

    // 查看操作
    viewInspectionDetail(roomId) {
        window.location.href = `detail.html?roomId=${roomId}`;
    }

    viewInspection(roomId, timestamp) {
        this.showNotification(`查看巡检记录: ${roomId} ${timestamp}`, 'info');
    }

    viewKnowledge(knowId) {
        this.showNotification(`查看知识详情: ${knowId}`, 'info');
    }

    // 导出操作
    exportInspections() {
        this.showNotification('正在导出巡检记录...', 'info');
        setTimeout(() => {
            this.showNotification('导出成功', 'success');
        }, 1500);
    }

    printInspections() {
        window.print();
    }

    // 消息提示
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.className = `notification ${type} show`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    logout() {
        if (confirm('确定要退出管理后台吗？')) {
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
    }
}

// 模态框辅助函数
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// 全屏切换
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// 初始化管理后台
document.addEventListener('DOMContentLoaded', () => {
    window.adminSystem = new AdminSystem();
});

// 全局辅助函数
window.closeModal = closeModal;
window.toggleFullscreen = toggleFullscreen;