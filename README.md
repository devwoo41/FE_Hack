# MovieFind

영화 검색, 상세보기, 회원가입/로그인/로그아웃, 댓글 작성/조회 기능이 있는 심플한 영화 정보 웹앱입니다.

## 주요 기능

-   **영화 전체 목록 조회 및 검색**: 영화 제목(한글/영문)으로 실시간 검색
-   **영화 상세보기**: 포스터, 제목, 출연진, 줄거리, 평점, 개봉일 등 정보 표시
-   **회원가입/로그인/로그아웃**: JWT 기반 인증, 토큰 로컬스토리지 저장
-   **댓글 작성/조회**: 영화별 댓글 작성 및 목록 확인 (로그인 필요)
-   **반응형 UI**: PC/모바일 모두 보기 좋은 레이아웃

## 기술 스택

-   **Frontend**: HTML, CSS, JavaScript (Vanilla)
-   **API 연동**: RESTful API (fetch)
-   **인증**: JWT 토큰 (로컬스토리지)

## 실행 방법

1. 이 저장소를 클론합니다.
2. 프로젝트 폴더에서 아래 명령어로 로컬 서버를 실행합니다.
    - VSCode Live Server, Python http.server, 또는 기타 정적 서버 사용 가능
    - 예시: `python -m http.server 3000`
3. 브라우저에서 `http://localhost:3000` 접속

## API 연동

-   **Base URL**: `https://hufs-likelion.store`
-   **주요 엔드포인트**:
    -   영화 전체조회: `GET /movies`
    -   영화 상세조회: `GET /movies/<int:pk>`
    -   댓글 전체조회: `GET /movies/<int:movie_id>`
    -   댓글 작성: `POST /movies/comments/<int:movie_id>` (Authorization 필요)
    -   회원가입: `POST /dj/registration`
    -   로그인: `POST /dj/login`
    -   로그아웃: `POST /dj/logout`

## 환경설정 및 주의사항

-   **API 서버가 반드시 동작 중이어야** 모든 기능이 정상 동작합니다.
-   댓글 작성 등 인증이 필요한 기능은 로그인 후 사용 가능합니다.
-   토큰이 만료되면 재로그인 필요
-   영화/댓글 데이터는 서버 DB에 저장됩니다.

## 커스텀/확장

-   CSS, JS를 자유롭게 수정해 UI/UX를 개선할 수 있습니다.
-   API 명세가 바뀌면 fetch 경로/헤더/body를 맞춰주세요.

---

문의/이슈는 언제든 남겨주세요!
