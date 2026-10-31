import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

const STATS = [
  { label: "Total Leads", value: "2,847", delta: "+12.4%" },
  { label: "Won Deals", value: "138", delta: "+8.1%" },
  { label: "Pending Tasks", value: "14", delta: "On track" },
];

const ACTIVITY = [
  { name: "Sarah Connor", action: "moved to Qualified", time: "2m ago", color: "#6366f1" },
  { name: "Global Dynamics", action: "proposal sent ($25k)", time: "14m ago", color: "#10b981" },
  { name: "Cyberdyne Corp", action: "deal closed — Won ✓", time: "1h ago", color: "#38bdf8" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail("admin@leadflow.io");
    setPassword("password123");
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Google authentication failed.");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>

      {/* LEFT: Login Form */}
      <div
        style={{
          flex: "0 0 490px",
          background: "#0f1117",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 56px",
          position: "relative",
          borderRight: "1px solid #1e2130",
        }}
      >
        {/* Brand */}
        <div style={{ position: "absolute", top: 36, left: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff" }}>
              LF
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: -0.3 }}>
              LeadFlow<span style={{ color: "#6366f1" }}>.</span>
            </span>
          </div>
        </div>

        <div style={{ maxWidth: 370, width: "100%" }}>
          <h1 style={{ fontSize: 27, fontWeight: 800, color: "#fff", lineHeight: 1.2, letterSpacing: -0.8, marginBottom: 6 }}>
            Welcome back to<br />
            <span style={{ color: "#6366f1" }}>your CRM workspace</span>
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
            Sign in with your email and password, or use Google OAuth.
          </p>

          {/* Demo autofill */}
          <div style={{ marginBottom: 18 }}>
            <button
              type="button"
              onClick={handleQuickDemo}
              style={{ width: "100%", padding: "8px 12px", background: "#1a2133", border: "1px dashed #38bdf8", borderRadius: 8, color: "#38bdf8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              ⚡ Autofill Demo Credentials
            </button>
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: 12 }}>
              {error}
            </div>
          )}

          {/* Google OAuth */}
          <div style={{ marginBottom: 18, display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google login could not be completed.")}
              theme="filled_black"
              shape="rectangular"
              size="large"
              text="signin_with"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: "#1f2937" }} />
            <span style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase" }}>or email</span>
            <div style={{ flex: 1, height: 1, background: "#1f2937" }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: 0.5, display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@leadflow.io"
                style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#161b27", border: "1px solid #1e2740", color: "#fff", fontSize: 13, outline: "none" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: 0.5, display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "11px 40px 11px 14px", borderRadius: 8, background: "#161b27", border: "1px solid #1e2740", color: "#fff", fontSize: 13, outline: "none" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: 6, padding: "12px", borderRadius: 8, background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loading ? "Signing in..." : <><span>Sign In</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: "#6b7280" }}>
            No account?{" "}
            <Link to="/register" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>
              Sign up
            </Link>
          </p>
        </div>

        <div style={{ position: "absolute", bottom: 24, left: 56, fontSize: 11, color: "#374151" }}>
          Protected by bcrypt & JWT
        </div>
      </div>

      {/* RIGHT: Visual Showcase */}
      <div style={{ flex: 1, background: "#0a0d14", display: "flex", flexDirection: "column", padding: "48px", overflow: "hidden" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6366f1", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>
            SaaS Platform Analytics
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
            Real-Time Pipeline Velocity
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#f9fafb" }}>{s.value}</div>
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: "#10b981" }}>{s.delta}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Pipeline Distribution</span>
            <span style={{ fontSize: 11, color: "#38bdf8", fontWeight: 600 }}>Connected to Atlas</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { stage: "New Leads", count: 47, pct: 38, color: "#38bdf8" },
              { stage: "Qualified", count: 31, pct: 62, color: "#6366f1" },
              { stage: "Proposal Sent", count: 19, pct: 44, color: "#f59e0b" },
              { stage: "Won Deals", count: 138, pct: 88, color: "#10b981" },
            ].map((row) => (
              <div key={row.stage} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 95, fontSize: 12, color: "#9ca3af" }}>{row.stage}</span>
                <div style={{ flex: 1, height: 6, background: "#1f2937", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${row.pct}%`, background: row.color, borderRadius: 99 }} />
                </div>
                <span style={{ width: 26, fontSize: 12, color: "#6b7280", textAlign: "right" }}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 18, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Recent Deals Log</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{a.name}</span>
                <span style={{ fontSize: 12, color: "#6b7280" }}>{a.action}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#4b5563" }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
