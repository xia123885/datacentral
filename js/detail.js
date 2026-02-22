// 数据中心巡检系统 - 详情页面逻辑
class InspectionDetailSystem {
    constructor() {
        this.currentRoom = null;
        this.uploadedFiles = [];
        this.inspectionHistory = {};
        this.rooms = [];
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupRoomFromUrl();
        this.setupEventListeners();
    }
    
    loadData() {
        const savedHistory = localStorage.getItem('inspectionHistory');
        const savedRooms = localStorage.getItem('rooms');
        
        if (savedHistory) {
            this.inspectionHistory = JSON.parse(savedHistory);
        }
        
        if (savedRooms) {
            this.rooms = JSON.parse(savedRooms);
        } else {
            // 默认房间数据
            this.rooms = [
                { id: 'room-1', name: '明理楼8210', type: '机房', status: 'unchecked' },
                { id: 'room-2', name: '明理楼8211', type: '机房', status: 'unchecked' },
                { id: 'room-3', name: '明理楼8108', type: '机房', status: 'unchecked' },
                { id: 'room-4', name: '明理楼8112', type: 'UPS机房', status: 'unchecked' },
                { id: 'room-5', name: '明理楼8110', type: 'UPS机房', status: 'unchecked' }
            ];
        }
    }
    
    setupRoomFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('roomId');
        
