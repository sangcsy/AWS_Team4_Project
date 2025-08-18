# TEMPUS AWS 배포 가이드

## 🚀 단계별 배포 순서

### 1단계: 데이터베이스 설정 (RDS)

#### 1.1 RDS MySQL 인스턴스 생성
```bash
# AWS CLI로 RDS 생성 (또는 콘솔에서 생성)
aws rds create-db-instance \
  --db-instance-identifier tempus-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password your-secure-password \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name your-subnet-group
```

#### 1.2 데이터베이스 연결 테스트
```bash
# 백엔드 디렉토리에서
npm install
cp env.example .env
# .env 파일 수정
npm run dev
```

### 2단계: Lambda 함수 배포

#### 2.1 Serverless Framework 설치
```bash
npm install -g serverless
npm install --save-dev serverless-webpack serverless-offline
```

#### 2.2 환경변수 설정
```bash
# .env 파일 생성
DB_HOST=your-rds-endpoint
DB_USER=admin
DB_PASSWORD=your-secure-password
DB_NAME=tempus_db
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
S3_BUCKET_NAME=tempus-images
```

#### 2.3 Lambda 함수 배포
```bash
# 개발 환경 테스트
serverless offline

# 프로덕션 배포
serverless deploy
```

### 3단계: S3 버킷 설정

#### 3.1 S3 버킷 생성
```bash
aws s3 mb s3://tempus-images --region ap-northeast-2
```

#### 3.2 CORS 설정
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### 4단계: 프론트엔드 배포 (Amplify)

#### 4.1 Amplify CLI 설치
```bash
npm install -g @aws-amplify/cli
amplify configure
```

#### 4.2 Amplify 프로젝트 초기화
```bash
cd frontend
amplify init
amplify add hosting
amplify publish
```

#### 4.3 환경변수 설정
```bash
# Amplify 콘솔에서 환경변수 설정
VITE_API_URL=https://your-api-gateway-url.amazonaws.com/prod
```

## 📋 체크리스트

### 백엔드 준비사항
- [ ] RDS MySQL 인스턴스 생성
- [ ] 데이터베이스 테이블 생성
- [ ] 환경변수 설정
- [ ] Lambda 함수 작성
- [ ] Serverless Framework 설정
- [ ] API Gateway 설정
- [ ] CORS 설정

### 프론트엔드 준비사항
- [ ] API 엔드포인트 URL 변경
- [ ] 환경변수 설정
- [ ] Amplify 설정
- [ ] 빌드 테스트

### AWS 인프라 준비사항
- [ ] VPC 설정
- [ ] 보안 그룹 설정
- [ ] IAM 역할 및 정책
- [ ] CloudWatch 로깅
- [ ] S3 버킷 설정

## 🔧 문제 해결

### 일반적인 문제들

#### 1. CORS 오류
```javascript
// Lambda 함수에서 CORS 헤더 추가
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};
```

#### 2. 데이터베이스 연결 오류
```bash
# 보안 그룹에서 Lambda 함수의 IP 허용
# 또는 VPC 내에서 실행하도록 설정
```

#### 3. 환경변수 문제
```bash
# Lambda 함수에서 환경변수 확인
console.log('DB_HOST:', process.env.DB_HOST);
```

## 📊 모니터링

### CloudWatch 설정
- Lambda 함수 로그 모니터링
- API Gateway 메트릭 확인
- RDS 성능 모니터링

### 알림 설정
- 에러율 알림
- 응답 시간 알림
- 데이터베이스 연결 알림

## 🔒 보안 고려사항

### 1. 환경변수 보안
- AWS Secrets Manager 사용
- 환경별 설정 분리

### 2. 데이터베이스 보안
- VPC 내부에서만 접근 가능
- SSL 연결 강제

### 3. API 보안
- API Gateway 인증 설정
- Rate Limiting 설정

## 💰 비용 최적화

### 1. Lambda 함수
- 메모리 설정 최적화
- 콜드 스타트 최소화

### 2. RDS
- 인스턴스 크기 최적화
- 예약 인스턴스 고려

### 3. S3
- 수명 주기 정책 설정
- 압축 사용

## 🚀 배포 후 확인사항

1. **API 테스트**
   - 회원가입/로그인 테스트
   - 게시글 CRUD 테스트
   - 이미지 업로드 테스트

2. **프론트엔드 테스트**
   - 모든 페이지 로딩 확인
   - API 연동 확인
   - 에러 처리 확인

3. **성능 테스트**
   - 응답 시간 측정
   - 동시 사용자 테스트
   - 부하 테스트

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. CloudWatch 로그
2. Lambda 함수 로그
3. API Gateway 로그
4. 브라우저 개발자 도구
