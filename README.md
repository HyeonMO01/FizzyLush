# FIZZYLUSH

AI 기반 옷장 관리 + 코디 추천 모바일 앱입니다.  
사용자가 직접 등록한 옷을 기준으로 스타일 추천, 오늘의 코디, 쇼핑 연결, 추천 피드백 루프를 제공합니다.

> 클라이언트(Expo 앱)에는 비밀 키를 두지 않고, OpenAI/네이버/날씨 API는 `proxy-server`를 통해 호출합니다.

---

## 프로젝트 개요

- **플랫폼**: Expo + React Native
- **언어**: TypeScript
- **인증/데이터**: Firebase (Auth, Firestore, Storage)
- **AI 추천**: OpenAI Vision + Chat Completions
- **쇼핑 연동**: Naver Shopping 검색
- **관측성**: Sentry(선택), 커스텀 모니터링 엔드포인트(선택)
- **보안 원칙**: API Secret은 서버(프록시)에서만 사용

---

## 핵심 기능

### 1) 옷장 등록 + 태깅
- 이미지 업로드(카메라/갤러리)
- 의류 영역 감지 및 카테고리 선택
- `aiSummary` 자동 생성/보강으로 태그 품질 개선

### 2) AI 코디 추천
- 업로드한 기준 옷을 중심으로 코디 추천
- 상황(TPO), 날씨, 스타일, 예산 조건 반영
- 추천 아이템별 검색 키워드/매칭 이유/색상·소재 설명 제공

### 3) 옷 터치 추천
- 이미지에서 특정 의류를 선택해 해당 아이템 중심 코디 생성
- 선택 의류 정보(색/스타일/위치) 반영

### 4) 오늘의 코디 (재방문 루프)
- 옷장/날씨/날짜 기반 일일 추천
- 캐시 키(날짜/옷장 구성/날씨)로 자동 리프레시
- 추천 히스토리 피드백(like/dislike) 반영

### 5) AI 코디 시각화
- 추천 결과를 참고용 이미지로 생성
- `visualAnchor` 기반으로 업로드 의류 특성을 고정하도록 개선

### 6) 추천 히스토리 + 피드백 루프
- 추천 결과 저장/조회/삭제
- dislike 항목 빠른 재추천 진입 지원

---

## 아키텍처

```text
Expo App (React Native)
  ├─ Firebase Auth / Firestore / Storage
  └─ Proxy Server (Node)
       ├─ OpenAI API
       ├─ Naver Shopping API
       ├─ OpenWeather API
       └─ Replicate API (선택)
```

- 앱은 `EXPO_PUBLIC_API_BASE_URL`로 프록시에만 요청
- 프록시는 `PROXY_TOKEN` 검사, CORS, 레이트 제한 등 최소 보안 적용
- 자세한 서버 내용: [proxy-server/README.md](proxy-server/README.md)

---

## 빠른 시작

### 0) 요구 사항
- Node.js 18+
- npm 9+
- Expo CLI 사용 가능 환경

### 1) 설치
```bash
npm install
```

### 2) 환경변수 설정
`.env.example`을 복사해 `.env`를 만듭니다.

```bash
cp .env.example .env
```

필수 값:
- Expo 앱용 `EXPO_PUBLIC_FIREBASE_*`
- `EXPO_PUBLIC_API_BASE_URL`
- 프록시용 `OPENAI_API_KEY`, `NAVER_SHOPPING_CLIENT_*`, `OPENWEATHER_API_KEY` 등
- `PROXY_TOKEN` / `EXPO_PUBLIC_PROXY_TOKEN` (동일 값 권장)

> `EXPO_PUBLIC_*`는 번들에 포함됩니다. 시크릿을 넣지 마세요.

### 3) 프록시 실행 (터미널 A)
```bash
npm run proxy:start
```

### 4) 앱 실행 (터미널 B)
```bash
npm start
```

추가 실행:
```bash
npm run android
npm run ios
npm run web
```

---

## 실기기 테스트 주의사항

- 휴대폰에서 테스트할 때 `EXPO_PUBLIC_API_BASE_URL`은 `localhost`가 아니라 **PC의 LAN IP**를 써야 합니다.
  - 예: `http://192.168.0.10:8787`
- 휴대폰/PC가 같은 Wi-Fi 대역인지 확인하세요.

---

## 스모크 테스트 체크리스트

1. 로그인 및 온보딩 완료
2. 옷장에 이미지 1장 이상 등록
3. `AI 추천` 또는 `옷 터치 추천` 실행
4. 추천 결과 + 쇼핑 카드 로딩 확인
5. `AI 코디 시각화` 생성 확인
6. 추천 히스토리 저장/조회 및 피드백(like/dislike) 반영 확인
7. `GET /health`로 프록시 헬스 체크

---

## 환경변수 요약

자세한 설명은 `.env.example` 참고.

### Expo 앱
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_EAS_PROJECT_ID`
- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_PROXY_TOKEN`
- `EXPO_PUBLIC_SENTRY_DSN` (선택)
- `EXPO_PUBLIC_MONITORING_ENDPOINT` (선택)

### Proxy 서버
- `OPENAI_API_KEY`
- `NAVER_SHOPPING_CLIENT_ID`
- `NAVER_SHOPPING_CLIENT_SECRET`
- `OPENWEATHER_API_KEY`
- `REPLICATE_API_TOKEN` (선택)
- `PROXY_TOKEN`
- `CORS_ALLOWED_ORIGINS`
- `PROXY_VERSION`
- `PORT` (기본 8787)

---

## 품질/보안

- 린트:
```bash
npm run lint
```

- 보안 가이드: [SECURITY.md](SECURITY.md)
- 프록시 배포 가이드: [proxy-server/DEPLOY.md](proxy-server/DEPLOY.md)

---

## 문서

- 프록시 사용법: [proxy-server/README.md](proxy-server/README.md)
- 릴리즈 체크리스트: [docs/release-readiness-checklist.md](docs/release-readiness-checklist.md)
- 추천 E2E 체크리스트: [docs/recommendation-mvp-e2e-checklist.md](docs/recommendation-mvp-e2e-checklist.md)

---

## 트러블슈팅

### Q1. 쇼핑 카드가 비어 있어요
- `EXPO_PUBLIC_API_BASE_URL` 확인 (`localhost` 대신 PC IP 필요할 수 있음)
- 프록시 실행 여부 확인
- 프록시 로그에서 네이버 API 에러 확인

### Q2. AI 추천/시각화가 느려요
- 외부 API 응답 지연일 수 있습니다.
- 네트워크 상태 및 프록시 서버 위치를 확인하세요.

### Q3. 프록시 헬스 확인 방법?
```bash
curl http://localhost:8787/health
```

---

## 라이선스

내부/개인 프로젝트 기준. 공개 배포 시 라이선스를 명시해 주세요.
