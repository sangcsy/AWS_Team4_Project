# TEMPUS - 대학생 커뮤니티 플랫폼

## 🎯 프로젝트 개요

TEMPUS는 대학생들을 위한 온도 기반 커뮤니티 플랫폼입니다.

### ✨ 주요 기능
- **온도 시스템**: 개성, 신뢰도, 재미를 위한 온도 기반 상호작용
- **닉네임 기반 커뮤니케이션**: 익명성과 개성을 동시에
- **마이룸**: 개인 공간 커스터마이징
- **팔로우 시스템**: 관심 있는 사용자와 연결
- **캠퍼스 마켓**: 중고 거래 및 후기 시스템

## 🏗️ 아키텍처

### Backend
- **Node.js + Express + TypeScript**
- **Clean Architecture** 적용
- **JWT 인증** 시스템
- **MySQL 데이터베이스** (로컬 개발용)

### Frontend
- **React + TypeScript + Vite**
- **TailwindCSS** 스타일링
- **Zustand** 상태 관리
- **React Router** 라우팅

## 🚀 개발 환경 설정

### 1. Backend 설정
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend 설정
```bash
cd frontend
npm install
npm run dev
```

### 3. 데이터베이스 설정
```bash
# Docker MySQL 사용 (권장)
docker run --name tempus-mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=tempus_db -p 3306:3306 -d mysql:8.0
```

## 📁 프로젝트 구조

```
AWS_Team4_Project/
├── backend/                 # 백엔드 서버
│   ├── src/
│   │   ├── domain/         # 도메인 로직
│   │   ├── application/    # 애플리케이션 서비스
│   │   ├── infrastructure/ # 인프라스트럭처
│   │   └── interfaces/     # 인터페이스 (컨트롤러, 라우터)
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # 프론트엔드 앱
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── store/         # 상태 관리
│   │   └── services/      # API 서비스
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🔄 개발 워크플로우

### 1단계: 기본 구조 설정 ✅
- 프로젝트 폴더 생성
- 기본 설정 파일 작성

### 2단계: 백엔드 기본 서버 ✅
- Express 서버 설정
- TypeScript 설정
- 기본 라우터 설정

### 3단계: 데이터베이스 연결 🔄
- MySQL 연결 설정
- 기본 테이블 생성
- 연결 테스트

### 4단계: 사용자 인증 시스템
- 회원가입/로그인 API
- JWT 토큰 생성/검증
- 비밀번호 암호화

### 5단계: 핵심 기능 구현
- 게시글/댓글 시스템
- 마이룸/팔로우 기능
- 마켓/후기 시스템

### 6단계: 프론트엔드 구현
- 기본 페이지 구조
- API 연동
- UI/UX 개선

### 7단계: AWS 배포
- RDS 데이터베이스 설정
- Lambda 함수 배포
- S3 이미지 저장소

## 🛠️ 기술 스택

### Backend
- Node.js 18+
- Express 4.x
- TypeScript 5.x
- MySQL 8.0
- JWT
- bcryptjs

### Frontend
- React 18+
- TypeScript 5.x
- Vite 4.x
- TailwindCSS 3.x
- Zustand
- React Router 6

### DevOps
- Docker
- AWS (RDS, Lambda, S3)
- GitHub Actions

## 📝 개발 규칙

### 코드 스타일
- **ESLint + Prettier** 사용
- **Conventional Commits** 형식
- **TypeScript strict mode** 활성화

### 아키텍처 원칙
- **Clean Architecture** 준수
- **Dependency Injection** 사용
- **Interface Segregation** 적용

### 테스트
- **Jest** 테스트 프레임워크
- **TDD** 방식으로 개발
- **테스트 커버리지 80%** 이상 유지

## 🚀 배포

### 개발 환경
- 로컬 MySQL 또는 Docker MySQL
- 로컬 개발 서버

### 프로덕션 환경
- AWS RDS MySQL
- AWS Lambda + API Gateway
- AWS S3 이미지 저장소
- AWS Amplify 프론트엔드 호스팅

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 로그 확인
2. 데이터베이스 연결 상태
3. 환경변수 설정
4. 의존성 패키지 버전

---

**TEMPUS** - 대학생들의 온도가 올라가는 커뮤니티 플랫폼 🌡️