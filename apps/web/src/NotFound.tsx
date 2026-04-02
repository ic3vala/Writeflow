import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <h2>페이지를 찾을 수 없습니다 😢</h2>
      <p>입력한 주소가 잘못되었거나, 삭제된 페이지입니다.</p>
      <Link
        to="/"
        style={{
          display: "inline-block",
          marginTop: "1.5rem",
          padding: "0.6rem 1.2rem",
          backgroundColor: "var(--primary)",
          color: "white",
          borderRadius: "6px",
          textDecoration: "none",
        }}
      >
        홈으로 이동
      </Link>
    </div>
  )
}
