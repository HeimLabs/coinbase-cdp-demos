// components/CustomAuth.tsx
"use client";

import { useSignInWithEmail, useVerifyEmailOTP, useCurrentUser, useSignOut, useEvmAddress } from '@coinbase/cdp-hooks';
import { useState, type CSSProperties } from 'react';

export function CustomAuth() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [flowId, setFlowId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { signInWithEmail } = useSignInWithEmail();
  const { verifyEmailOTP } = useVerifyEmailOTP();
  const { currentUser } = useCurrentUser();
  const { signOut } = useSignOut();
  const { evmAddress } = useEvmAddress();

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "0.75rem 0.875rem",
    borderRadius: "0.75rem",
    border: "1px solid var(--cdp-example-card-border-color)",
    background: "var(--cdp-example-card-bg-color)",
    color: "var(--cdp-example-text-color)",
  };

  const buttonStyle: CSSProperties = {
    width: "100%",
    padding: "0.875rem 1rem",
    borderRadius: "9999px",
    border: "1px solid var(--cdp-example-accent-color)",
    background: "var(--cdp-example-accent-color)",
    color: "var(--cdp-example-accent-foreground-color)",
    cursor: "pointer",
    fontWeight: 500,
  };

  const subtleButtonStyle: CSSProperties = {
    background: "transparent",
    border: 0,
    color: "var(--cdp-example-accent-color)",
    cursor: "pointer",
    padding: 0,
  };

  const helpTextStyle: CSSProperties = {
    color: "var(--cdp-example-text-secondary-color)",
    fontSize: "0.9rem",
  };

  const errorTextStyle: CSSProperties = {
    color: "tomato",
    fontSize: "0.9rem",
  };

  const handleSignIn = async () => {
    try {
      setErrorMessage(null);
      setIsSending(true);
      const result = await signInWithEmail({ email });
      setFlowId(result.flowId);
    } catch (err: unknown) {
      setErrorMessage("Failed to send code. Please check the email and try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    try {
      setErrorMessage(null);
      setIsVerifying(true);
      await verifyEmailOTP({ flowId, otp });
    } catch (err: unknown) {
      setErrorMessage("Invalid code. Please try again or resend the code.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      setErrorMessage(null);
      setIsSending(true);
      const result = await signInWithEmail({ email });
      setFlowId(result.flowId);
    } catch (err: unknown) {
      setErrorMessage("Could not resend code. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleChangeEmail = () => {
    setFlowId("");
    setOtp("");
  };

  if (currentUser) {
    return (
      <div className="flex-col-container" style={{ gap: "0.75rem", width: "100%" }}>
        <p className="card-title">You're signed in</p>
        {evmAddress && (
          <p style={helpTextStyle}>
            Wallet: <span className="wallet-address">{evmAddress}</span>
          </p>
        )}
        <button style={buttonStyle} onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return (
    <div className="flex-col-container" style={{ gap: "1rem", width: "100%" }}>
      {!flowId && (
        <>
          <div style={{ width: "100%", textAlign: "left" }}>
            <label htmlFor="email-input" style={{ display: "block", marginBottom: "0.5rem" }}>Email address</label>
            <input
              id="email-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              autoComplete="email"
              required
            />
          </div>
          {errorMessage && <p role="alert" style={errorTextStyle}>{errorMessage}</p>}
          <button
            style={{ ...buttonStyle, opacity: isSending || !email ? 0.8 : 1 }}
            onClick={handleSignIn}
            disabled={isSending || !email}
          >
            {isSending ? "Sending code…" : "Send code"}
          </button>
          <p style={helpTextStyle}>We'll email you a 6-digit verification code.</p>
        </>
      )}

      {flowId && (
        <>
          <div style={{ width: "100%", textAlign: "left" }}>
            <label htmlFor="otp-input" style={{ display: "block", marginBottom: "0.5rem" }}>Enter 6-digit code</label>
            <input
              id="otp-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              style={inputStyle}
              autoComplete="one-time-code"
              required
            />
          </div>
          {errorMessage && <p role="alert" style={errorTextStyle}>{errorMessage}</p>}
          <button
            style={{ ...buttonStyle, opacity: isVerifying || otp.length !== 6 ? 0.8 : 1 }}
            onClick={handleVerify}
            disabled={isVerifying || otp.length !== 6}
          >
            {isVerifying ? "Verifying…" : "Verify"}
          </button>
          <div className="flex-row-container" style={{ gap: "1rem" }}>
            <button style={subtleButtonStyle} onClick={handleResend} disabled={isSending}>
              {isSending ? "Resending…" : "Resend code"}
            </button>
            <span style={helpTextStyle}>•</span>
            <button style={subtleButtonStyle} onClick={handleChangeEmail}>Change email</button>
          </div>
          <p style={helpTextStyle}>Code sent to {email}.</p>
        </>
      )}
    </div>
  );
}