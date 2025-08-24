<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>랜덤 채팅 매칭 시스템</title>
    <style>
        :root { 
            --bg1: #e0f7ff;
            --bg2: #a5d8ff;
            --bg3: #74c0fc;
            --bg4: #4dabf7;
            --text: #0f172a;
            --muted: #64748b;
            --brand: #1d4ed8;
            --card-bg: rgba(255,255,255,0.9);
            --card-border: rgba(255,255,255,0.3);
            --radius: 16px;
            --shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body, input, button, textarea {
            font-family: 'Noto Sans KR', sans-serif;
        }

        body {
            background: linear-gradient(135deg, var(--bg1) 0%, var(--bg2) 50%, var(--bg3) 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            color: white;
            margin-bottom: 2rem;
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }

        .main-content {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .sidebar {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .card {
            background: var(--card-bg);
            backdrop-filter: blur(10px);
            border-radius: var(--radius);
            padding: 2rem;
            box-shadow: var(--shadow);
            border: 1px solid var(--card-border);
        }

        .card h3 {
            color: var(--text);
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            color: var(--text);
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .radio-group {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .radio-option {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            background: rgba(255,255,255,0.5);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }

        .radio-option:hover {
            background: rgba(255,255,255,0.8);
        }

        .radio-option input[type="radio"]:checked + label {
            color: var(--brand);
            font-weight: 700;
        }

        .radio-option:has(input[type="radio"]:checked) {
            background: rgba(29, 78, 216, 0.1);
            border-color: var(--brand);
        }

        .radio-option input[type="radio"] {
            margin: 0;
        }

        .btn {
            background: var(--brand);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: var(--radius);
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
        }

        .btn:hover {
            background: #1e40af;
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(29, 78, 216, 0.3);
        }

        .btn:disabled {
            background: var(--muted);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        .btn-danger {
            background: #ef4444;
        }

        .btn-danger:hover {
            background: #dc2626;
        }

        .status-card {
            text-align: center;
        }

        .status-indicator {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin: 0 auto 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: white;
            background: var(--muted);
        }

        .status-indicator.searching {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            animation: pulse 2s infinite;
        }

        .status-indicator.matched {
            background: linear-gradient(135deg, #10b981, #059669);
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        .chat-area {
            background: var(--card-bg);
            border-radius: var(--radius);
            height: 900px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .chat-header {
            background: var(--brand);
            color: white;
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .profile-info {
            font-size: 0.9rem;
            opacity: 0.9;
        }

        .chat-messages {
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
            background: #f8fafc;
        }

        .message {
            margin-bottom: 1rem;
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
        }

        .message.own {
            flex-direction: row-reverse;
        }

        .message-bubble {
            max-width: 70%;
            padding: 0.75rem 1rem;
            border-radius: 1rem;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .message.own .message-bubble {
            background: var(--brand);
            color: white;
        }

        .message-time {
            font-size: 0.75rem;
            color: var(--muted);
            margin-top: 0.25rem;
        }

        .chat-input {
            display: flex;
            padding: 1rem;
            background: white;
            border-top: 1px solid #e2e8f0;
        }

        .chat-input input {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin-right: 0.5rem;
            font-size: 1rem;
        }

        .chat-input button {
            padding: 0.75rem 1.5rem;
            background: var(--brand);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }

        .active-chats {
            max-height: 300px;
            overflow-y: auto;
        }

        .chat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: rgba(255,255,255,0.5);
            border-radius: 8px;
            margin-bottom: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .chat-item:hover {
            background: rgba(255,255,255,0.8);
        }

        .chat-item.active {
            background: rgba(29, 78, 216, 0.1);
            border: 1px solid var(--brand);
        }

        .profile-stage {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            background: var(--brand);
            color: white;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .hidden {
            display: none;
        }

        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .radio-group {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎲 랜덤 채팅</h1>
            <p>새로운 친구들과 익명으로 대화해보세요</p>
        </div>

        <div class="main-content">
            <div class="sidebar">
                <!-- 매칭 설정 -->
                <div class="card">
                    <h3>매칭 설정</h3>
                    <div class="form-group">
                        <label>선호 성별</label>
                        <div class="radio-group">
                            <div class="radio-option">
                                <input type="radio" id="gender-all" name="gender" value="all" checked>
                                <label for="gender-all">모두</label>
                            </div>
                            <div class="radio-option">
                                <input type="radio" id="gender-male" name="gender" value="male">
                                <label for="gender-male">남성</label>
                            </div>
                            <div class="radio-option">
                                <input type="radio" id="gender-female" name="gender" value="female">
                                <label for="gender-female">여성</label>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>매칭 알고리즘</label>
                        <div class="radio-group">
                            <div class="radio-option">
                                <input type="radio" id="algo-random" name="algorithm" value="random" checked>
                                <label for="algo-random">랜덤</label>
                            </div>
                            <div class="radio-option">
                                <input type="radio" id="algo-tempus" name="algorithm" value="tempus">
                                <label for="algo-tempus">온도 기반</label>
                            </div>
                        </div>
                    </div>

                    <button class="btn" id="startMatching">매칭 시작</button>
                    <button class="btn btn-danger hidden" id="stopMatching">매칭 중단</button>
                </div>

                <!-- 매칭 상태 -->
                <div class="card status-card">
                    <div class="status-indicator" id="statusIndicator">⏳</div>
                    <h3 id="statusText">매칭 대기 중</h3>
                    <p id="statusDesc">설정을 완료하고 매칭을 시작하세요</p>
                </div>

                <!-- 활성 채팅방 -->
                <div class="card">
                    <h3>활성 채팅방 (<span id="chatCount">0</span>)</h3>
                    <div class="active-chats" id="activeChatsList">
                        <p style="text-align: center; color: var(--muted); padding: 2rem;">
                            아직 활성화된 채팅방이 없습니다
                        </p>
                    </div>
                </div>
            </div>

            <!-- 채팅 영역 -->
            <div class="chat-area" id="chatArea">
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--muted);">
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">💬</div>
                        <h3>채팅방을 선택하세요</h3>
                        <p>매칭이 성사되면 여기서 대화할 수 있습니다</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        class RandomChatSystem {
            constructor() {
                this.isMatching = false;
                this.activeChats = new Map();
                this.currentChatId = null;
                this.messageCount = new Map();
                this.init();
            }

            init() {
                this.bindEvents();
                this.updateUI();
            }

            bindEvents() {
                document.getElementById('startMatching').addEventListener('click', () => this.startMatching());
                document.getElementById('stopMatching').addEventListener('click', () => this.stopMatching());
            }

            startMatching() {
                this.isMatching = true;
                this.updateMatchingStatus('searching', '매칭 중...', '조건에 맞는 상대를 찾고 있습니다');
                
                document.getElementById('startMatching').classList.add('hidden');
                document.getElementById('stopMatching').classList.remove('hidden');

                // 시뮬레이션: 3-8초 후 매칭 성공
                setTimeout(() => {
                    if (this.isMatching) {
                        this.createMatch();
                    }
                }, Math.random() * 5000 + 3000);
            }

            stopMatching() {
                this.isMatching = false;
                this.updateMatchingStatus('waiting', '매칭 대기 중', '설정을 완료하고 매칭을 시작하세요');
                
                document.getElementById('startMatching').classList.remove('hidden');
                document.getElementById('stopMatching').classList.add('hidden');
            }

            createMatch() {
                const chatId = 'chat_' + Date.now();
                const partner = this.generateRandomPartner();
                
                this.activeChats.set(chatId, {
                    id: chatId,
                    partner: partner,
                    messages: [],
                    createdAt: new Date(),
                    stage: 1,
                    messageCount: 0
                });

                this.messageCount.set(chatId, 0);
                this.updateMatchingStatus('matched', '매칭 성공!', '새로운 대화 상대를 찾았습니다');
                this.updateActiveChatsList();
                this.stopMatching();

                // 자동으로 새 채팅방 열기
                setTimeout(() => {
                    this.openChat(chatId);
                }, 1000);
            }

            generateRandomPartner() {
                const names = ['익명의 친구', '신비한 상대', '새로운 인연', '흥미로운 사람'];
                const departments = ['컴퓨터공학과', '경영학과', '심리학과', '디자인학과', '의학과'];
                const ages = [20, 21, 22, 23, 24, 25];
                const mbtis = ['ENFP', 'INFP', 'ENFJ', 'INFJ', 'ENTP', 'INTP'];
                const hobbies = ['영화감상', '독서', '운동', '음악감상', '여행', '게임'];

                return {
                    name: names[Math.floor(Math.random() * names.length)],
                    department: departments[Math.floor(Math.random() * departments.length)],
                    gender: Math.random() > 0.5 ? '남성' : '여성',
                    age: ages[Math.floor(Math.random() * ages.length)],
                    mbti: mbtis[Math.floor(Math.random() * mbtis.length)],
                    hobby: hobbies[Math.floor(Math.random() * hobbies.length)],
                    tempus: Math.floor(Math.random() * 100) + 1
                };
            }

            updateMatchingStatus(status, title, description) {
                const indicator = document.getElementById('statusIndicator');
                const titleEl = document.getElementById('statusText');
                const descEl = document.getElementById('statusDesc');

                indicator.className = 'status-indicator ' + status;
                titleEl.textContent = title;
                descEl.textContent = description;

                switch(status) {
                    case 'waiting':
                        indicator.textContent = '⏳';
                        break;
                    case 'searching':
                        indicator.textContent = '🔍';
                        break;
                    case 'matched':
                        indicator.textContent = '✨';
                        break;
                }
            }

            updateActiveChatsList() {
                const container = document.getElementById('activeChatsList');
                const count = document.getElementById('chatCount');
                
                count.textContent = this.activeChats.size;

                if (this.activeChats.size === 0) {
                    container.innerHTML = `
                        <p style="text-align: center; color: var(--muted); padding: 2rem;">
                            아직 활성화된 채팅방이 없습니다
                        </p>
                    `;
                    return;
                }

                container.innerHTML = '';
                this.activeChats.forEach((chat, chatId) => {
                    const chatItem = document.createElement('div');
                    chatItem.className = 'chat-item';
                    if (chatId === this.currentChatId) {
                        chatItem.classList.add('active');
                    }

                    const profileInfo = this.getProfileInfo(chat);
                    
                    chatItem.innerHTML = `
                        <div>
                            <div style="font-weight: 600; margin-bottom: 0.25rem;">
                                ${chat.partner.name}
                                <span class="profile-stage">${chat.stage}단계</span>
                            </div>
                            <div style="font-size: 0.9rem; color: var(--muted);">
                                ${profileInfo} • 메시지 ${chat.messageCount}개
                            </div>
                        </div>
                        <div style="text-align: right; font-size: 0.8rem; color: var(--muted);">
                            ${this.getTimeAgo(chat.createdAt)}
                        </div>
                    `;

                    chatItem.addEventListener('click', () => this.openChat(chatId));
                    container.appendChild(chatItem);
                });
            }

            getProfileInfo(chat) {
                switch(chat.stage) {
                    case 1:
                        return `${chat.partner.department} • ${chat.partner.gender}`;
                    case 2:
                        return `${chat.partner.department} • ${chat.partner.age}세 • ${chat.partner.mbti}`;
                    case 3:
                        return `${chat.partner.name} • ${chat.partner.age}세 • ${chat.partner.hobby}`;
                    default:
                        return '정보 비공개';
                }
            }

            getTimeAgo(date) {
                const now = new Date();
                const diff = now - date;
                const minutes = Math.floor(diff / 60000);
                
                if (minutes < 1) return '방금 전';
                if (minutes < 60) return `${minutes}분 전`;
                
                const hours = Math.floor(minutes / 60);
                if (hours < 24) return `${hours}시간 전`;
                
                const days = Math.floor(hours / 24);
                return `${days}일 전`;
            }

            openChat(chatId) {
                this.currentChatId = chatId;
                const chat = this.activeChats.get(chatId);
                
                if (!chat) return;

                this.renderChatArea(chat);
                this.updateActiveChatsList();
            }

            renderChatArea(chat) {
                const chatArea = document.getElementById('chatArea');
                const profileInfo = this.getProfileInfo(chat);

                chatArea.innerHTML = `
                    <div class="chat-header">
                        <div>
                            <div style="font-weight: 600;">${chat.partner.name}</div>
                            <div class="profile-info">${profileInfo}</div>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <span class="profile-stage">${chat.stage}단계</span>
                            <button onclick="window.chatSystem.blockUser('${chat.id}')" style="background: #ef4444; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">차단</button>
                        </div>
                    </div>
                    <div class="chat-messages" id="chatMessages">
                        ${this.renderMessages(chat.messages)}
                    </div>
                    <div class="chat-input">
                        <input type="text" id="messageInput" placeholder="메시지를 입력하세요..." onkeypress="if(event.key==='Enter') window.chatSystem.sendMessage()">
                        <button onclick="window.chatSystem.sendMessage()">전송</button>
                    </div>
                `;

                // 메시지 영역 스크롤을 맨 아래로
                const messagesContainer = document.getElementById('chatMessages');
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }

            renderMessages(messages) {
                return messages.map(msg => `
                    <div class="message ${msg.sender === 'me' ? 'own' : ''}">
                        <div class="message-bubble">
                            ${msg.text}
                            <div class="message-time">${msg.time}</div>
                        </div>
                    </div>
                `).join('');
            }

            sendMessage() {
                const input = document.getElementById('messageInput');
                const text = input.value.trim();
                
                if (!text || !this.currentChatId) return;

                const chat = this.activeChats.get(this.currentChatId);
                const now = new Date();
                
                // 내 메시지 추가
                chat.messages.push({
                    sender: 'me',
                    text: text,
                    time: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                });

                chat.messageCount++;
                this.updateProfileStage(chat);

                input.value = '';
                this.renderChatArea(chat);
                this.updateActiveChatsList();

                // 상대방 자동 응답 (시뮬레이션)
                setTimeout(() => {
                    this.simulatePartnerResponse(chat);
                }, Math.random() * 3000 + 1000);
            }

            simulatePartnerResponse(chat) {
                const responses = [
                    '안녕하세요! 반가워요 😊',
                    '오늘 하루 어떠셨나요?',
                    '저도 그렇게 생각해요!',
                    '흥미로운 이야기네요',
                    '더 자세히 알려주세요',
                    '정말 재미있어요 ㅎㅎ',
                    '저는 어떤가요?',
                    '좋은 생각이에요!'
                ];

                const response = responses[Math.floor(Math.random() * responses.length)];
                const now = new Date();

                chat.messages.push({
                    sender: 'partner',
                    text: response,
                    time: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                });

                chat.messageCount++;
                this.updateProfileStage(chat);

                if (this.currentChatId === chat.id) {
                    this.renderChatArea(chat);
                }
                this.updateActiveChatsList();
            }

            updateProfileStage(chat) {
                if (chat.messageCount >= 20 && chat.stage < 3) {
                    chat.stage = 3;
                } else if (chat.messageCount >= 10 && chat.stage < 2) {
                    chat.stage = 2;
                } else if (chat.messageCount >= 5 && chat.stage < 1) {
                    chat.stage = 1;
                }
            }

            blockUser(chatId) {
                if (confirm('이 사용자를 차단하시겠습니까? 채팅방이 삭제됩니다.')) {
                    this.activeChats.delete(chatId);
                    
                    if (this.currentChatId === chatId) {
                        this.currentChatId = null;
                        document.getElementById('chatArea').innerHTML = `
                            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--muted);">
                                <div style="text-align: center;">
                                    <div style="font-size: 3rem; margin-bottom: 1rem;">💬</div>
                                    <h3>채팅방을 선택하세요</h3>
                                    <p>매칭이 성사되면 여기서 대화할 수 있습니다</p>
                                </div>
                            </div>
                        `;
                    }
                    
                    this.updateActiveChatsList();
                }
            }

            updateUI() {
                this.updateActiveChatsList();
            }
        }

        // 시스템 초기화
        const chatSystem = new RandomChatSystem();
        
        // 전역 함수로 등록
        window.chatSystem = chatSystem;
    </script>
<script>(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'9741e958e4a5ea17',t:'MTc1NjAyODY3MS4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();</script></body>
</html>
