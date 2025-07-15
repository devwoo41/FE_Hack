// API URL
const API_URL = 'https://thehotpotato.store/movies/';

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

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await fetchMovies();
        initSPARouting();
        initAuthForms();
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
            // 홈 페이지에서는 영화 목록 다시 표시
            displayMovies(filteredMovies);
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
        const response = await fetch(API_URL);

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
        showMovieDetails(movie);
    });

    return card;
}

// 영화 상세 정보 표시 (모달) - 댓글 기능 포함
function showMovieDetails(movie) {
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

    // 댓글 데이터 (시뮬레이션)
    const comments = getMovieComments(movie.id);

    modalContent.innerHTML = `
        <button onclick="this.closest('.modal').remove()" style="
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
            z-index: 1;
        ">&times;</button>
        
        <div style="display: flex; gap: 2rem; margin-bottom: 2rem;">
            <img src="${posterUrl}" alt="${movie.title_kor}" style="
                width: 200px;
                height: auto;
                border-radius: 8px;
                flex-shrink: 0;
            " onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPua1i+ivlTwvdGV4dD48L3N2Zz4='">
            
            <div style="flex: 1;">
                <h2 style="margin-bottom: 0.5rem; color: #333; font-size: 1.5rem;">${movie.title_kor}</h2>
                <p style="color: #666; margin-bottom: 1rem; font-size: 1rem;">${movie.title_eng}</p>
                <p style="color: #999; font-size: 0.9rem;">영화 ID: ${movie.id}</p>
                
                <div style="margin-top: 1rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                        <span style="color: #7f8c8d; font-size: 0.9rem;">평점: ⭐⭐⭐⭐⭐ (4.5/5)</span>
                        <span style="color: #7f8c8d; font-size: 0.9rem;">개봉일: 2024년</span>
                    </div>
                    <p style="color: #333; line-height: 1.6; font-size: 0.9rem;">
                        이 영화는 흥미진진한 스토리와 뛰어난 연기로 많은 관객들에게 사랑받고 있습니다. 
                        특별한 시각효과와 감동적인 음악이 어우러져 완성도 높은 작품으로 평가받고 있습니다.
                    </p>
                </div>
            </div>
        </div>
        
        <!-- 댓글 섹션 -->
        <div class="comments-section">
            <div class="comments-header">
                <h3 class="comments-title">댓글</h3>
                <span class="comments-count">${comments.length}개의 댓글</span>
            </div>
            
            <!-- 댓글 작성 폼 -->
            <div class="comment-form">
                <div class="comment-input-container">
                    <div class="comment-avatar">U</div>
                    <div class="comment-input-wrapper">
                        <textarea 
                            class="comment-input" 
                            placeholder="이 영화에 대한 생각을 공유해보세요..."
                            id="commentInput"
                        ></textarea>
                        <button class="comment-submit" onclick="submitComment(${movie.id})">댓글 작성</button>
                    </div>
                </div>
            </div>
            
            <!-- 댓글 목록 -->
            <div class="comments-list" id="commentsList">
                ${
                    comments.length > 0
                        ? comments
                              .map(
                                  (comment) => `
                    <div class="comment-item" data-comment-id="${comment.id}">
                        <div class="comment-avatar">${comment.author.charAt(0).toUpperCase()}</div>
                        <div class="comment-content">
                            <div class="comment-header">
                                <span class="comment-author">${comment.author}</span>
                                <span class="comment-date">${comment.date}</span>
                            </div>
                            <div class="comment-text">${comment.text}</div>
                            <div class="comment-actions">
                                <button class="comment-action ${comment.liked ? 'liked' : ''}" 
                                        onclick="toggleCommentLike(${comment.id})">
                                    ❤️ 좋아요
                                </button>
                                <span class="comment-likes ${comment.liked ? 'liked' : ''}">${comment.likes}</span>
                                <button class="comment-action" onclick="replyToComment(${comment.id})">
                                    💬 답글
                                </button>
                            </div>
                        </div>
                    </div>
                `
                              )
                              .join('')
                        : '<div class="no-comments">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</div>'
                }
            </div>
        </div>
    `;

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
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');

        if (loginEmail) loginEmail.addEventListener('blur', () => validateEmail('loginEmail'));
        if (loginPassword) loginPassword.addEventListener('blur', () => validatePassword('loginPassword'));
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
        const signupEmail = document.getElementById('signupEmail');
        const signupPassword = document.getElementById('signupPassword');
        const confirmPassword = document.getElementById('confirmPassword');

        if (username) username.addEventListener('blur', validateUsername);
        if (signupEmail) signupEmail.addEventListener('blur', () => validateEmail('signupEmail'));
        if (signupPassword) {
            signupPassword.addEventListener('input', updatePasswordStrength);
            signupPassword.addEventListener('blur', () => validatePassword('signupPassword'));
        }
        if (confirmPassword) confirmPassword.addEventListener('blur', validateConfirmPassword);
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

    // 검색 시 첫 페이지로 리셋
    currentPage = 1;

    if (searchTerm === '') {
        filteredMovies = allMovies;
    } else {
        filteredMovies = allMovies.filter(
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
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    let isValid = true;

    if (!email) {
        showFieldError('loginEmail', '이메일을 입력해주세요.');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('loginEmail', '올바른 이메일 형식을 입력해주세요.');
        isValid = false;
    } else {
        clearFieldError('loginEmail');
    }

    if (!password) {
        showFieldError('loginPassword', '비밀번호를 입력해주세요.');
        isValid = false;
    } else {
        clearFieldError('loginPassword');
    }

    return isValid;
}

function validateSignupForm() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    let isValid = true;

    if (!username) {
        showFieldError('username', '사용자명을 입력해주세요.');
        isValid = false;
    } else if (username.length < 2) {
        showFieldError('username', '사용자명은 2자 이상 입력해주세요.');
        isValid = false;
    } else {
        clearFieldError('username');
    }

    if (!email) {
        showFieldError('signupEmail', '이메일을 입력해주세요.');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('signupEmail', '올바른 이메일 형식을 입력해주세요.');
        isValid = false;
    } else {
        clearFieldError('signupEmail');
    }

    if (!password) {
        showFieldError('signupPassword', '비밀번호를 입력해주세요.');
        isValid = false;
    } else if (password.length < 8) {
        showFieldError('signupPassword', '비밀번호는 8자 이상 입력해주세요.');
        isValid = false;
    } else {
        clearFieldError('signupPassword');
    }

    if (!confirmPassword) {
        showFieldError('confirmPassword', '비밀번호 확인을 입력해주세요.');
        isValid = false;
    } else if (password !== confirmPassword) {
        showFieldError('confirmPassword', '비밀번호가 일치하지 않습니다.');
        isValid = false;
    } else {
        clearFieldError('confirmPassword');
    }

    if (!agreeTerms) {
        showFieldError('agreeTerms', '이용약관에 동의해주세요.');
        isValid = false;
    } else {
        clearFieldError('agreeTerms');
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
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!confirmPassword) {
        showFieldError('confirmPassword', '비밀번호 확인을 입력해주세요.');
        return false;
    } else if (password !== confirmPassword) {
        showFieldError('confirmPassword', '비밀번호가 일치하지 않습니다.');
        return false;
    } else {
        clearFieldError('confirmPassword');
        return true;
    }
}

function updatePasswordStrength() {
    const password = document.getElementById('signupPassword').value;
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
    const formGroup = field.closest('.form-group');

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
    const formGroup = field.closest('.form-group');

    formGroup.classList.remove('error');

    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function handleLogin() {
    const loginBtn = document.querySelector('#loginForm .auth-btn');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    loginBtn.classList.add('loading');
    loginBtn.textContent = '로그인 중...';

    setTimeout(() => {
        console.log('로그인 시도:', { email, password, rememberMe });

        showSuccessMessage('로그인이 완료되었습니다!');

        loginBtn.classList.remove('loading');
        loginBtn.textContent = '로그인';

        setTimeout(() => {
            navigateToPage('home');
        }, 2000);
    }, 1500);
}

function handleSignup() {
    const signupBtn = document.querySelector('#signupForm .auth-btn');
    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('signupEmail').value,
        password: document.getElementById('signupPassword').value,
        agreeTerms: document.getElementById('agreeTerms').checked,
        agreeMarketing: document.getElementById('agreeMarketing').checked,
    };

    signupBtn.classList.add('loading');
    signupBtn.textContent = '회원가입 중...';

    setTimeout(() => {
        console.log('회원가입 시도:', formData);

        showSuccessMessage('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');

        signupBtn.classList.remove('loading');
        signupBtn.textContent = '회원가입';

        setTimeout(() => {
            navigateToPage('login');
        }, 3000);
    }, 2000);
}

function showSuccessMessage(message) {
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;

    const form = document.querySelector('.auth-form');
    form.parentNode.insertBefore(successDiv, form.nextSibling);

    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}

// 댓글 관련 함수들
let movieComments = {}; // 영화별 댓글 데이터 저장

// 영화별 댓글 데이터 가져오기 (시뮬레이션)
function getMovieComments(movieId) {
    if (!movieComments[movieId]) {
        // 시뮬레이션된 댓글 데이터
        movieComments[movieId] = [
            {
                id: 1,
                author: '영화팬1',
                text: '정말 재미있는 영화였어요! 스토리도 좋고 연기도 훌륭했습니다.',
                date: '2024-01-15',
                likes: 12,
                liked: false,
            },
            {
                id: 2,
                author: '시네마러버',
                text: '시각효과가 정말 대단했어요. IMAX로 보면 더 좋을 것 같습니다.',
                date: '2024-01-14',
                likes: 8,
                liked: true,
            },
            {
                id: 3,
                author: '영화평론가',
                text: '전반적으로 만족스러운 작품이었습니다. 특히 음악이 인상적이었어요.',
                date: '2024-01-13',
                likes: 15,
                liked: false,
            },
        ];
    }
    return movieComments[movieId];
}

// 댓글 작성
function submitComment(movieId) {
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();

    if (!commentText) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    // 새 댓글 객체 생성
    const newComment = {
        id: Date.now(), // 임시 ID
        author: '사용자', // 실제로는 로그인된 사용자 정보
        text: commentText,
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        liked: false,
    };

    // 댓글 목록에 추가
    if (!movieComments[movieId]) {
        movieComments[movieId] = [];
    }
    movieComments[movieId].unshift(newComment); // 최신 댓글이 위로

    // 댓글 목록 업데이트
    updateCommentsList(movieId);

    // 입력 필드 초기화
    commentInput.value = '';
    commentInput.focus();

    // 댓글 수 업데이트
    updateCommentsCount(movieId);

    console.log('댓글 작성됨:', newComment);
}

// 댓글 목록 업데이트
function updateCommentsList(movieId) {
    const commentsList = document.getElementById('commentsList');
    const comments = getMovieComments(movieId);

    if (comments.length === 0) {
        commentsList.innerHTML = '<div class="no-comments">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</div>';
        return;
    }

    commentsList.innerHTML = comments
        .map(
            (comment) => `
        <div class="comment-item" data-comment-id="${comment.id}">
            <div class="comment-avatar">${comment.author.charAt(0).toUpperCase()}</div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${comment.date}</span>
                </div>
                <div class="comment-text">${comment.text}</div>
                <div class="comment-actions">
                    <button class="comment-action ${comment.liked ? 'liked' : ''}" 
                            onclick="toggleCommentLike(${comment.id})">
                        ❤️ 좋아요
                    </button>
                    <span class="comment-likes ${comment.liked ? 'liked' : ''}">${comment.likes}</span>
                    <button class="comment-action" onclick="replyToComment(${comment.id})">
                        💬 답글
                    </button>
                </div>
            </div>
        </div>
    `
        )
        .join('');
}

// 댓글 수 업데이트
function updateCommentsCount(movieId) {
    const commentsCount = document.querySelector('.comments-count');
    const comments = getMovieComments(movieId);
    commentsCount.textContent = `${comments.length}개의 댓글`;
}

// 댓글 좋아요 토글
function toggleCommentLike(commentId) {
    // 모든 영화의 댓글에서 해당 댓글 찾기
    for (let movieId in movieComments) {
        const comment = movieComments[movieId].find((c) => c.id === commentId);
        if (comment) {
            comment.liked = !comment.liked;
            comment.likes += comment.liked ? 1 : -1;

            // UI 업데이트
            const likeButton = document.querySelector(`[data-comment-id="${commentId}"] .comment-action`);
            const likeCount = document.querySelector(`[data-comment-id="${commentId}"] .comment-likes`);

            if (comment.liked) {
                likeButton.classList.add('liked');
                likeCount.classList.add('liked');
            } else {
                likeButton.classList.remove('liked');
                likeCount.classList.remove('liked');
            }

            likeCount.textContent = comment.likes;
            break;
        }
    }

    console.log('댓글 좋아요 토글:', commentId);
}

// 댓글 답글 기능
function replyToComment(commentId) {
    const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
    const commentText = commentItem.querySelector('.comment-text').textContent;

    // 답글 입력창 생성
    const replyForm = document.createElement('div');
    replyForm.className = 'comment-form';
    replyForm.style.marginTop = '1rem';
    replyForm.style.marginLeft = '3rem';
    replyForm.innerHTML = `
        <div class="comment-input-container">
            <div class="comment-avatar">U</div>
            <div class="comment-input-wrapper">
                <textarea 
                    class="comment-input" 
                    placeholder="답글을 입력하세요..."
                    style="min-height: 60px;"
                ></textarea>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                    <button class="comment-submit" onclick="submitReply(${commentId}, this)">답글 작성</button>
                    <button class="comment-submit" style="background: #95a5a6;" onclick="cancelReply(this)">취소</button>
                </div>
            </div>
        </div>
    `;

    // 기존 답글 폼이 있다면 제거
    const existingReply = commentItem.querySelector('.comment-form');
    if (existingReply) {
        existingReply.remove();
    }

    commentItem.appendChild(replyForm);
    replyForm.querySelector('textarea').focus();
}

// 답글 작성
function submitReply(commentId, button) {
    const replyForm = button.closest('.comment-form');
    const replyText = replyForm.querySelector('textarea').value.trim();

    if (!replyText) {
        alert('답글 내용을 입력해주세요.');
        return;
    }

    // 답글 객체 생성 (실제로는 중첩 댓글 구조로 구현)
    const reply = {
        id: Date.now(),
        author: '사용자',
        text: replyText,
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        liked: false,
        parentId: commentId,
    };

    // 답글 표시 (간단한 구현)
    const commentItem = button.closest('.comment-item');
    const replyDiv = document.createElement('div');
    replyDiv.className = 'comment-item';
    replyDiv.style.marginLeft = '3rem';
    replyDiv.style.marginTop = '1rem';
    replyDiv.innerHTML = `
        <div class="comment-avatar">${reply.author.charAt(0).toUpperCase()}</div>
        <div class="comment-content">
            <div class="comment-header">
                <span class="comment-author">${reply.author}</span>
                <span class="comment-date">${reply.date}</span>
            </div>
            <div class="comment-text">${reply.text}</div>
            <div class="comment-actions">
                <button class="comment-action" onclick="toggleCommentLike(${reply.id})">
                    ❤️ 좋아요
                </button>
                <span class="comment-likes">${reply.likes}</span>
            </div>
        </div>
    `;

    commentItem.appendChild(replyDiv);
    replyForm.remove();

    console.log('답글 작성됨:', reply);
}

// 답글 취소
function cancelReply(button) {
    button.closest('.comment-form').remove();
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
