// API URL
const MOVIE_API_BASE = 'https://hufs-likelion.store/movies';

// DOM 요소들
const moviesContainer = document.getElementById('moviesContainer');
const searchInput = document.getElementById('searchInput');
const loading = document.getElementById('loading');
const paginationContainer = document.getElementById('paginationContainer');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumbersContainer = document.getElementById('pageNumbers');

// 영화 데이터를 저장할 변수
let allMovies = [];
let filteredMovies = [];

// 페이지네이션 변수
const MOVIES_PER_PAGE = 8; // 4x2 = 8개
let currentPage = 1;
let totalPages = 1;

// SPA 라우팅 변수
let currentRoute = 'home';

const AUTH_API_BASE = 'https://hufs-likelion.store';

// 토큰 저장/삭제/가져오기
function saveToken(token) {
    localStorage.setItem('access_token', token);
}
function getToken() {
    return localStorage.getItem('access_token');
}
function removeToken() {
    localStorage.removeItem('access_token');
}

// 네비게이션 동적 처리 (로그인/로그아웃)
function updateAuthNav() {
    const navRight = document.querySelector('.nav-right');
    navRight.innerHTML = '';
    if (getToken()) {
        navRight.innerHTML = `
            <a href="#" class="nav-link" data-page="home">홈</a>
            <a href="#" class="nav-link" id="logoutBtn">로그아웃</a>
        `;
        document.getElementById('logoutBtn').onclick = (e) => {
            e.preventDefault();
            handleLogout();
        };
    } else {
        navRight.innerHTML = `
            <a href="#" class="nav-link" data-page="login">로그인</a>
            <a href="#" class="nav-link" data-page="signup">회원가입</a>
        `;
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await fetchMovies();
        initSPARouting();
        initAuthForms();
        updateAuthNav();
    } catch (error) {
        console.error('영화 데이터를 가져오는 중 오류가 발생했습니다:', error);
        showError('영화 데이터를 불러오는 중 오류가 발생했습니다.');
    }
});

// SPA 라우팅 초기화
function initSPARouting() {
    // 네비게이션 링크 이벤트 리스너
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('nav-link') && e.target.hasAttribute('data-page')) {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            navigateToPage(page);
        }
    });

    // 로고 클릭 시 홈으로 이동
    document.querySelector('.logo-link').addEventListener('click', function (e) {
        e.preventDefault();
        navigateToPage('home');
    });
}

// 페이지 이동 함수
function navigateToPage(page) {
    // 현재 활성 페이지 숨기기
    const currentActivePage = document.querySelector('.page.active');
    if (currentActivePage) {
        currentActivePage.classList.remove('active');
    }

    // 새로운 페이지 표시
    const targetPage = document.getElementById(page + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
        currentRoute = page;

        // 네비게이션 활성 상태 업데이트
        updateNavigationState(page);

        // 페이지별 초기화
        if (page === 'home') {
            // 홈 페이지에서는 전체 영화 목록을 항상 표시
            filteredMovies = allMovies;
            displayMovies(allMovies);
        }
    }
}

