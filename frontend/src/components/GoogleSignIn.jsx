import { useEffect, useRef, useState } from "react";

let scriptPromise;
function loadGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = resolve;
      script.onerror = () => { script.remove(); scriptPromise = null; reject(new Error("Google indisponível. Entre com e-mail e senha.")); };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export default function GoogleSignIn({ clientId, onCredential, disabled }) {
  const container = useRef(null);
  const callback = useRef(onCredential);
  const [error, setError] = useState("");
  useEffect(() => { callback.current = onCredential; }, [onCredential]);
  useEffect(() => {
    let active = true;
    loadGoogle().then(() => {
      if (!active) return;
      window.google.accounts.id.initialize({ client_id: clientId, auto_select: false,
        callback: (result) => { if (active) callback.current(result.credential); } });
      window.google.accounts.id.renderButton(container.current, {
        type: "standard", theme: "outline", size: "large", text: "continue_with",
        locale: "pt-BR", width: Math.min(400, container.current.clientWidth),
      });
    }).catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [clientId]);
  return <div className="google-sign-in">
    <span className="auth-divider">ou continue com</span>
    <div ref={container} inert={disabled} />
    {error && <p role="status">{error}</p>}
  </div>;
}
