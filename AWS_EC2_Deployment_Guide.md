# 🚀 AWS EC2 배포 가이드 - TEMPUS 프로젝트

## 📋 사전 준비사항

### 1. AWS 계정 및 권한
- AWS 계정이 필요합니다
- EC2, RDS, S3, IAM 서비스에 대한 권한이 필요합니다

### 2. 프로젝트 준비
- ✅ 프론트엔드 프로덕션 빌드 완료 (`frontend/dist/` 폴더)
- ✅ 백엔드 소스코드 준비
- ✅ 환경 변수 파일 준비

## 🖥️ 1단계: EC2 인스턴스 생성

### 1.1 EC2 인스턴스 생성
1. **AWS 콘솔** → **EC2** → **인스턴스 시작**
2. **인스턴스 세부 정보**:
   - 이름: `tempus-production-server`
   - AMI: `Amazon Linux 2023` (무료 티어)
   - 인스턴스 유형: `t2.micro` (무료 티어) 또는 `t3.small`
   - 키 페어: 새로 생성 (`.pem` 파일 다운로드)

### 1.2 보안 그룹 설정
```
인바운드 규칙:
- SSH (22): 0.0.0.0/0 (개발용, 프로덕션에서는 IP 제한 권장)
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- 커스텀 TCP (3000): 0.0.0.0/0 (Node.js 서버)
```

### 1.3 스토리지 설정
- 루트 볼륨: 20GB (gp3)
- 추가 볼륨: 필요시 EBS 볼륨 추가

## 🔧 2단계: EC2 인스턴스 초기 설정

### 2.1 SSH 연결
```bash
# Windows PowerShell에서
ssh -i "tempus-key.pem" ec2-user@[YOUR_EC2_PUBLIC_IP]

# 또는 Git Bash에서
ssh -i "tempus-key.pem" ec2-user@[YOUR_EC2_PUBLIC_IP]
```

### 2.2 시스템 업데이트
```bash
sudo yum update -y
sudo yum install -y git
```

### 2.3 Node.js 설치
```bash
# Node.js 18.x 설치
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 버전 확인
node --version
npm --version
```

### 2.4 MySQL 클라이언트 설치
```bash
sudo yum install -y mysql
```

### 2.5 PM2 설치 (프로세스 관리)
```bash
sudo npm install -g pm2
```

## 🗄️ 3단계: RDS 데이터베이스 설정

### 3.1 RDS 인스턴스 생성
1. **AWS 콘솔** → **RDS** → **데이터베이스 생성**
2. **설정**:
   - 엔진: MySQL 8.0
   - 템플릿: 프리 티어
   - 인스턴스 식별자: `tempus-db`
   - 마스터 사용자명: `admin`
   - 마스터 비밀번호: `[강력한 비밀번호]`

### 3.2 보안 그룹 설정
```
인바운드 규칙:
- MySQL/Aurora (3306): EC2 보안 그룹 ID
```

### 3.3 데이터베이스 연결 정보
```bash
# EC2에서 데이터베이스 연결 테스트
mysql -h [RDS_ENDPOINT] -u admin -p
```

## 📁 4단계: 프로젝트 배포

### 4.1 프로젝트 클론
```bash
cd /home/ec2-user
git clone [YOUR_GITHUB_REPO_URL] tempus
cd tempus
```

### 4.2 환경 변수 설정
```bash
# 백엔드 환경 변수
cd backend
cp .env.example .env

# .env 파일 편집
nano .env
```

```env
# Database Configuration
DB_HOST=[RDS_ENDPOINT]
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=[YOUR_DB_PASSWORD]
DB_NAME=tempus

# JWT Configuration
JWT_SECRET=[YOUR_JWT_SECRET]
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=production

# File Upload Configuration
UPLOAD_PATH=uploads
MAX_FILE_SIZE=10485760
```

### 4.3 백엔드 의존성 설치 및 실행
```bash
cd backend
npm install
npm run build  # TypeScript 빌드 시도
# 또는 직접 실행
npm start
```

### 4.4 프론트엔드 배포
```bash
cd ../frontend
npm install
npm run build:prod

# dist 폴더를 웹 서버 디렉토리로 복사
sudo mkdir -p /var/www/tempus
sudo cp -r dist/* /var/www/tempus/
```

## 🌐 5단계: Nginx 웹 서버 설정

