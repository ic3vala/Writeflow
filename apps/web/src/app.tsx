
import { BrowserRouter, Routes, Route, useLocation, Link, useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { jwtDecode } from "jwt-decode"
import PostsList from "./PostsList"
import PostDetail from "./PostDetail"
import WritePost from "./WritePost"
import NotFound from "./NotFound"
import ThemeToggle from "./ThemeToggle"
import ScrollToTop from './ScrollToTop'
import 'react-quill/dist/quill.snow.css'
import ReportsList from './ReportsList'
import Login from './Login'
import SignUp from './SignUp'
import Profile from './Profile'
import ProtectedRoute from './ProtectedRoute'

function Layout() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // ✅ 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded: any = jwtDecode(token)
        setUser(decoded)
      } catch {
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")
      }
    }
  }, [])

  // ✅ 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ✅ 로그아웃
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    setUser(null)
    setMenuOpen(false)
    navigate("/")
    window.location.reload() // 상태 업데이트를 위해 새로고침
  }

  return (
    <>
      <header className="app-header">
        <h1 className="site-title">
          <Link to="/">WriteFlow</Link>
        </h1>

        {/* 🔹 오른쪽 구역 전체 */}
        <div className="header-right" ref={menuRef}>
          {/* 로그인한 경우 탭을 오른쪽 정렬로 표시 */}
          {user && (
            <nav className="main-nav user-nav">
              <Link to="/read" className="nav-link">글 읽기</Link>
              <Link to="/write" className="nav-link">글 쓰기</Link>
              <Link to="/profile" className="nav-link">마이페이지</Link>
            </nav>
          )}

          {/* 로그인 / 회원가입 또는 마이페이지 */}
          {!user ? (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">로그인</Link>
              <Link to="/signup" className="signup-btn">회원가입</Link>
            </div>
          ) : (
            <div className="user-menu">
              <button onClick={() => setMenuOpen(!menuOpen)} className="mypage-btn">
                {user.nickname || user.username} ▼
              </button>
              {menuOpen && (
                <div className="dropdown-menu">
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>마이페이지</Link>
                  <Link to="/write" onClick={() => setMenuOpen(false)}>새 글 작성</Link>
                  <Link to="/my-posts" onClick={() => setMenuOpen(false)}>내 글 모음</Link>
                  <button onClick={handleLogout}>로그아웃</button>
                </div>
              )}
            </div>
          )}

          {/* 테마 토글 */}
          <ThemeToggle />
        </div>
      </header>

      <main>
        <AppRoutes />
      </main>
    </>
  )
}

function AppRoutes() {
  const location = useLocation()
  return (
    <Routes>
      {/* 기본 라우트 */}
      <Route path="/" element={<PostsList key="home" />} />
      <Route path="/board/:boardName" element={<PostsList key={location.pathname} />} />
      <Route path="/category/:categorySlug" element={<PostsList key={location.pathname} />} />
      <Route path="/tag/:slug" element={<PostsList key={location.pathname} />} />
      <Route path="/author/:id" element={<PostsList key={location.pathname} />} />
      <Route path="/popular" element={<PostsList key="popular" />} />
      <Route path="/read" element={<PostsList key="read" />} />

      {/* 인증 라우트 */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* 보호된 라우트 (로그인 필요) */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      <Route path="/write" element={
        <ProtectedRoute>
          <WritePost />
        </ProtectedRoute>
      } />

      <Route path="/my-posts" element={
        <ProtectedRoute>
          <PostsList key="my-posts" />
        </ProtectedRoute>
      } />

      {/* 검색 */}
      <Route path="/search" element={<PostsList key={`search-${location.search}`} />} />

      {/* 상세 / 수정 */}
      <Route path="/post/:emotion/:id" element={<PostDetail />} />
      <Route path="/edit/:id" element={
        <ProtectedRoute>
          <WritePost />
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
      <Route path="/reports" element={
        <ProtectedRoute>
          <ReportsList />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout />
    </BrowserRouter>
  )
}
