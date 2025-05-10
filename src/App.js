import React, { useState } from "react";
import axios from "axios";

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;const ORG_ID = "org-62IhtDbGbFgvMGflmhrnJSEG";
const PROJECT_ID = "proj_HWuNpIqkxaALXYgzdejTVIFs";
const ASSISTANT_ID = "asst_T34faD70SYGlP1077OzqJnMd";

function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Merhaba, Kuveyt Türk-Meet in One Asistanına hoş geldiniz. Size istediğiniz startup çözümleri sunmak için buradayım. Lütfen bana istediğiniz startup çözümünü söyleyiniz.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = {
      role: "user",
      content: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const headers = {
        "Authorization": `Bearer ${API_KEY}`,
        "OpenAI-Organization": ORG_ID,
        "OpenAI-Project": PROJECT_ID,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      };
      const response = await axios.post(
        "https://api.openai.com/v1/threads",
        {
          messages: [
            { role: "user", content: input }
          ]
        },
        { headers }
      );
      const threadId = response.data.id;
      // Şimdi cevabı al
      const runRes = await axios.post(
        `https://api.openai.com/v1/threads/${threadId}/runs`,
        { assistant_id: ASSISTANT_ID },
        { headers }
      );
      // Cevap tamamlanana kadar bekle
      let runStatus = runRes.data.status;
      let runId = runRes.data.id;
      let answer = "";
      while (runStatus !== "completed" && runStatus !== "failed") {
        await new Promise((r) => setTimeout(r, 1500));
        const statusRes = await axios.get(
          `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
          { headers }
        );
        runStatus = statusRes.data.status;
      }
      if (runStatus === "completed") {
        const msgRes = await axios.get(
          `https://api.openai.com/v1/threads/${threadId}/messages`,
          { headers }
        );
        const assistantMsg = msgRes.data.data.find((m) => m.role === "assistant");
        answer = assistantMsg?.content[0]?.text?.value || "Bir hata oluştu.";
      } else {
        answer = "Bir hata oluştu.";
      }
      setMessages((msgs) => [
        ...msgs,
        {
          role: "assistant",
          content: answer,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      console.error("OpenAI API Hatası:", err?.response?.data || err);
      setMessages((msgs) => [
        ...msgs,
        {
          role: "assistant",
          content: "Bir hata oluştu. Lütfen tekrar deneyin.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
    setLoading(false);
  };

  // Yardımcı fonksiyon: Bot cevabını HTML'e dönüştür
  function formatBotMessage(text) {
    if (!text) return "";
    // Girişim isimlerini **ABC** yerine <b>ABC</b> yap
    let formatted = text.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

    // Sadece linkleri tıklanabilir yap, sonunda ')' varsa link dışında bırak
    formatted = formatted.replace(/(https?:\/\/[^\s\n\)]+)(\))?/g, function(_, link, paren) {
      if (paren) {
        return `<a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a> )`;
      } else {
        return `<a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a>`;
      }
    });

    return formatted;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9f8", backgroundImage: "radial-gradient(circle at 20% 20%, #e6ede7 2%, transparent 80%)" }}>
      <div style={{ background: "#066a5d", padding: "14px 0 14px 48px", display: "flex", alignItems: "center", boxShadow: "0 2px 12px #066a5d11" }}>
        <img src="/Logos/beyaz_logo.png" alt="Kuveyt Türk" style={{ height: 38, borderRadius: 10, boxShadow: "0 1px 6px #0001" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40 }}>
        <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 32px #0003, 0 2px 12px #066a5d22", width: 430, maxWidth: "98vw", minHeight: 440, display: "flex", flexDirection: "column", border: "1.5px solid #e6ede7", overflow: "hidden", transition: "box-shadow 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", paddingTop: 28, paddingBottom: 10, background: "#fff" }}>
            <img src="/Logos/meetinone_logo.png" alt="MeetInOne" style={{ height: 44, boxShadow: "0 2px 8px #0001", borderRadius: 14 }} />
          </div>
          <div style={{ height: 1, background: "linear-gradient(90deg, #e6ede7 0%, #bfa14a33 100%)", margin: "0 28px 0 28px" }} />
          <div style={{ flex: 1, padding: 22, overflowY: "auto", display: "flex", flexDirection: "column", gap: 18, maxHeight: 360, background: "#f8f9f8" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "80%", transition: "all 0.2s" }}>
                {msg.role === "assistant" ? (
                  <div style={{
                    background: msg.role === "user"
                      ? "linear-gradient(135deg, #e6f4f1 60%, #bfa14a22 100%)"
                      : "linear-gradient(135deg, #e6ede7 60%, #066a5d11 100%)",
                    color: "#222",
                    borderRadius: msg.role === "user" ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
                    padding: "13px 18px",
                    fontSize: 16,
                    boxShadow: msg.role === "user" ? "0 2px 8px #bfa14a22" : "0 2px 8px #066a5d11",
                    border: msg.role === "user" ? "1.5px solid #bfa14a33" : "1.5px solid #e6ede7",
                    animation: "fadeIn 0.4s",
                    wordBreak: "break-word"
                  }}
                  dangerouslySetInnerHTML={{ __html: formatBotMessage(msg.content) }}
                  />
                ) : (
                  <div style={{
                    background: msg.role === "user"
                      ? "linear-gradient(135deg, #e6f4f1 60%, #bfa14a22 100%)"
                      : "linear-gradient(135deg, #e6ede7 60%, #066a5d11 100%)",
                    color: "#222",
                    borderRadius: msg.role === "user" ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
                    padding: "13px 18px",
                    fontSize: 16,
                    boxShadow: msg.role === "user" ? "0 2px 8px #bfa14a22" : "0 2px 8px #066a5d11",
                    border: msg.role === "user" ? "1.5px solid #bfa14a33" : "1.5px solid #e6ede7",
                    animation: "fadeIn 0.4s",
                    wordBreak: "break-word"
                  }}>{msg.content}</div>
                )}
                <div style={{ fontSize: 11, color: "#888", marginTop: 4, textAlign: msg.role === "user" ? "right" : "left" }}>{msg.time}</div>
              </div>
            ))}
            {loading && <div style={{ color: "#888", fontSize: 14, fontStyle: "italic" }}>Yanıt yazılıyor...</div>}
          </div>
          <form onSubmit={sendMessage} style={{ display: "flex", borderTop: "1.5px solid #e6ede7", padding: 18, gap: 12, background: "#fff" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mesajınızı yazın..."
              style={{ flex: 1, border: "1.5px solid #e6ede7", outline: "none", fontSize: 17, padding: "13px 16px", borderRadius: 12, background: "#f8f9f8", transition: "border 0.2s", boxShadow: "0 1px 4px #0001" }}
              disabled={loading}
              autoFocus
            />
            <button type="submit" disabled={loading || !input.trim()} style={{ background: loading || !input.trim() ? "#bfa14a55" : "#bfa14a", border: "none", borderRadius: 12, color: "#fff", padding: "0 26px", fontWeight: 700, fontSize: 22, cursor: loading || !input.trim() ? "not-allowed" : "pointer", boxShadow: "0 1px 4px #bfa14a22", transition: "background 0.2s" }}>
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2 .01 7z"/></svg>
            </button>
          </form>
        </div>
      </div>
      <div style={{ textAlign: "center", color: "#888", fontSize: 13, marginTop: 40 }}>
        © 2025 Kuveyt Türk MeetInOne. Tüm hakları saklıdır.
      </div>
      <style>{`
        @media (max-width: 600px) {
          .chatbox { width: 99vw !important; min-width: 0 !important; }
          .chatbox input, .chatbox button { font-size: 15px !important; padding: 10px !important; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App; 