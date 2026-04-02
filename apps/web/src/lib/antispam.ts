
type ActionType = 'post' | 'comment' | 'report';

// 각 행위별 쿨다운(ms)
const COOLDOWN: Record<ActionType, number> = {
  post: 60_000,    // 글 1분
  comment: 10_000, // 댓글 10초
  report: 60_000,  // 신고 1분
};

// 키 생성 (신고는 대상 포함)
function key(action: ActionType, targetKey?: string) {
  return targetKey ? `cooldown:${action}:${targetKey}` : `cooldown:${action}`;
}

// 지금 가능?
export function canDo(action: ActionType, targetKey?: string) {
  const k = key(action, targetKey);
  const last = Number(localStorage.getItem(k) || '0');
  const diff = Date.now() - last;
  const remain = COOLDOWN[action] - diff;
  if (remain > 0) {
    return { allowed: false, remain };
  }
  return { allowed: true, remain: 0 };
}

// 행동 기록
export function record(action: ActionType, targetKey?: string) {
  const k = key(action, targetKey);
  localStorage.setItem(k, String(Date.now()));
}

// 남은 시간 포맷
export function formatRemain(ms: number) {
  const s = Math.ceil(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}분 ${s % 60}초` : `${s}초`;
}
