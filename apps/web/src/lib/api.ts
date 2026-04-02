// ✅ 게이트웨이(80 포트)를 통해 모든 요청 전송
const BASE_URL = "http://localhost/api";

function authHeaders() {
  const token = localStorage.getItem("token"); // ✅ 'token' 키로 저장된 JWT 토큰
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export async function apiGet(url: string) {
  const res = await fetch(BASE_URL + url, {
    headers: {
      ...authHeaders(),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ API GET 요청 실패: ${url}`, {
      status: res.status,
      statusText: res.statusText,
      error: errorText
    });
    throw new Error(errorText);
  }
  return res.json();
}

export async function apiPost(url: string, body?: any) {
  console.log('📤 API POST 요청:', `${BASE_URL}${url}`);
  console.log('📦 요청 데이터:', body);
  console.log('🔑 사용자 토큰:', localStorage.getItem("token"));

  const res = await fetch(BASE_URL + url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  console.log('📥 API 응답 상태:', res.status, res.statusText);

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ API POST 요청 실패: ${url}`, {
      status: res.status,
      statusText: res.statusText,
      error: errorText
    });
    throw new Error(errorText || 'API 요청 실패');
  }

  const data = await res.json();
  console.log('✅ API 응답 데이터:', data);
  return data;
}

export async function apiDelete(url: string) {
  const res = await fetch(BASE_URL + url, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ API DELETE 요청 실패: ${url}`, errorText);
    throw new Error(errorText);
  }
  return true;
}
