const API_BASE = 'http://localhost/api';

export interface SignupRequest {
  email: string
  username: string
  password: string
  nickname: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
}

export interface UserInfo {
  id: number
  username: string
  nickname: string
  email: string
  createdAt: string
}

class AuthApi {
  async signup(data: SignupRequest): Promise<{ message: string }> {
    console.log('회원가입 요청 데이터:', data)

    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      console.log('회원가입 응답 상태:', response.status, response.statusText)

      const responseText = await response.text()
      console.log('회원가입 응답 본문:', responseText)

      if (!response.ok) {
        // 응답이 JSON인지 확인
        let errorMessage = '회원가입에 실패했습니다'
        try {
          const errorJson = JSON.parse(responseText)
          errorMessage = errorJson.message || errorJson.error || responseText
        } catch {
          errorMessage = responseText || '서버 오류가 발생했습니다'
        }
        throw new Error(errorMessage)
      }

      // 성공 응답 파싱
      try {
        return JSON.parse(responseText)
      } catch {
        return { message: '회원가입 성공' }
      }
    } catch (error: any) {
      console.error('회원가입 에러 상세:', error)
      throw error
    }
  }

  async login(data: LoginRequest): Promise<TokenResponse> {
    console.log('로그인 요청 데이터:', data)

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      console.log('로그인 응답 상태:', response.status, response.statusText)

      const responseText = await response.text()
      console.log('로그인 응답 본문:', responseText)

      if (!response.ok) {
        let errorMessage = '로그인에 실패했습니다'
        try {
          const errorJson = JSON.parse(responseText)
          errorMessage = errorJson.message || errorJson.error || responseText
        } catch {
          errorMessage = responseText || '서버 오류가 발생했습니다'
        }
        throw new Error(errorMessage)
      }

      return JSON.parse(responseText)
    } catch (error: any) {
      console.error('로그인 에러 상세:', error)
      throw error
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('토큰 갱신에 실패했습니다')
      }

      return response.json()
    } catch (error: any) {
      console.error('토큰 갱신 에러:', error)
      throw error
    }
  }

  // JWT 토큰에서 사용자 정보 추출
  async getCurrentUser(): Promise<UserInfo> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('로그인이 필요합니다');
    }
    try {
      // JWT 디코딩
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      // ✅ 사용자명(username)과 닉네임(nickname) 필드 확인
      // D부분 JWT 토큰 구조에 맞게 필드명 조정
      return {
            id: payload.userId || payload.id || 0,
            username: payload.username || '',
            nickname: payload.username || '',
            email: '',
            createdAt: payload.createdAt || new Date().toISOString(),
          };
    } catch (error) {
      console.error('JWT 디코딩 에러:', error);
      throw new Error('사용자 정보를 가져올 수 없습니다');
    }
  }

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token')
    if (!token) return false

    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )

      const payload = JSON.parse(jsonPayload)
      const expiry = payload.exp * 1000
      return Date.now() < expiry
    } catch {
      return false
    }
  }
}

export const authApi = new AuthApi()