// 네비게이션 상태 업데이트
function updateNavigationState(activePage) {
    // 모든 네비게이션 링크에서 active 클래스 제거
    document.querySelectorAll('.nav-link').forEach((link) => {
        link.classList.remove('active');
    });

    // 현재 페이지에 해당하는 링크에 active 클래스 추가
    const activeLink = document.querySelector(`[data-page="${activePage}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// API에서 영화 데이터 가져오기
async function fetchMovies() {
    showLoading(true);
    try {
        const response = await fetch(`${MOVIE_API_BASE}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const movies = await response.json();
        allMovies = movies;
        filteredMovies = movies;
        displayMovies(movies);
    } catch (error) {
        console.error('API 요청 중 오류:', error);
        showError('영화 데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
        showLoading(false);
    }
}

// 영화들을 화면에 표시 (페이지네이션 적용)
function displayMovies(movies) {
    moviesContainer.innerHTML = '';

    if (movies.length === 0) {
        moviesContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                <h3>검색 결과가 없습니다</h3>
                <p>다른 검색어를 시도해보세요.</p>
            </div>
        `;
        paginationContainer.style.display = 'none';
        return;
    }

    // 페이지네이션 계산
    totalPages = Math.ceil(movies.length / MOVIES_PER_PAGE);
    currentPage = Math.min(currentPage, totalPages);
    currentPage = Math.max(currentPage, 1);

    // 현재 페이지의 영화들만 표시
    const startIndex = (currentPage - 1) * MOVIES_PER_PAGE;
    const endIndex = startIndex + MOVIES_PER_PAGE;
    const currentPageMovies = movies.slice(startIndex, endIndex);

    currentPageMovies.forEach((movie) => {
        const movieCard = createMovieCard(movie);
        moviesContainer.appendChild(movieCard);
    });

    // 페이지네이션 컨트롤 업데이트
    updatePagination();
}

// 개별 영화 카드 생성
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    // 포스터 이미지가 없는 경우 기본 이미지 사용
    const posterUrl =
        movie.poster_url ||
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPua1i+ivlTwvdGV4dD48L3N2Zz4=';

    card.innerHTML = `
        <img src="${posterUrl}" alt="${movie.title_kor}" class="movie-poster" 
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPua1i+ivlTwvdGV4dD48L3N2Zz4='">
        <div class="movie-title">${movie.title_kor}</div>
    `;

    // 카드 클릭 시 영화 정보 표시 (선택사항)
    card.addEventListener('click', () => {
        showMovieDetailsById(movie.id);
    });

    return card;
}

// 댓글 목록만 동적으로 갱신하는 함수
async function updateCommentsList(movieId) {
    const commentsList = document.getElementById('commentsList');
    const commentsCount = document.querySelector('.comments-count');
    try {
        const res = await fetch(`${MOVIE_API_BASE}/${movieId}`);
        if (res.ok) {
            const movieDetail = await res.json();
            const comments = movieDetail.comments || [];
            if (commentsCount) commentsCount.textContent = `${comments.length}개의 댓글`;
            if (comments.length === 0) {
                commentsList.innerHTML =
                    '<div class="no-comments">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</div>';
            } else {
                commentsList.innerHTML = comments
                    .map(
                        (c) =>
                            `<div class="comment-item"><b>${c.username}</b> <span style='color:#888;font-size:0.9em;'>${
                                c.create_date ? c.create_date.split('T')[0] : ''
                            }</span><div>${c.content}</div></div>`
                    )
                    .join('');
            }
        }
    } catch {}
}

// 영화 상세 정보 표시 (모달) - 실 API 연동 (댓글 별도 조회)
async function showMovieDetailsById(movieId) {
    try {
        const res = await fetch(`${MOVIE_API_BASE}/${movieId}`);
        if (!res.ok) throw new Error('영화 상세 정보를 불러오지 못했습니다.');
        const movie = await res.json();
        // 댓글 별도 조회
        let comments = movie.comments || [];
        // 모달 생성
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            max-height: 85vh;
            overflow-y: auto;
            position: relative;
        `;
        const posterUrl =
            movie.poster_url ||
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPua1i+ivlTwvdGV4dD48L3N2Zz4=';
        // 배우 정보
        let actorsHtml = '';
        if (movie.actors && movie.actors.length > 0) {
            actorsHtml =
                `<div style=\"margin-bottom:1rem;\"><b>출연진</b><ul style='padding-left:1.2em;'>` +
                movie.actors.map((a) => `<li>${a.name} (${a.character})</li>`).join('') +
                '</ul></div>';
        }
        // 댓글 정보
        let commentsHtml = '';
        if (comments && comments.length > 0) {
            commentsHtml = comments
                .map(
                    (c) =>
                        `<div class=\"comment-item\"><b>${c.username}</b> <span style='color:#888;font-size:0.9em;'>${
                            c.create_date ? c.create_date.split('T')[0] : ''
                        }</span><div>${c.content}</div></div>`
                )
                .join('');
        } else {
            commentsHtml = '<div class="no-comments">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</div>';
        }
        modalContent.innerHTML = `
            <button onclick=\"this.closest('.modal').remove()\" style=\"position: absolute;top: 1rem;right: 1rem;background: none;border: none;font-size: 1.5rem;cursor: pointer;color: #666;z-index: 1;\">&times;</button>
            <div style=\"display: flex; gap: 2rem; margin-bottom: 2rem;\">\n<img src=\"${posterUrl}\" alt=\"${
            movie.title_kor
        }\" style=\"width: 200px;height: auto;border-radius: 8px;flex-shrink: 0;\" onerror=\"this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPua1i+ivlTwvdGV4dD48L3N2Zz4='\">\n<div style=\"flex: 1;\">\n<h2 style=\"margin-bottom: 0.5rem; color: #333; font-size: 1.5rem;\">${
            movie.title_kor
        }</h2>\n<p style=\"color: #666; margin-bottom: 1rem; font-size: 1rem;\">${
            movie.title_eng
        }</p>\n<p style=\"color: #999; font-size: 0.9rem;\">영화 ID: ${
            movie.id
        }</p>\n<div style=\"margin-top: 1rem;\">\n${actorsHtml}\n<div><b>줄거리</b>: ${
            movie.plot || '-'
        }</div>\n<div><b>평점</b>: ${movie.rating || '-'}</div>\n<div><b>개봉일</b>: ${
            movie.release_date || '-'
        }</div>\n</div>\n</div>\n</div>\n<!-- 댓글 섹션 -->\n<div class=\"comments-section\">\n<div class=\"comments-header\">\n<h3 class=\"comments-title\">댓글</h3>\n<span class=\"comments-count\">${
            comments ? comments.length : 0
        }개의 댓글</span>\n</div>\n<!-- 댓글 작성 폼 -->\n<div class=\"comment-form\">\n<div class=\"comment-input-container\">\n<div class=\"comment-avatar\">U</div>\n<div class=\"comment-input-wrapper\">\n<textarea class=\"comment-input\" placeholder=\"이 영화에 대한 생각을 공유해보세요...\" id=\"commentInput\"></textarea>\n<button class=\"comment-submit\" onclick=\"submitComment(${
            movie.id
        })\">댓글 작성</button>\n</div>\n</div>\n</div>\n<!-- 댓글 목록 -->\n<div class=\"comments-list\" id=\"commentsList\">${commentsHtml}</div>\n</div>\n`;
        modal.className = 'modal';
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        // 모달 외부 클릭 시 닫기
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        // 댓글 입력 이벤트 리스너
        const commentInput = modalContent.querySelector('#commentInput');
        const submitBtn = modalContent.querySelector('.comment-submit');
        commentInput.addEventListener('input', function () {
            submitBtn.disabled = this.value.trim().length === 0;
        });
        commentInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                submitComment(movie.id);
            }
        });
    } catch (err) {
        alert('영화 상세 정보를 불러오지 못했습니다.');
    }
}

