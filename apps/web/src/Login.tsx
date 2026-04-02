import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from './lib/authApi'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await authApi.login(formData)

      // 토큰 저장
      localStorage.setItem('token', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)

      // 사용자 정보 저장
      const user = await authApi.getCurrentUser()
      localStorage.setItem('user', JSON.stringify(user))

      navigate('/', { replace: true })
      window.location.reload() // 상태 업데이트를 위해 새로고침
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">WriteFlow에 로그인</h2>
        <p className="auth-subtitle">당신의 감정을 기록하는 여정을 함께하세요</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">사용자명</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="사용자명을 입력하세요"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <div className="auth-links">
            <span>계정이 없으신가요?</span>
            <Link to="/signup" className="link-button">
              회원가입
            </Link>
          </div>

          <div className="auth-divider">
            <span>또는</span>
          </div>

          <Link to="/" className="auth-button secondary">
            홈으로 돌아가기
          </Link>
        </form>
      </div>

      <div className="auth-features">
        <div className="feature-item">
          <div className="feature-icon">✨</div>
          <div className="feature-content">
            <h3>감정을 기록하세요</h3>
            <p>당신의 감정을 7가지 색깔로 기록하고 공유해보세요</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon">🤗</div>
          <div className="feature-content">
            <h3>공감을 나누세요</h3>
            <p>다른 사람의 감정에 공감 버튼으로 응원의 메시지를 전하세요</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon">🔒</div>
          <div className="feature-content">
            <h3>안전한 공간</h3>
            <p>당신의 감정은 안전하게 보호됩니다</p>
          </div>
        </div>
      </div>
    </div>
  )
}
