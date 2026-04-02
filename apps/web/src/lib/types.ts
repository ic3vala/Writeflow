// 버튼 집계
export interface ButtonStat {
  buttonType: string;   // "EMPATHY"
  label: string;        // "공감"
  clickCount: number;   // 0, 1, 2 ...
}

// 글 상세
export interface PostResponse {
  id: number;
  authorName: string;
  content: string;
  emotion: string;        // "JOY"
  emotionLabel: string;   // "기쁨"
  llmReply: string | null;
  hidden: boolean;
  reportedCount: number;
  createdAt: string;
  buttons: ButtonStat[];
}

// 목록 응답
export interface PostListResponse {
  items: PostResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// 생성 요청
export interface PostCreateRequest {
  content: string;
  emotion: string;
  buttons: string[];
}

// 버튼 클릭
export interface ButtonClickResponse {
  postId: number;
  clickedButtonType: string;
  buttons: ButtonStat[];
}