// 페이지네이션 컨트롤 업데이트
function updatePagination() {
    // 이전/다음 버튼 상태 업데이트
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    // 페이지 번호들 생성
    pageNumbersContainer.innerHTML = '';

    // 표시할 페이지 번호 범위 계산 (최대 5개)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // 시작 페이지 조정
    if (endPage - startPage < 4 && totalPages > 5) {
        if (currentPage <= 3) {
            endPage = Math.min(5, totalPages);
        } else {
            startPage = Math.max(1, endPage - 4);
        }
    }

    // 페이지 번호 버튼들 생성
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => goToPage(i));
        pageNumbersContainer.appendChild(pageBtn);
    }

    // 페이지네이션 컨테이너 표시/숨김
    paginationContainer.style.display = totalPages > 1 ? 'flex' : 'none';
}

// 특정 페이지로 이동
function goToPage(page) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
        currentPage = page;
        displayMovies(filteredMovies);
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 이전 페이지로 이동
function goToPrevPage() {
    if (currentPage > 1) {
        goToPage(currentPage - 1);
    }
}

// 다음 페이지로 이동
function goToNextPage() {
    if (currentPage < totalPages) {
        goToPage(currentPage + 1);
    }
}

// 페이지네이션 버튼 이벤트 리스너
prevPageBtn.addEventListener('click', goToPrevPage);
nextPageBtn.addEventListener('click', goToNextPage);

