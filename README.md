# MovieFind 🎬

영화 포스터와 제목을 보여주는 웹사이트입니다. [The Hot Potato Store API](https://thehotpotato.store/movies/)를 활용하여 영화 데이터를 가져와 표시합니다.

## 기능

-   🎯 **영화 목록 표시**: API에서 가져온 영화들의 포스터와 제목을 그리드 형태로 표시
-   🔍 **실시간 검색**: 한국어/영어 제목으로 실시간 검색 기능
-   📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기에서 최적화된 화면
-   🎨 **모던 UI**: 깔끔하고 현대적인 디자인
-   ⚡ **빠른 로딩**: 효율적인 데이터 로딩과 캐싱

## 기술 스택

-   **HTML5**: 시맨틱 마크업
-   **CSS3**: Flexbox, Grid, 반응형 디자인
-   **JavaScript (ES6+)**: Fetch API, 비동기 처리
-   **API**: The Hot Potato Store Movies API

## 시작하기

1. 프로젝트를 클론하거나 다운로드합니다.
2. `index.html` 파일을 웹 브라우저에서 엽니다.
3. 영화 목록이 자동으로 로드됩니다.

## API 구조

API 응답은 다음과 같은 구조를 가집니다:

```json
[
    {
        "id": 1,
        "title_kor": "외계+인 1부",
        "title_eng": "외계+인 1부",
        "poster_url": "https://image.tmdb.org/t/p/original/..."
    }
]
```

## 주요 기능 설명

### 영화 카드

-   각 영화는 포스터 이미지와 한국어 제목이 포함된 카드로 표시됩니다
-   카드를 클릭하면 영화 상세 정보 모달이 열립니다
-   포스터 이미지가 없는 경우 기본 이미지가 표시됩니다

### 검색 기능

-   상단 검색창에 영화 제목을 입력하면 실시간으로 결과가 필터링됩니다
-   한국어와 영어 제목 모두 검색 가능합니다

### 반응형 디자인

-   데스크톱: 4-5개 카드가 한 줄에 표시
-   태블릿: 3-4개 카드가 한 줄에 표시
-   모바일: 2-3개 카드가 한 줄에 표시

## 파일 구조

```
MovieFind/
├── index.html          # 메인 HTML 파일
├── styles.css          # CSS 스타일시트
├── script.js           # JavaScript 로직
└── README.md           # 프로젝트 설명서
```

## 브라우저 지원

-   Chrome (권장)
-   Firefox
-   Safari
-   Edge

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 기여하기

버그 리포트나 기능 제안은 언제든 환영합니다!

---

**참고**: 이 프로젝트는 [The Hot Potato Store](https://thehotpotato.store/movies/) API를 사용합니다.
