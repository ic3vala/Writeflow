import "./WritePost.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePostsStore } from "./store/posts";
import { authApi } from './lib/authApi'

export default function WritePost() {
  const navigate = useNavigate();
  useEffect(() => {
      if (!authApi.isAuthenticated()) {
        navigate('/login')
      }
    }, [navigate])

  const { createPost } = usePostsStore();
  const BUTTON_OPTIONS = [
  { code: "EMPATHY", label: "공감" },
  { code: "COMFORT", label: "위로" },
  { code: "SAD", label: "슬픔" },
  { code: "HAPPY", label: "행복" },
  { code: "GOOD", label: "좋음" },
  { code: "ANGRY", label: "분노" },
  { code: "DISLIKE", label: "싫음" },
];

interface EmotionStamp {
  code: string;
  label: string;
}

  // 두 단계 UI
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [lastPostId, setLastPostId] = useState<number | null>(null);
  // 글 정보
  const [emotionCategory, setEmotionCategory] = useState("");
  const [content, setContent] = useState("");
  const [stampInput, setStampInput] = useState("");
  const [selectedButtons, setSelectedButtons] = useState<EmotionStamp[]>([]);


  const MAX_CHAR = 220;
  const countGraphemes = (text: string) => {
  return [...text].length;
};
// textarea와 동일한 스타일을 가진 숨겨진 div로 높이 계산
const updateHeight = (value: string) => {
  const mirror = document.getElementById("textarea-mirror");
  if (!mirror) return;

  mirror.textContent = value + "\u200b";

  const newHeight = mirror.scrollHeight;
  const textarea = document.getElementById("textarea") as HTMLTextAreaElement;
  if (textarea) textarea.style.height = newHeight + "px";
};
  useEffect(() => {
  // 페이지 진입 시 emotionCategory 초기화
  setEmotionCategory("");
  setStep(1);
}, []);



  // ---------------------------------------------------
  // 🔥 더미 LLM 요약
  // ---------------------------------------------------
  const fakeLLMSummary = (text: string) => {
    if (text.includes("슬프") || text.includes("힘들"))
      return "마음이 무거운 하루였네요.";
    if (text.includes("기쁨") || text.includes("좋아"))
      return "행복한 감정이 느껴져요.";
    return "당신의 감정이 잘 기록되었어요.";
  };

  // ---------------------------------------------------
  // 🔥 뒤로가기 버튼 (Step2 → Step1)
  // ---------------------------------------------------
  const goBackStep = () => {
    setSelectedButtons([]);
    setStep(1);
  };
  // ---------------------------------------------------
  // 🔥 최종 제출
  // ---------------------------------------------------

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!emotionCategory) {
      alert("감정을 먼저 선택해 주세요.");
      setStep(1);
      return;
    }

    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    if (selectedButtons.length === 0) {
      alert("최소 1개 이상의 버튼을 선택해주세요.");
      return;
    }

    // ✅ 게시글 생성 데이터 구성
    const payload = {
      content: content,
      emotion: emotionCategory.toUpperCase(),   // "JOY"
      buttons: selectedButtons.map(b => b.code)
    };

    console.log('📝 게시글 생성 시도:', payload);
    console.log('🔑 현재 토큰:', localStorage.getItem("token"));

    try {
      // ✅ store를 통해 게시글 생성
      const newPost = await createPost(payload);
      console.log('🎉 게시글 생성 완료:', newPost);

      const newPostId = newPost.id;
      setLastPostId(newPostId);

      setStep(3);

      // 초기화
      setContent("");
      setSelectedButtons([]);
      setStampInput("");

    } catch (err: any) {
      console.error('❌ 게시글 생성 오류:', err);
      alert("게시글 저장 실패: " + (err.message || "알 수 없는 오류"));
    }
  };



  const chooseEmotion = (emotion: string) => {
    setEmotionCategory(emotion);
    setSelectedButtons([]);        // 감정 바뀌면 버튼 초기화
  setStampInput("");
    setTimeout(() => setStep(2), 200);
  };

  return (
    <div className={`writepage-bg ${step === 1 ? "theme-default" : `theme-${emotionCategory}`}`}>
      <div className="write-wrapper">


        {/* STEP 1 - 감정 선택 */}
        <div className={`step step1 ${step === 1 ? "active" : "hidden"}`}>
          <button className="step-back" onClick={() => navigate(-1)}>←</button>
          <h2>오늘 당신의 감정은?</h2>
          <p className="subtitle">하루의 분위기를 가장 잘 표현하는 감정을 선택해 주세요.</p>

          <div className="emotion-buttons">
  <button data-emotion="joy" onClick={() => chooseEmotion("joy")}>😊 기쁨</button>
  <button data-emotion="anger" onClick={() => chooseEmotion("anger")}>😠 분노</button>
  <button data-emotion="sadness" onClick={() => chooseEmotion("sadness")}>😢 슬픔</button>
  <button data-emotion="pleasure" onClick={() => chooseEmotion("pleasure")}>😄 즐거움</button>
  <button data-emotion="love" onClick={() => chooseEmotion("love")}>💕 사랑</button>
  <button data-emotion="hate" onClick={() => chooseEmotion("hate")}>💔 미움</button>
  <button data-emotion="ambition" onClick={() => chooseEmotion("ambition")}>🔥 야망</button>
</div>


        </div>


        {/* STEP 2 - 글 작성 */}
        <div className={`step step2 ${step === 2 ? "active" : "hidden"}`}>
          <h3>당신의 감정을 기록해보세요</h3>

          {/* 뒤로가기 + 임시저장 */}
          <div className="write-controls">
          <h4>감정 버튼 선택 (최소 1개 ~ 최대 5개)</h4>



          </div>

         <form onSubmit={handleSubmit} className="write-form">
  <div className="textarea-wrapper">
    <div id="textarea-mirror" className="textarea-mirror"></div>

    <textarea
      id="textarea"
      className="textarea"
      value={content}
      onInput={(e) => {
        const value = (e.target as HTMLTextAreaElement).value;

        if (countGraphemes(value) <= MAX_CHAR) {
          setContent(value);
        }
        updateHeight(value);
      }}
      placeholder="지금 느끼는 감정을 자유롭게 남겨보세요… (최대 220자)"
    />
  </div>

  <div className="char-counter">
    {countGraphemes(content)}/{MAX_CHAR}
  </div>

 <div className="button-select-grid">
  {BUTTON_OPTIONS.map((opt) => {
    const isSelected = selectedButtons.some((s) => s.code === opt.code);
    return (
      <button
        key={opt.code}
        type="button"
        className={`stamp-select-btn ${isSelected ? "selected" : ""}`}
        onClick={() => {
          if (isSelected) {
            // 이미 선택 → 제거
            setSelectedButtons((list) => list.filter((s) => s.code !== opt.code));
          } else {
            // 선택 추가
            if (selectedButtons.length >= 5) {
              alert("버튼은 최대 5개까지 선택할 수 있습니다.");
              return;
            }
            setSelectedButtons([
              ...selectedButtons,
              { code: opt.code, label: opt.label }
            ]);
          }
        }}
      >
        {opt.label}
      </button>
    );
  })}
</div>


  <button type="submit" className="submit-btn">등록하기</button>
</form>


        </div>
        {step === 2 && (
  <div className="write-bottom-inside">
    <button className="back-btn" onClick={goBackStep}>←</button>

  </div>
)}
{/* STEP 3 - 등록 완료 화면 */}
<div className={`step step3 ${step === 3 ? "active" : "hidden"}`} style={{ textAlign: "center", paddingTop: "40px", paddingBottom: "60px" }}>

  <h2 style={{ marginBottom: "20px" }}>✓ 등록이 완료되었습니다.</h2>

  <p style={{ opacity: 0.8, marginBottom: "32px" }}>
    소중한 감정을 기록해주셔서 감사합니다.
  </p>

  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
    <button
      className="submit-btn"
      onClick={() => {
        navigate('/profile?tab=posts');
}}

    >
      내 글 읽기
    </button>

    <button
      className="submit-btn"
      onClick={() => navigate("/read")}
      style={{ background: "var(--accent-bg)", color: "var(--primary)" }}
    >
      다른 사람 글 읽기
    </button>
  </div>
</div>

      </div>

    </div>
  );
}