// 인증 폼 초기화
function initAuthForms() {
    // 로그인 폼
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (validateLoginForm()) {
                handleLogin();
            }
        });

        // 실시간 검증
        const usernameLogin = document.getElementById('usernameLogin');
        const passwordLogin = document.getElementById('passwordLogin');

        if (usernameLogin)
            usernameLogin.addEventListener('blur', () => {
                const username = usernameLogin.value.trim();
                if (!username) {
                    showFieldError('usernameLogin', '사용자명(ID)을 입력하세요.');
                } else {
                    clearFieldError('usernameLogin');
                }
            });
        if (passwordLogin)
            passwordLogin.addEventListener('blur', () => {
                const password = passwordLogin.value;
                if (!password) {
                    showFieldError('passwordLogin', '비밀번호를 입력해주세요.');
                } else {
                    clearFieldError('passwordLogin');
                }
            });
    }

    // 회원가입 폼
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (validateSignupForm()) {
                handleSignup();
            }
        });

        // 실시간 검증
        const username = document.getElementById('username');
        const password1 = document.getElementById('password1');
        const password2 = document.getElementById('password2');

        if (username) username.addEventListener('blur', validateUsername);
        if (password1) {
            password1.addEventListener('input', updatePasswordStrength);
            password1.addEventListener('blur', () => validatePassword('password1'));
        }
        if (password2) password2.addEventListener('blur', validateConfirmPassword);
    }

    // 소셜 로그인 버튼
    document.addEventListener('click', function (e) {
        if (e.target.closest('.social-btn')) {
            const btn = e.target.closest('.social-btn');
            const provider = btn.classList.contains('google-btn') ? 'Google' : 'Kakao';
            console.log(`${provider} 로그인 시도`);
            alert(`${provider} 로그인 기능은 준비 중입니다.`);
        }
    });
}

// 검색 기능 (페이지네이션 리셋 포함)
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    currentPage = 1;
    // 중복 제거
    const uniqueMovies = allMovies.filter(
        (movie, idx, arr) =>
            arr.findIndex(
                (m) =>
                    m.title_kor === movie.title_kor &&
                    m.title_eng === movie.title_eng &&
                    m.poster_url === movie.poster_url
            ) === idx
    );
    if (searchTerm === '') {
        filteredMovies = uniqueMovies;
    } else {
        filteredMovies = uniqueMovies.filter(
            (movie) =>
                movie.title_kor.toLowerCase().includes(searchTerm) || movie.title_eng.toLowerCase().includes(searchTerm)
        );
    }
    displayMovies(filteredMovies);
});

// 로딩 상태 표시/숨김
function showLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
}

// 인증 관련 함수들
function validateLoginForm() {
    const username = document.getElementById('usernameLogin').value.trim();
    const password = document.getElementById('passwordLogin').value;

    let isValid = true;

    if (!username) {
        showFieldError('usernameLogin', '사용자명(ID)을 입력하세요.');
        isValid = false;
    } else {
        clearFieldError('usernameLogin');
    }

    if (!password) {
        showFieldError('passwordLogin', '비밀번호를 입력해주세요.');
        isValid = false;
    } else {
        clearFieldError('passwordLogin');
    }

    return isValid;
}

