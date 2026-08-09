@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap");

.login-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0c10;
  font-family: "Inter", sans-serif;
  position: relative;
  overflow: hidden;
  padding: 24px;
}

.login-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 620px;
  height: 620px;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle,
    rgba(79, 209, 197, 0.16) 0%,
    rgba(79, 209, 197, 0.05) 40%,
    transparent 70%
  );
  pointer-events: none;
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 380px;
  background: #14171d;
  border: 1px solid #232830;
  border-radius: 14px;
  padding: 40px 36px 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.login-mark {
  position: relative;
  width: 40px;
  height: 40px;
  margin-bottom: 24px;
}

.login-mark-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid #4fd1c5;
  opacity: 0.5;
}

.login-mark-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #4fd1c5;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 16px 2px rgba(79, 209, 197, 0.7);
}

.login-title {
  font-family: "Space Grotesk", sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: #edeff2;
  margin: 0 0 6px;
  letter-spacing: -0.01em;
}

.login-subtitle {
  font-size: 13.5px;
  line-height: 1.5;
  color: #8b93a1;
  margin: 0 0 28px;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.login-label {
  font-size: 12.5px;
  font-weight: 500;
  color: #8b93a1;
  margin-bottom: 6px;
  margin-top: 16px;
}

.login-label:first-of-type {
  margin-top: 0;
}

.login-input {
  background: #0e1015;
  border: 1px solid #232830;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  color: #edeff2;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s ease;
}

.login-input::placeholder {
  color: #4a5160;
}

.login-input:focus {
  border-color: #4fd1c5;
}

.login-error {
  margin-top: 16px;
  font-size: 13px;
  color: #f87171;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.25);
  border-radius: 8px;
  padding: 8px 10px;
}

.login-submit {
  margin-top: 24px;
  background: #4fd1c5;
  color: #0a0c10;
  border: none;
  border-radius: 8px;
  padding: 11px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
}

.login-submit:hover:not(:disabled) {
  background: #38b2ac;
}

.login-submit:disabled {
  opacity: 0.6;
  cursor: default;
}

.login-switch {
  margin-top: 22px;
  text-align: center;
  font-size: 13px;
  color: #8b93a1;
}

.login-switch button {
  background: none;
  border: none;
  color: #4fd1c5;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

@media (max-width: 420px) {
  .login-card {
    padding: 32px 24px 26px;
  }
}
