# AWS 인프라 설정 가이드

## 🎯 현재 상황
- ✅ **RDS MySQL**: `kusj-pj-4-rds` 생성 완료
- 🔄 **S3 버킷**: 생성 필요
- 🔄 **IAM 역할**: 생성 필요
- 🔄 **VPC/보안 그룹**: 설정 필요

## 🚀 AWS 인프라 생성 단계

### **1단계: RDS 연결 정보 확인 (완료)**

#### **AWS 콘솔에서 확인할 정보:**
1. **RDS 서비스** → **데이터베이스** → `kusj-pj-4-rds` 클릭
2. **연결 & 보안** 탭에서:
   - **엔드포인트**: `kusj-pj-4-rds.xxxxx.ap-northeast-2.rds.amazonaws.com`
   - **포트**: 3306
   - **VPC 보안 그룹**: 확인

#### **데이터베이스 생성:**
1. **MySQL Workbench** 또는 **AWS CLI**로 연결
2. 데이터베이스 생성:
```sql
CREATE DATABASE tempus_db;
USE tempus_db;
```

### **2단계: S3 버킷 생성**

#### **AWS 콘솔에서:**
1. **S3 서비스** → **버킷 만들기**
2. **버킷 이름**: `tempus-images-{your-unique-id}` (전역적으로 고유해야 함)
3. **리전**: `ap-northeast-2` (서울)
4. **퍼블릭 액세스 차단**: 모든 퍼블릭 액세스 차단
5. **버킷 버전 관리**: 비활성화 (개발용)

#### **CORS 설정 (나중에):**
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

### **3단계: IAM 역할 생성**

#### **AWS 콘솔에서:**
1. **IAM 서비스** → **역할** → **역할 만들기**
2. **신뢰할 수 있는 엔티티**: Lambda
3. **권한 정책**: 
   - `AWSLambdaBasicExecutionRole` (기본 Lambda 실행 권한)
   - `AmazonRDSFullAccess` (RDS 접근 권한)
   - `AmazonS3FullAccess` (S3 접근 권한)

#### **역할 이름**: `tempus-lambda-execution-role`

### **4단계: VPC 보안 그룹 설정**

#### **RDS 보안 그룹:**
1. **VPC 서비스** → **보안 그룹**
2. RDS가 사용하는 보안 그룹 찾기
3. **인바운드 규칙** 추가:
   - **유형**: MySQL/Aurora
   - **포트**: 3306
   - **소스**: Lambda 함수의 보안 그룹 또는 특정 IP

## 📋 생성 후 확인 체크리스트

### **RDS 설정**
- [ ] 엔드포인트 URL 확인
- [ ] 데이터베이스 `tempus_db` 생성
- [ ] 보안 그룹 설정 확인
- [ ] 연결 테스트

### **S3 설정**
- [ ] 버킷 생성 완료
- [ ] 버킷 이름 기록
- [ ] 리전 확인
- [ ] 퍼블릭 액세스 차단 설정

### **IAM 설정**
- [ ] Lambda 실행 역할 생성
- [ ] RDS 접근 권한 확인
- [ ] S3 접근 권한 확인
- [ ] 역할 ARN 기록

## 🔧 환경변수 설정

### **`.env` 파일 생성:**
```bash
# backend 폴더에서
copy env.example .env
```

### **실제 값으로 수정:**
```env
DB_HOST=kusj-pj-4-rds.xxxxx.ap-northeast-2.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=실제_비밀번호
DB_NAME=tempus_db
S3_BUCKET_NAME=tempus-images-실제_버킷_이름
```

## 🚀 다음 단계

### **인프라 생성 완료 후:**
1. **환경변수 설정**
2. **Serverless Framework 설치**
3. **첫 번째 Lambda 함수 작성**
4. **로컬 테스트**

## 📞 문제 해결

### **RDS 연결 문제:**
- 보안 그룹 설정 확인
- VPC 설정 확인
- 퍼블릭 액세스 활성화 확인

### **S3 접근 문제:**
- IAM 권한 확인
- 버킷 정책 확인
- CORS 설정 확인

### **Lambda 실행 문제:**
- IAM 역할 권한 확인
- 환경변수 설정 확인
- VPC 설정 확인
