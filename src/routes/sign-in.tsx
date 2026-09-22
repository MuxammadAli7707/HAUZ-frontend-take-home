import { useState } from 'react'
import { createFileRoute } from "@tanstack/react-router";

import {
  sendEmailCode,
  verifyEmailCode,
} from "../lib/server/auth";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      if (!isCodeSent) {
        await sendEmailCode({
          data: {
            email,
          },
        });

        setIsCodeSent(true);
        return;
      }

      await verifyEmailCode({
        data: {
          email,
          code,
        },
      });

    } catch {
      setError(
        isCodeSent
          ? "Неверный код или срок действия кода истёк."
          : "Не удалось отправить код. Проверьте email и попробуйте снова."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Sign in</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>

        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isCodeSent}
          required
        />

        {!isCodeSent ? (
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Get code"}
          </button>
        ) : (
          <>
            <label htmlFor="code">Verification code</label>

            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Enter code"
              required
            />

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Checking..." : "Sign in"}
            </button>
          </>
        )}

        {error && <p>{error}</p>}
      </form>
    </main>
  );
}
