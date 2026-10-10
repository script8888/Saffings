import { FirebaseError } from "firebase/app";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { PrimaryButton } from "./ui";

/** The user backing out of the popup isn't an error worth an alert. */
const DISMISSED = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];

export function SignIn() {
  function signIn() {
    signInWithPopup(auth, googleProvider).catch((e: unknown) => {
      if (e instanceof FirebaseError && DISMISSED.includes(e.code)) return;
      alert(`Couldn't sign in: ${e instanceof Error ? e.message : e}`);
    });
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[620px] flex-col justify-center px-[18px]">
      <h1 className="m-0 text-[26px] font-extrabold tracking-[-0.02em]">Wallets</h1>
      <p className="mt-2 mb-4 text-sm leading-relaxed text-muted">
        Sign in to keep your wallets in your Google account and open them on any device. If
        this phone already has wallets, they move into your account the first time.
      </p>
      <PrimaryButton type="button" onClick={signIn}>
        Sign in with Google
      </PrimaryButton>
    </div>
  );
}
