const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 443;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 로깅 미들웨어
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('요청 데이터:', req.body);
    next();
});

// 가상의 주간 보고서 생성 함수
function generateWeeklyReport(userId, userQuery, feedback = null) {
    const currentDate = new Date().toLocaleDateString('ko-KR');
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toLocaleDateString('ko-KR');
    
    if (feedback) {
        // 피드백이 있을 경우 수정된 보고서 생성
        return `# 📊 주간 개발 보고서 (수정됨)
## 📅 보고 기간: ${weekStartStr} - ${currentDate}
**담당자:** ${userId}

---

## 🎯 주요 성과
### ✅ 완료된 작업
- **SWDP ChatOps 확장 프로그램 개발 완료**
  - VSCode 확장 프로그램 아키텍처 설계 및 구현
  - 주간 보고서 자동 생성 기능 개발
  - 사용자 피드백 기반 보고서 수정 기능 구현
  - 인증 시스템 통합 및 보안 강화

- **백엔드 API 서버 구축**
  - Express.js 기반 가상 백엔드 서버 구현
  - /devportal/api/v1/extension/message-async 엔드포인트 개발
  - CORS 설정 및 보안 미들웨어 적용

### 🔄 진행 중인 작업
- **확장 프로그램 최적화**
  - 성능 튜닝 및 메모리 사용량 최적화
  - 사용자 경험 개선을 위한 UI/UX 리팩토링

## 📈 기술적 성취
- **개발 환경 구성**: Webpack 빌드 시스템 최적화
- **패키지 관리**: VSCE를 통한 확장 프로그램 패키징 및 배포
- **코드 품질**: ESLint 및 타입스크립트 타입 정의 적용

## 🔍 향후 계획
### 다음 주 목표
1. **확장 프로그램 고도화**
   - 다국어 지원 기능 추가
   - 테마 커스터마이징 옵션 제공
   
2. **API 서버 확장**
   - 실제 데이터베이스 연동
   - 사용자 권한 관리 시스템 구축

3. **문서화 및 테스트**
   - 사용자 매뉴얼 작성
   - 단위 테스트 및 통합 테스트 구현

## 💡 개선사항 및 학습 내용
**사용자 피드백 반영:**
${feedback}

**기술적 학습:**
- VSCode Extension API의 깊이 있는 이해
- Node.js 기반 서버 개발 경험 확대
- 실시간 피드백 처리 로직 구현

## 📊 통계
- **개발 시간:** 약 40시간
- **커밋 수:** 15개
- **해결된 이슈:** 8개
- **코드 리뷰:** 3회

---
*이 보고서는 SWDP ChatOps Extension에 의해 자동 생성되었습니다.*
*보고서 생성일: ${currentDate}*`;
    } else {
        // 일반 주간 보고서 생성
        return `# 📊 주간 개발 보고서
## 📅 보고 기간: ${weekStartStr} - ${currentDate}
**담당자:** ${userId}

---

## 🎯 주요 성과
### ✅ 완료된 작업
- **SWDP ChatOps 확장 프로그램 개발**
  - VSCode 확장 프로그램 초기 설정 및 구조 설계
  - 주간 보고서 자동 생성 기능 개발
  - 사용자 인터페이스 구현 (Tree View, Commands)
  - API 서비스 연동 및 인증 시스템 구축

- **프로젝트 환경 설정**
  - Webpack 빌드 시스템 구성
  - 패키지 의존성 관리 및 최적화
  - Git 워크플로우 설정

### 🔄 진행 중인 작업
- **기능 확장 개발**
  - 피드백 처리 로직 구현
  - 보고서 저장 및 관리 시스템 개발

## 📈 기술적 성취
- **VSCode Extension API** 활용한 확장 프로그램 개발
- **Node.js** 기반 API 서비스 구축
- **Webpack** 빌드 최적화 및 번들링

## 🔍 향후 계획
### 다음 주 목표
1. **백엔드 서버 구축**
   - Express.js 기반 API 서버 개발
   - 데이터베이스 스키마 설계 및 구축
   
2. **사용자 경험 개선**
   - 에러 핸들링 강화
   - 로딩 상태 및 프로그레스 표시 개선

3. **테스트 및 배포**
   - 단위 테스트 작성
   - CI/CD 파이프라인 구축

## 💡 학습 내용
- **VSCode Extension 개발**: Activation Events, Contribution Points 활용
- **API 설계**: RESTful API 설계 원칙 적용
- **프로젝트 관리**: 효율적인 개발 워크플로우 구축

## 📊 개발 통계
- **작업 시간:** 35시간
- **생성된 파일:** 12개
- **구현된 기능:** 6개
- **해결된 이슈:** 5개

## 🚀 개선사항
- 코드 리팩토링을 통한 가독성 향상
- 에러 처리 로직 강화
- 사용자 가이드 문서 작성 필요

---
*이 보고서는 SWDP ChatOps Extension에 의해 자동 생성되었습니다.*
*보고서 생성일: ${currentDate}*`;
    }
}

// /devportal/api/v1/extension/message-async 엔드포인트
app.post('/devportal/api/v1/extension/message-async', async (req, res) => {
    try {
        const { userId, userQuery } = req.body;
        
        console.log(`📝 주간 보고서 요청 수신:`);
        console.log(`- 사용자: ${userId}`);
        console.log(`- 쿼리: ${userQuery}`);
        
        // 피드백인지 확인 (userQuery에 특정 키워드가 있는지 확인)
        const isFeedback = userQuery && userQuery.includes('피드백') || userQuery.includes('feedback') || userQuery.includes('수정');
        
        // 약간의 지연 시뮬레이션 (실제 처리 시간 모방)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 주간 보고서 생성
        const reportContent = generateWeeklyReport(userId, userQuery, isFeedback ? userQuery : null);
        
        // 성공 응답
        const response = {
            success: true,
            data: reportContent,
            timestamp: new Date().toISOString(),
            userId: userId,
            message: isFeedback ? '피드백이 반영된 보고서가 생성되었습니다.' : '주간 보고서가 성공적으로 생성되었습니다.'
        };
        
        console.log(`✅ 주간 보고서 생성 완료 (${userId})`);
        res.status(200).json(response);
        
    } catch (error) {
        console.error('❌ 주간 보고서 생성 실패:', error);
        
        const errorResponse = {
            success: false,
            errorMessage: error.message || '주간 보고서 생성 중 오류가 발생했습니다.',
            timestamp: new Date().toISOString()
        };
        
        res.status(500).json(errorResponse);
    }
});

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'SWDP ChatOps Mock Server is running'
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log('🚀 SWDP ChatOps Mock Server 시작됨');
    console.log(`📡 서버 주소: http://localhost:${PORT}`);
    console.log(`🔗 API 엔드포인트: http://localhost:${PORT}/devportal/api/v1/extension/message-async`);
    console.log(`💚 헬스 체크: http://localhost:${PORT}/health`);
    console.log('='.repeat(70));
});

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
    console.log('\n🛑 서버를 종료합니다...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 서버를 종료합니다...');
    process.exit(0);
});