        if (roomId) {
            this.currentRoom = this.rooms.find(room => room.id === roomId);
            if (this.currentRoom) {
                this.updateRoomInfo();
                this.renderHistory();
            } else {
                this.showMessage('未找到指定的机房', 'error');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }
        } else {
            // 如果不是机房详情页，可能是查看全部记录或其他页面
            const viewType = urlParams.get('view');
            if (viewType === 'all') {
                document.getElementById('room-name').textContent = '全部巡检记录';
                document.getElementById('room-current-status').style.display = 'none';
                this.renderAllHistory();
            }
        }
    }
    
    updateRoomInfo() {
        document.getElementById('room-name').textContent = this.currentRoom.name;
        
        const statusBadge = document.getElementById('room-current-status');
        statusBadge.textContent = this.getStatusText(this.currentRoom.status);
        statusBadge.className = `status-badge ${this.getStatusClass(this.currentRoom.status)}`;
        
        this.updateStatusOptions();
    }
    
    updateStatusOptions() {
        document.querySelectorAll('.status-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        if (this.currentRoom.status !== 'unchecked') {
            const selectedOption = document.querySelector(`.status-option[data-status="${this.currentRoom.status}"]`);
            if (selectedOption) {
                selectedOption.classList.add('selected');
                document.getElementById('inspection-status').value = this.currentRoom.status;
            }
        }
    }
    
    renderHistory() {
        const historyList = document.getElementById('history-list');
        const emptyHistory = document.getElementById('empty-history');
        const roomHistory = this.inspectionHistory[this.currentRoom.id];
        
        if (!roomHistory || roomHistory.length === 0) {
            emptyHistory.style.display = 'block';
            historyList.innerHTML = '<div class="empty-history" id="empty-history"><i class="fas fa-history"></i><p>暂无巡检记录</p></div>';
            return;
        }
        
        emptyHistory.style.display = 'none';
        
        const sortedHistory = [...roomHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        let historyHTML = '';
        
        sortedHistory.forEach((record, index) => {
            const timeStr = new Date(record.timestamp).toLocaleString('zh-CN');
            const statusText = this.getStatusText(record.status);
            const statusClass = this.getStatusClass(record.status);
            
            historyHTML += `
                <div class="history-item">
                    <div class="history-header">
                        <div>
                            <strong>巡检员：</strong>${record.inspector || '夏秀平'}
                            <span class="status-badge ${statusClass}" style="margin-left: 10px;">${statusText}</span>
                        </div>
                        <div style="color: #888; font-size: 14px;">${timeStr}</div>
                    </div>
                    ${record.notes ? `<p style="margin-top: 10px;">${record.notes}</p>` : ''}
                    ${record.images && record.images.length > 0 ? `
                        <div class="history-images">
                            ${record.images.map((img, imgIndex) => `
                                <img src="${img}" alt="巡检图片" class="history-image" data-history-index="${index}" data-image-index="${imgIndex}">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        historyList.innerHTML = historyHTML;
        
        document.querySelectorAll('.history-image').forEach(img => {
            img.addEventListener('click', (e) => {
                this.openImageModal(e.target.src);
            });
        });
    }
    
    renderAllHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        let allActivities = [];
        
        for (const roomId in this.inspectionHistory) {
            if (this.inspectionHistory[roomId]) {
                this.inspectionHistory[roomId].forEach(record => {
                    allActivities.push({
                        roomId,
                        roomName: this.getRoomNameById(roomId),
                        ...record
                    });
                });
            }
        }
        
        allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        if (allActivities.length === 0) {
            historyList.innerHTML = '<div class="empty-history"><i class="fas fa-history"></i><p>暂无巡检记录</p></div>';
            return;
        }
        
        let historyHTML = '';
        
        allActivities.forEach((record, index) => {
            const timeStr = new Date(record.timestamp).toLocaleString('zh-CN');
            const statusText = this.getStatusText(record.status);
            const statusClass = this.getStatusClass(record.status);
            
            historyHTML += `
                <div class="history-item">
                    <div class="history-header">
                        <div>
                            <strong>${record.roomName}</strong> - 巡检员：${record.inspector || '夏秀平'}
                            <span class="status-badge ${statusClass}" style="margin-left: 10px;">${statusText}</span>
                        </div>
                        <div style="color: #888; font-size: 14px;">${timeStr}</div>
                    </div>
                    ${record.notes ? `<p style="margin-top: 10px;">${record.notes}</p>` : ''}
                    ${record.images && record.images.length > 0 ? `
                        <div class="history-images">
                            ${record.images.map((img, imgIndex) => `
                                <img src="${img}" alt="巡检图片" class="history-image" data-history-index="${index}" data-image-index="${imgIndex}">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        historyList.innerHTML = historyHTML;
        
        document.querySelectorAll('.history-image').forEach(img => {
            img.addEventListener('click', (e) => {
                this.openImageModal(e.target.src);
            });
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
        // 状态选项
        document.querySelectorAll('.status-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.status-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                option.classList.add('selected');
                document.getElementById('inspection-status').value = option.dataset.status;
            });
        });
        
        // 文件上传
        const fileUploadArea = document.getElementById('file-upload-area');
        const fileInput = document.getElementById('file-input');
        
        fileUploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.style.borderColor = '#3949ab';
            fileUploadArea.style.backgroundColor = '#f0f2ff';
        });
        
        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.style.borderColor = '#ddd';
            fileUploadArea.style.backgroundColor = '';
        });
        
        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.style.borderColor = '#ddd';
            fileUploadArea.style.backgroundColor = '';
            
            const files = e.dataTransfer.files;
            this.handleFileUpload(files);
        });
        
        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
        
        // 提交巡检记录
        document.getElementById('submit-inspection').addEventListener('click', () => {
            this.submitInspection();
        });
        
        // 图片模态框
        document.getElementById('modal-close').addEventListener('click', () => {
            document.getElementById('image-modal').style.display = 'none';
        });
        
        document.getElementById('image-modal').addEventListener('click', (e) => {
            if (e.target.id === 'image-modal') {
                document.getElementById('image-modal').style.display = 'none';
            }
        });
    }
    
    handleFileUpload(files) {
        const uploadedImagesContainer = document.getElementById('uploaded-images');
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            if (!file.type.match('image.*')) {
                this.showMessage('只能上传图片文件', 'error');
                continue;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                this.showMessage('文件大小不能超过5MB', 'error');
                continue;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const imageData = e.target.result;
                this.uploadedFiles.push(imageData);
                
                this.renderUploadedImages();
            };
            
            reader.readAsDataURL(file);
        }
        
        document.getElementById('file-input').value = '';
    }
    
    renderUploadedImages() {
        const uploadedImagesContainer = document.getElementById('uploaded-images');
        uploadedImagesContainer.innerHTML = '';
        
        this.uploadedFiles.forEach((imageData, index) => {
            const imagePreview = document.createElement('div');
            imagePreview.className = 'image-preview';
            
            imagePreview.innerHTML = `
                <img src="${imageData}" alt="上传的图片">
                <button class="image-remove" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            uploadedImagesContainer.appendChild(imagePreview);
            
            imagePreview.querySelector('.image-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(e.target.closest('.image-remove').dataset.index);
                this.removeUploadedImage(idx);
            });
            
            imagePreview.querySelector('img').addEventListener('click', () => {
                this.openImageModal(imageData);
            });
        });
    }
    
    removeUploadedImage(index) {
        this.uploadedFiles.splice(index, 1);
        this.renderUploadedImages();
    }
    
    openImageModal(imageSrc) {
        document.getElementById('modal-image').src = imageSrc;
        document.getElementById('image-modal').style.display = 'flex';
    }
    
    submitInspection() {
        const status = document.getElementById('inspection-status').value;
        const notes = document.getElementById('inspection-notes').value.trim();
        
        if (!status) {
            this.showMessage('请选择巡检状态', 'error');
            return;
        }
        
        if (!this.currentRoom) {
            this.showMessage('无法确定当前机房', 'error');
            return;
        }
        
        // 创建巡检记录
        const inspectionRecord = {
            timestamp: new Date().toISOString(),
            inspector: '夏秀平',
            status: status,
            notes: notes,
            images: [...this.uploadedFiles]
        };
        
        // 更新房间状态
        this.currentRoom.status = status;
        
        // 保存巡检记录
        if (!this.inspectionHistory[this.currentRoom.id]) {
            this.inspectionHistory[this.currentRoom.id] = [];
        }
        
        this.inspectionHistory[this.currentRoom.id].push(inspectionRecord);
        
        // 保存到本地存储
        this.saveData();
        
        // 更新UI
        this.updateRoomInfo();
        this.renderHistory();
        
        // 重置表单
        this.resetForm();
        
        // 显示成功消息
        this.showMessage('巡检记录提交成功！', 'success');
    }
    
    resetForm() {
        document.getElementById('inspection-status').value = '';
        document.getElementById('inspection-notes').value = '';
        document.getElementById('uploaded-images').innerHTML = '';
        this.uploadedFiles = [];
        
        document.querySelectorAll('.status-option').forEach(option => {
            option.classList.remove('selected');
        });
    }
    
    saveData() {
        localStorage.setItem('inspectionHistory', JSON.stringify(this.inspectionHistory));
        localStorage.setItem('rooms', JSON.stringify(this.rooms));
    }
    
    showMessage(text, type) {
        // 移除现有消息
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.inspectionDetailSystem = new InspectionDetailSystem();
});