import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'


interface Report {
  postId: number
  title?: string
  commentId?: number
  author?: string
  authorId?: string
  text?: string
  reason: string
  detail?: string
  createdAt: string
  isRegisteredUser?: boolean
}

interface BannedUser {
  authorId: string
  author?: string
  expiresAt: number
  isRegisteredUser?: boolean
}

export default function ReportsList() {
  const [reports, setReports] = useState<Report[]>([])
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([])
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  // ✅ 신고 내역 및 정지 내역 불러오기
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('reports') || '[]')
    setReports(saved)
    const banned = JSON.parse(localStorage.getItem('bannedUsers') || '[]')
    setBannedUsers(banned)
  }, [])

  // ✅ 신고 삭제
  const handleDeleteReport = (index: number) => {
    if (!confirm('이 신고 내역을 삭제하시겠습니까?')) return
    const updated = reports.filter((_, i) => i !== index)
    setReports(updated)
    localStorage.setItem('reports', JSON.stringify(updated))
  }

  // ✅ 사용자 정지 (중복 방지 + 해당 신고 자동 삭제)
const handleBanUser = (authorId?: string, author?: string, index?: number) => {
  if (!authorId) {
    alert('🚫 식별할 수 없는 사용자입니다. (authorId 없음)')
    return
  }

  const banned = JSON.parse(localStorage.getItem('bannedUsers') || '[]')
  const already = banned.find((b: BannedUser) => b.authorId === authorId)
  if (already && Date.now() < already.expiresAt) {
    alert('⚠️ 이미 정지 중인 사용자입니다.')
    return
  }

  const daysStr = prompt('정지 기간(일)을 입력하세요 (예: 3)', '3')
  if (!daysStr) return
  const days = parseInt(daysStr, 10)
  if (isNaN(days) || days <= 0) {
    alert('정지 기간이 올바르지 않습니다.')
    return
  }

  // ✅ 추가: 정지 사유 입력
  const reason = prompt('정지 사유를 입력하세요 (예: 욕설, 도배, 불법광고 등)', '이용 약관 위반') || '사유 없음'

  const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000
  const updatedBanned = [...banned, { authorId, author, expiresAt, reason }]
  localStorage.setItem('bannedUsers', JSON.stringify(updatedBanned))
  setBannedUsers(updatedBanned)

  alert(`✅ ${author || '익명 사용자'}가 ${days}일간 정지되었습니다.\n사유: ${reason}`)

  // ✅ 해당 신고 자동 삭제
  if (typeof index === 'number') {
    const updatedReports = reports.filter((_, i) => i !== index)
    setReports(updatedReports)
    localStorage.setItem('reports', JSON.stringify(updatedReports))
  }
}


  // ✅ 정지 해제
  const handleUnbanUser = (authorId: string) => {
    if (!confirm('이 사용자의 정지를 해제하시겠습니까?')) return
    const updated = bannedUsers.filter((b) => b.authorId !== authorId)
    setBannedUsers(updated)
    localStorage.setItem('bannedUsers', JSON.stringify(updated))
    alert('정지가 해제되었습니다.')
  }

  // ✅ 만료된 정지 자동 정리
  useEffect(() => {
    const now = Date.now()
    const active = bannedUsers.filter((b) => b.expiresAt > now)
    if (active.length !== bannedUsers.length) {
      setBannedUsers(active)
      localStorage.setItem('bannedUsers', JSON.stringify(active))
    }
  }, [bannedUsers])

  // ✅ 남은 시간 계산
  const getRemaining = (expiresAt: number) => {
    const diff = expiresAt - Date.now()
    if (diff <= 0) return '만료됨'
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
    if (days > 0) return `${days}일 ${hours}시간 남음`
    if (hours > 0) return `${hours}시간 ${minutes}분 남음`
    return `${minutes}분 남음`
  }

  // ✅ 페이지네이션
  const totalPages = Math.ceil(reports.length / itemsPerPage)
  const currentReports = reports.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  return (
    <div className="container">
      <h1>🚨 신고 내역 및 사용자 정지 관리</h1>

      {reports.length === 0 ? (
        <p>신고 내역이 없습니다.</p>
      ) : (
        <>
          <ul className="report-list">
            {currentReports.map((r, i) => (
              <li key={i} className="report-item">
                {r.commentId ? (
  <>
    <strong>
      💬 댓글 신고 (
      <Link
        to={`/post/${r.postId}`}
        target="_blank"
        style={{
          color: 'var(--primary)',
          textDecoration: 'underline',
          cursor: 'pointer',
        }}
      >
        게시글 #{r.postId}로 이동
      </Link>
      )
    </strong>

    <p>
      <b>작성자:</b>{' '}
      {r.authorId ? (
        r.isRegisteredUser ? (
          <span className="report-author-login">
            ✍️ {r.author}{' '}
            <span className="author-id">({r.authorId})</span>
          </span>
        ) : (
          <span className="report-author-anon">
            👤 익명{' '}
            <span className="author-id">({r.authorId})</span>
          </span>
        )
      ) : (
        <span style={{ color: '#c0392b' }}>❌ 알 수 없음</span>
      )}
    </p>

    {/* ✅ 신고된 댓글 내용 표시 */}
    <p>
      <b>댓글 내용:</b>{' '}
      <span
        style={{
          display: 'inline-block',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          padding: '6px 8px',
          borderRadius: '6px',
          color: 'var(--text)',
        }}
      >
        {r.text?.slice(0, 120) || '(내용 없음)'}
      </span>
    </p>
  </>
) : (
  <>
    <strong>
      📄 게시글 신고 (
      <Link
        to={`/post/${r.postId}/${encodeURIComponent(
          (r.title || '제목없음').toLowerCase().replace(/[^\w가-힣]+/g, '-')
        )}`}
        target="_blank"
        style={{
          color: 'var(--primary)',
          textDecoration: 'underline',
          cursor: 'pointer',
        }}
      >
        ID: {r.postId}
      </Link>
      )
    </strong>
    <p>
      <b>작성자:</b>{' '}
      {r.authorId ? (
        <span className="report-author-anon">
          👤 {r.author || '익명'}{' '}
          <span className="author-id">({r.authorId})</span>
        </span>
      ) : (
        <span style={{ color: '#c0392b' }}>❌ 알 수 없음</span>
      )}
    </p>
    <p>
      <b>제목:</b>{' '}
      {r.title ? (
        <Link
          to={`/post/${r.postId}/${encodeURIComponent(
            (r.title || '제목없음').toLowerCase().replace(/[^\w가-힣]+/g, '-')
          )}`}
          target="_blank"
          style={{
            color: 'var(--primary)',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          {r.title}
        </Link>
      ) : (
        '(제목 없음)'
      )}
    </p>
    {r.detail && <p><b>신고 설명:</b> {r.detail}</p>}
  </>
)}

                <p><b>사유:</b> {r.reason}</p>
                <p><b>신고일:</b> {new Date(r.createdAt).toLocaleString('ko-KR')}</p>

                <div className="report-actions">
                  <button
                    onClick={() => handleDeleteReport(i)}
                    className="report-btn report-delete"
                  >
                    🗑 삭제
                  </button>
                  <button
                    onClick={() => handleBanUser(r.authorId, r.author, (page - 1) * itemsPerPage + i)}
                    className="report-btn report-ban"
                  >
                    ⛔ 사용자 정지
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  className={page === idx + 1 ? 'active' : ''}
                  onClick={() => setPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* 🚫 정지된 사용자 목록 */}
      <div className="banned-users" style={{ marginTop: '30px' }}>
        <h2>🚫 정지된 사용자 목록</h2>
        {bannedUsers.length === 0 ? (
          <p>현재 정지된 사용자가 없습니다.</p>
        ) : (
          <ul>
            {bannedUsers.map((u, i) => (
              <li key={i}>
                {u.isRegisteredUser ? (
                  <span className="report-author-login">
                    ✍️ {u.author} <span className="author-id">({u.authorId})</span>
                  </span>
                ) : (
                  <span className="report-author-anon">
                    👤 익명 <span className="author-id">({u.authorId})</span>
                  </span>
                )}{' '}
                — {getRemaining(u.expiresAt)}
                {u.reason && (
  <p style={{ margin: '4px 0 0 0', color: 'var(--muted)', fontSize: '14px' }}>
    📝 사유: {u.reason}
  </p>
)}

                <button
                  onClick={() => handleUnbanUser(u.authorId)}
                  className="report-btn report-unban"
                >
                  🔓 해제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
