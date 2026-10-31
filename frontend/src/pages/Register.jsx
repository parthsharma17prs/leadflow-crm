import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";

const FEATURES = [
  "Real-time Kanban pipeline with 6 deal stages",
  "Follow-up tracking with overdue detection",
  "Analytics dashboard with live MongoDB charts",
  "JWT-secured API with Zod validation",
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.response?.data?.errors?.[0]?.message) ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>

      {/* ══ LEFT — DARK BRAND SIDE ══ */}
      <div
        style={{
          flex: "0 0 480px",
          background: "#0a0d14",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 56px",
          position: "relative",
          borderRight: "1px solid #1e2130",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow */}
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ position: "absolute", top: 40, left: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff" }}>
              LF
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: -0.3 }}>
              LeadFlow<span style={{ color: "#6366f1" }}>.</span>
            </span>
          </div>
        </div>

        <div style={{ maxWidth: 360 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: -0.7, lineHeight: 1.25, marginBottom: 14 }}>
            Start closing deals<br />
            <span style={{ color: "#6366f1" }}>in minutes</span>
          </h2>
          <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6, marginBottom: 36 }}>
            Join sales teams who use LeadFlow to track, nurture, and convert their leads into revenue.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {FEATURES.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <CheckCircle2 size={16} color="#6366f1" style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 32, left: 56, fontSize: 11, color: "#374151" }}>
          © 2026 LeadFlow CRM — VyorAI Eval Edition
        </div>
      </div>

      {/* ══ RIGHT — FORM SIDE ══ */}
      <div
        style={{
          flex: 1,
          background: "#0f1117",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: -0.6, marginBottom: 8 }}>
            Create your account
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 32 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>

          {error && (
            <div style={{ marginBottom: 20, padding: "12px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Full Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "#1e2740")}
              />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Work Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "#1e2740")}
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password (min. 6 chars)</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "#1e2740")}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#4b5563", display: "flex", alignItems: "center" }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                padding: "14px",
                borderRadius: 10,
                background: loading ? "#4338ca" : "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                border: "none",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                letterSpacing: -0.2,
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Creating account...
                </>
              ) : (
                <>Get Started Free <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 11, color: "#374151", textAlign: "center" }}>
            By creating an account you agree to the evaluation terms.
          </p>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#9ca3af",
  letterSpacing: 0.4,
  display: "block",
  marginBottom: 8,
  textTransform: "uppercase",
};

const inputStyle = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 10,
  background: "#161b27",
  border: "1px solid #1e2740",
  color: "#fff",
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.2s",
};
