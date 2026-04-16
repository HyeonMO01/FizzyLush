# FIZZYLUSH

Expo(React Native) 기반 패션·옷장 AI 앱. Firebase 인증/저장소, OpenAI·네이버 쇼핑 등은 **로컬 프록시**([proxy-server](proxy-server/README.md))를 통해 호출합니다.

## 빠른 시작

1. `cp .env.example .env` 후 Firebase·API URL 등 채움.
2. `npm install`
3. 프록시: `npm run proxy:start` (별도 터미널)
4. 앱: `npm start`

## 스모크 테스트 (수동)

1. 로그인·온보딩까지 진행.
2. 옷장에 이미지 1장 이상 등록.
3. **코디** 탭에서 기준 옷 선택 후 AI 추천 실행 → 결과 화면까지 이동.
4. 결과에서 쇼핑 카드가 비어 있으면 `EXPO_PUBLIC_API_BASE_URL`(실기기는 PC IP)과 프록시 로그 확인.
5. 프록시 헬스: 브라우저 또는 `curl`로 `GET /health` (프록시 기동 후).

자세한 배포·보안은 [proxy-server/DEPLOY.md](proxy-server/DEPLOY.md), [SECURITY.md](SECURITY.md) 참고.
