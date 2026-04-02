import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from './lib/authApi'
import './Auth.css'

export default function SignUp() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // 입력 시 에러 초기화
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.includes('@')) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요';
    }
    if (formData.username.length < 3) {
      newErrors.username = '사용자명은 3자 이상이어야 합니다';
    }
    if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
    }

    if (formData.password.length > 128) {
      newErrors.password = '비밀번호는 128자 이하여야 합니다';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }
    if (formData.nickname.length < 2) {
      newErrors.nickname = '닉네임은 2자 이상이어야 합니다';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await authApi.signup({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        nickname: formData.nickname,
      })

      // 회원가입 성공 시 자동 로그인
      const loginData = await authApi.login({
        username: formData.username,
        password: formData.password,
      })

      localStorage.setItem('token', loginData.accessToken)
      localStorage.setItem('refreshToken', loginData.refreshToken)

      const user = await authApi.getCurrentUser()
      localStorage.setItem('user', JSON.stringify(user))

      navigate('/', { replace: true })
      window.location.reload()
    } catch (err: any) {
      const errorMessage = err.message.toLowerCase()
      if (errorMessage.includes('email')) {
        setErrors({ email: '이미 사용 중인 이메일입니다' })
      } else if (errorMessage.includes('username')) {
        setErrors({ username: '이미 사용 중인 사용자명입니다' })
      } else if (errorMessage.includes('nickname')) {
        setErrors({ nickname: '이미 사용 중인 닉네임입니다' })
      } else {
        setErrors({ general: '회원가입에 실패했습니다. 다시 시도해주세요.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">WriteFlow에 가입하기</h2>
        <p className="auth-subtitle">감정 기록의 여정을 시작하세요</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="auth-error">
              ⚠️ {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@writeflow.com"
              required
              disabled={loading}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="username">사용자명</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="사용자명 (3자 이상)"
              required
              disabled={loading}
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="nickname">닉네임</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="사용할 닉네임"
              required
              disabled={loading}
              className={errors.nickname ? 'error' : ''}
            />
            {errors.nickname && <span className="field-error">{errors.nickname}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호 (8자 이상)"
              required
              disabled={loading}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호를 다시 입력하세요"
              required
              disabled={loading}
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? '가입하는 중...' : '회원가입'}
          </button>

          <div className="auth-links">
            <span>이미 계정이 있으신가요?</span>
            <Link to="/login" className="link-button">
              로그인
            </Link>
          </div>

          <div className="auth-divider">
            <span>또는</span>
          </div>

          <Link to="/" className="auth-button secondary">
            홈으로 돌아가기
          </Link>
        </form>

        <div className="terms-notice">
          <p>가입 시 WriteFlow의 <Link to="/terms">이용약관</Link>과 <Link to="/privacy">개인정보처리방침</Link>에 동의하게 됩니다.</p>
        </div>
      </div>

      <div className="auth-benefits">
        <h3>WriteFlow 회원이 되시면...</h3>
        <ul className="benefits-list">
          <li>✨ 7가지 감정으로 당신의 하루를 기록하세요</li>
          <li>🤗 다른 사용자들의 감정에 공감하며 소통하세요</li>
          <li>📊 당신의 감정 패턴을 통계로 확인하세요</li>
          <li>🔒 안전하고 익명성이 보장된 공간에서 자유롭게 표현하세요</li>
          <li>🎨 감정에 따른 색상 테마로 더 풍부한 경험을 하세요</li>
        </ul>
      </div>
    </div>
  )
}