### 5.1 Nginx 설치
```bash
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5.2 Nginx 설정 파일 생성
```bash
sudo nano /etc/nginx/conf.d/tempus.conf
```

```nginx
server {
    listen 80;
    server_name [YOUR_EC2_PUBLIC_IP] [YOUR_DOMAIN];

    # 프론트엔드 정적 파일 서빙
    location / {
        root /var/www/tempus;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # 백엔드 API 프록시
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 파일 업로드 경로
    location /uploads/ {
        alias /home/ec2-user/tempus/backend/uploads/;
    }
}
```

### 5.3 Nginx 설정 테스트 및 재시작
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 6단계: SSL/HTTPS 설정

### 6.1 Certbot 설치 (Let's Encrypt)
```bash
sudo yum install -y certbot python3-certbot-nginx
```

### 6.2 SSL 인증서 발급
```bash
# 도메인이 있는 경우
sudo certbot --nginx -d [YOUR_DOMAIN]

# 도메인이 없는 경우 (IP 기반)
sudo certbot --nginx --agree-tos --email [YOUR_EMAIL] --domains [YOUR_EC2_PUBLIC_IP]
```

## 🚀 7단계: 서비스 자동 시작 설정

### 7.1 PM2 설정
```bash
cd /home/ec2-user/tempus/backend
pm2 start npm --name "tempus-backend" -- start
pm2 save
pm2 startup
```

### 7.2 시스템 서비스 등록
```bash
sudo nano /etc/systemd/system/tempus.service
```

```ini
[Unit]
Description=TEMPUS Backend Service
After=network.target

[Service]
Type=forking
User=ec2-user
WorkingDirectory=/home/ec2-user/tempus/backend
ExecStart=/usr/bin/pm2 start npm --name "tempus-backend" -- start
ExecReload=/usr/bin/pm2 reload tempus-backend
ExecStop=/usr/bin/pm2 stop tempus-backend
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable tempus
sudo systemctl start tempus
```

## 🧪 8단계: 배포 테스트

### 8.1 서비스 상태 확인
```bash
# PM2 상태 확인
pm2 status

# Nginx 상태 확인
sudo systemctl status nginx

# 백엔드 서비스 상태 확인
sudo systemctl status tempus

# 포트 사용 확인
sudo netstat -tlnp
```

### 8.2 웹사이트 접속 테스트
- 브라우저에서 `http://[YOUR_EC2_PUBLIC_IP]` 접속
- API 엔드포인트 테스트: `http://[YOUR_EC2_PUBLIC_IP]/api/health`

## 📊 9단계: 모니터링 및 로그

### 9.1 로그 확인
```bash
# PM2 로그
pm2 logs tempus-backend

# Nginx 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 시스템 로그
sudo journalctl -u tempus -f
```

### 9.2 성능 모니터링
```bash
# 시스템 리소스 사용량
htop
free -h
df -h

# Node.js 프로세스 모니터링
pm2 monit
```

## 🔧 10단계: 문제 해결

### 10.1 일반적인 문제들
1. **포트 충돌**: `sudo netstat -tlnp | grep :3000`
2. **권한 문제**: `sudo chown -R ec2-user:ec2-user /home/ec2-user/tempus`
3. **방화벽 문제**: 보안 그룹 설정 확인
4. **데이터베이스 연결**: RDS 보안 그룹 및 엔드포인트 확인

### 10.2 로그 분석
```bash
# 백엔드 로그
pm2 logs tempus-backend --lines 100

# Nginx 에러 로그
sudo tail -f /var/log/nginx/error.log

# 시스템 로그
sudo journalctl -u tempus -f
```

## 📝 11단계: 배포 후 설정

### 11.1 환경 변수 업데이트
프론트엔드의 API 엔드포인트를 EC2 IP로 변경:
```typescript
// frontend/src/config/api.ts
production: {
  baseUrl: 'http://[YOUR_EC2_PUBLIC_IP]',
  uploadUrl: 'http://[YOUR_EC2_PUBLIC_IP]',
  wsUrl: 'http://[YOUR_EC2_PUBLIC_IP]'
}
```

### 11.2 재배포
```bash
cd /home/ec2-user/tempus/frontend
npm run build:prod
sudo cp -r dist/* /var/www/tempus/
```

## 🎯 다음 단계: Lambda + API Gateway

EC2 배포가 완료되면 다음 단계로 AWS Lambda + API Gateway를 통한 서버리스 배포를 진행할 수 있습니다.

---

## 📞 지원 및 문의

배포 과정에서 문제가 발생하면:
1. 로그 확인
2. 서비스 상태 점검
3. 보안 그룹 설정 확인
4. 환경 변수 설정 확인

**Happy Deploying! 🚀**