function validateSignupForm() {
    const username = document.getElementById('username').value.trim();
    const password1 = document.getElementById('password1').value;
    const password2 = document.getElementById('password2').value;
    const nickname = document.getElementById('nickname').value.trim();
    let isValid = true;
    if (!username) {
        showFieldError('username', 'ID를 입력하세요.');
        isValid = false;
    } else {
        clearFieldError('username');
    }
    if (!password1) {
        showFieldError('password1', '비밀번호를 입력하세요.');
        isValid = false;
    } else {
        clearFieldError('password1');
    }
    if (!password2) {
        showFieldError('password2', '비밀번호 확인을 입력하세요.');
        isValid = false;
    } else if (password1 !== password2) {
        showFieldError('password2', '비밀번호가 일치하지 않습니다.');
        isValid = false;
    } else {
        clearFieldError('password2');
    }
    if (!nickname) {
        showFieldError('nickname', '닉네임을 입력하세요.');
        isValid = false;
    } else {
        clearFieldError('nickname');
    }
    return isValid;
}

function validateUsername() {
    const username = document.getElementById('username').value.trim();

    if (!username) {
        showFieldError('username', '사용자명을 입력해주세요.');
        return false;
    } else if (username.length < 2) {
        showFieldError('username', '사용자명은 2자 이상 입력해주세요.');
        return false;
    } else {
        clearFieldError('username');
        return true;
    }
}

function validateEmail(fieldId) {
    const email = document.getElementById(fieldId).value.trim();

    if (!email) {
        showFieldError(fieldId, '이메일을 입력해주세요.');
        return false;
    } else if (!isValidEmail(email)) {
        showFieldError(fieldId, '올바른 이메일 형식을 입력해주세요.');
        return false;
    } else {
        clearFieldError(fieldId);
        return true;
    }
}

function validatePassword(fieldId) {
    const password = document.getElementById(fieldId).value;

    if (!password) {
        showFieldError(fieldId, '비밀번호를 입력해주세요.');
        return false;
    } else if (password.length < 8) {
        showFieldError(fieldId, '비밀번호는 8자 이상 입력해주세요.');
        return false;
    } else {
        clearFieldError(fieldId);
        return true;
    }
}

function validateConfirmPassword() {
    const password = document.getElementById('password1').value;
    const confirmPassword = document.getElementById('password2').value;

    if (!confirmPassword) {
        showFieldError('password2', '비밀번호 확인을 입력해주세요.');
        return false;
    } else if (password !== confirmPassword) {
        showFieldError('password2', '비밀번호가 일치하지 않습니다.');
        return false;
    } else {
        clearFieldError('password2');
        return true;
    }
}

function updatePasswordStrength() {
    const password = document.getElementById('password1').value;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    if (!strengthFill || !strengthText) return;

    const strength = calculatePasswordStrength(password);

    strengthFill.className = 'strength-fill';

    if (password.length === 0) {
        strengthFill.style.width = '0%';
        strengthText.textContent = '비밀번호 강도';
    } else if (strength < 3) {
        strengthFill.classList.add('weak');
        strengthText.textContent = '약함';
    } else if (strength < 5) {
        strengthFill.classList.add('medium');
        strengthText.textContent = '보통';
    } else {
        strengthFill.classList.add('strong');
        strengthText.textContent = '강함';
    }
}

function calculatePasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return strength;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    formGroup.classList.add('error');

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    formGroup.classList.remove('error');

    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// 회원가입 API 연동
