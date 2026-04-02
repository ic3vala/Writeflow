import { useState, useEffect } from "react";
import axios from "axios";

// 게시글 타입 정의
interface Post {
  id: number;
  title: string;
  content?: string;
}

// 컴포넌트
export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:4000/api/posts")
      .then((res) => {
        console.log("서버 응답:", res.data); // 콘솔 확인용
        // 응답 구조: { items: [...] } 형태라고 가정
        setPosts(res.data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>게시글 목록</h1>
      <ul>
        {posts.length === 0 ? (
          <li>게시글이 없습니다.</li>
        ) : (
          posts.map((post) => <li key={post.id}>{post.title}</li>)
        )}
      </ul>
    </div>
  );
}
