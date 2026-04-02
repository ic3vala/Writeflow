
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authApi } from './lib/authApi'
import { usePostsStore } from './store/posts'
import './Profile.css'

interface UserStats {
  totalPosts: number
  totalReactions: number
  emotionDistribution: Record<string, number>
  recentPosts: Array<{
    id: number
    content: string
    emotion: string
    createdAt: string
    totalReactions: number
  }>
}

export default function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loadPosts } = usePostsStore()

  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<UserStats>({
    totalPosts: 0,
    totalReactions: 0,
    emotionDistribution: {},
    recentPosts: []
  })
  const [loading, setLoading] = useState(true)

  // URL에서 tab 파라미터 확인
  const searchParams = new URLSearchParams(location.search)
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<'stats' | 'posts'>(tabParam === 'posts' ? 'posts' : 'stats')

  useEffect(() => {
    loadUserData()
  }, [location.pathname])

  useEffect(() => {
    if (tabParam === 'posts') {
      setActiveTab('posts')
    }
  }, [tabParam])

  const loadUserData = async () => {
    try {
      const userData = await authApi.getCurrentUser()
      setUser(userData)

      let userPosts = []

      try {
        const response = await fetch('http://localhost/api/posts/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          userPosts = data.items || []
        } else {
          const postsResponse = await loadPosts({ page: 0, size: 50 })
          userPosts = postsResponse.items.filter(
            (post: any) => post.authorName === userData.username
          )
        }
      } catch (apiError) {
        const postsResponse = await loadPosts({ page: 0, size: 50 })
        userPosts = postsResponse.items.filter(
          (post: any) => post.authorName === userData.username
        )
      }

      const emotionCount: Record<string, number> = {}
      let totalReactions = 0

      userPosts.forEach((post: any) => {
        const emotion = post.emotionLabel || post.emotion
        emotionCount[emotion] = (emotionCount[emotion] || 0) + 1

        post.buttons.forEach((button: any) => {
          totalReactions += button.clickCount || 0
        })
      })

      const recentPosts = userPosts
        .sort((a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5)
        .map((post: any) => ({
          id: post.id,
          content: post.content.length > 100
            ? post.content.substring(0, 100) + '...'
            : post.content,
          emotion: post.emotionLabel || post.emotion,
          createdAt: post.createdAt,
          totalReactions: post.buttons.reduce(
            (sum: number, button: any) => sum + (button.clickCount || 0),
            0
          )
        }))

      setStats({
        totalPosts: userPosts.length,
        totalReactions,
        emotionDistribution: emotionCount,
        recentPosts
      })
    } catch (error) {
      if (!authApi.isAuthenticated()) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm('정말 로그아웃 하시겠습니까?')) {
      authApi.logout()
      navigate('/')
      window.location.reload()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const EMOTION_COLORS: Record<string, string> = {
    '기쁨': '#FFD700',
    '분노': '#FF6B6B',
    '슬픔': '#4A90E2',
    '즐거움': '#50C878',
    '사랑': '#FF69B4',
    '미움': '#A9A9A9',
    '야망': '#FF8C00',
    'JOY': '#FFD700',
    'ANGER': '#FF6B6B',
    'SADNESS': '#4A90E2',
    'PLEASURE': '#50C878',
    'LOVE': '#FF69B4',
    'HATE': '#A9A9A9',
    'AMBITION': '#FF8C00',
  }

  const EMOTION_ICONS: Record<string, string> = {
    '기쁨': '😊',
    '분노': '😠',
    '슬픔': '😢',
    '즐거움': '😄',
    '사랑': '💕',
    '미움': '💔',
    '야망': '🔥',
    'JOY': '😊',
    'ANGER': '😠',
    'SADNESS': '😢',
    'PLEASURE': '😄',
    'LOVE': '💕',
    'HATE': '💔',
    'AMBITION': '🔥',
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>프로필 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h2>로그인이 필요합니다</h2>
          <p>프로필을 보려면 로그인해주세요.</p>
          <div className="profile-actions">
            <Link to="/login" className="profile-button primary">
              로그인
            </Link>
            <Link to="/signup" className="profile-button secondary">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <h1 className="profile-name">@{user.username}</h1>
        </div>

        <div className="profile-actions">
          <Link to="/write" className="profile-button primary">
            ✍️ 새 글 쓰기
          </Link>
          <button
            onClick={handleLogout}
            className="profile-button secondary"
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="profile-stats-overview">
        <div className="stat-card">
          <div className="stat-value">{stats.totalPosts}</div>
          <div className="stat-label">작성한 글</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.totalReactions}</div>
          <div className="stat-label">받은 반응</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            {Object.keys(stats.emotionDistribution).length}
          </div>
          <div className="stat-label">감정 종류</div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 감정 통계
        </button>
        <button
          className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          📝 최근 글
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'stats' ? (
          <div className="stats-section">
            <h3>감정 분포</h3>
            {Object.keys(stats.emotionDistribution).length > 0 ? (
              <div className="emotion-distribution">
                {Object.entries(stats.emotionDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([emotion, count]) => (
                    <div key={emotion} className="emotion-item">
                      <div className="emotion-header">
                        <span className="emotion-icon">
                          {EMOTION_ICONS[emotion] || '📝'}
                        </span>
                        <span className="emotion-name">{emotion}</span>
                        <span className="emotion-count">{count}개</span>
                      </div>
                      <div className="emotion-bar">
                        <div
                          className="emotion-bar-fill"
                          style={{
                            width: `${(count / stats.totalPosts) * 100}%`,
                            backgroundColor: EMOTION_COLORS[emotion] || '#4A90E2'
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="empty-state">아직 작성한 글이 없습니다.</p>
            )}
          </div>
        ) : (
          <div className="posts-section">
            <h3>최근 작성한 글</h3>
            {stats.recentPosts.length > 0 ? (
              <div className="recent-posts">
                {stats.recentPosts.map((post) => (
                  <div key={post.id} className="post-item">
                    <div className="post-header">
                      <span className="post-emotion">
                        {EMOTION_ICONS[post.emotion] || '📝'} {post.emotion}
                      </span>
                      <span className="post-date">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    <p className="post-content">{post.content}</p>
                    <div className="post-footer">
                      <span className="post-reactions">
                        ❤️ {post.totalReactions}개 반응
                      </span>
                      <Link
                        to={`/post/${post.emotion.toLowerCase()}/${post.id}`}
                        className="post-link"
                      >
                        글 보기 →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>아직 작성한 글이 없습니다.</p>
                <Link to="/write" className="empty-state-button">
                  첫 글 작성하기
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