async function handleSignup() {
    const signupBtn = document.querySelector('#signupForm .auth-btn');
    const formData = {
        username: document.getElementById('username').value,
        password1: document.getElementById('password1').value,
        password2: document.getElementById('password2').value,
        nickname: document.getElementById('nickname').value,
    };

    console.log('회원가입 전송 데이터:', formData);

    signupBtn.classList.add('loading');
    signupBtn.textContent = '회원가입 중...';
    try {
        const res = await fetch(`${AUTH_API_BASE}/dj/registration/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        console.log('서버 응답 상태:', res.status);
        console.log('서버 응답 헤더:', res.headers);

        let data;
        try {
            data = await res.json();
        } catch (e) {
            data = await res.text();
        }
        console.log('서버 응답 데이터:', data);

        if (res.ok) {
            alert('회원가입 성공!');
            signupBtn.classList.remove('loading');
            signupBtn.textContent = '회원가입';
            navigateToPage('home');
        } else {
            showErrorMessageFromAPI(data);
            signupBtn.classList.remove('loading');
            signupBtn.textContent = '회원가입';
        }
    } catch (err) {
        console.error('회원가입 오류:', err);
        showErrorMessage('회원가입 중 오류가 발생했습니다.');
        signupBtn.classList.remove('loading');
        signupBtn.textContent = '회원가입';
    }
}

// 로그인 API 연동
async function handleLogin() {
    const loginBtn = document.querySelector('#loginForm .auth-btn');
    const username = document.getElementById('usernameLogin').value;
    const password = document.getElementById('passwordLogin').value;

    console.log('로그인 시도:', { username, password: '***' });

    loginBtn.classList.add('loading');
    loginBtn.textContent = '로그인 중...';
    try {
        const res = await fetch(`${AUTH_API_BASE}/dj/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        console.log('로그인 응답 상태:', res.status);
        console.log('로그인 응답 헤더:', res.headers);

        let data;
        try {
            data = await res.json();
        } catch (e) {
            data = await res.text();
        }
        console.log('로그인 응답 데이터:', data);

        if (res.ok && data.access) {
            saveToken(data.access);
            alert('로그인 성공!');
            loginBtn.classList.remove('loading');
            loginBtn.textContent = '로그인';
            updateAuthNav();
            navigateToPage('home');
        } else {
            showErrorMessageFromAPI(data);
            loginBtn.classList.remove('loading');
            loginBtn.textContent = '로그인';
        }
    } catch (err) {
        console.error('로그인 오류:', err);
        showErrorMessage('로그인 중 오류가 발생했습니다.');
        loginBtn.classList.remove('loading');
        loginBtn.textContent = '로그인';
    }
}

// 로그아웃 API 연동
async function handleLogout() {
    const token = getToken();
    if (!token) return;
    try {
        await fetch(`${AUTH_API_BASE}/dj/logout/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (err) {}
    removeToken();
    updateAuthNav();
    navigateToPage('login');
}

// API 에러 메시지 표시 (object Object 방지)
function showErrorMessageFromAPI(data) {
    let msg = '오류가 발생했습니다.';
    if (typeof data === 'string') msg = data;
    else if (data && typeof data === 'object') {
        msg = Object.values(data).flat().join('\n');
    }
    showErrorMessage(msg);
}

// 기존 showSuccessMessage와 별개로 에러 메시지 표시
function showErrorMessage(message) {
    const existing = document.querySelector('.error-message-global');
    if (existing) existing.remove();
    const errDiv = document.createElement('div');
    errDiv.className = 'error-message-global';
    errDiv.style.color = '#e74c3c';
    errDiv.style.margin = '1rem 0';
    errDiv.textContent = message;
    const form = document.querySelector('.auth-form');
    form.parentNode.insertBefore(errDiv, form.nextSibling);
    setTimeout(() => {
        if (errDiv.parentNode) errDiv.remove();
    }, 4000);
}

// 댓글 작성 (명세서에 맞게 POST /movies/comments/<movie_id>)
async function submitComment(movieId) {
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();
    if (!commentText) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }
    const token = getToken();
    if (!token) {
        alert('로그인이 필요합니다.');
        return;
    }
    try {
        const res = await fetch(`https://hufs-likelion.store/movies/comments/${movieId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: commentText }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            alert(data.detail || '댓글 작성에 실패했습니다.');
            return;
        }
        // 댓글 작성 성공 시 댓글 목록만 갱신, 입력창 비우고 포커스 유지
        commentInput.value = '';
        commentInput.focus();
        await updateCommentsList(movieId);
    } catch (err) {
        alert('댓글 작성 중 오류가 발생했습니다.');
    }
}

// 오류 메시지 표시
function showError(message) {
    moviesContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #e74c3c;">
            <h3>오류가 발생했습니다</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="
                margin-top: 1rem;
                padding: 0.5rem 1rem;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">다시 시도</button>
        </div>
    `;
}
