import { useState } from "react";

interface Props {
  onUnlock: (pin: string) => boolean;
}

export default function ResultsLockBanner({ onUnlock }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = onUnlock(pin);
    if (!ok) {
      setError(true);
      setPin("");
    }
  }

  return (
    <form className="results-lock-banner" onSubmit={handleSubmit}>
      <p className="results-lock-text">
        Solo quien tiene el PIN puede cargar resultados. Ingresalo para habilitar la carga en este celular.
      </p>
      <div className="results-lock-row">
        <input
          type="password"
          inputMode="numeric"
          placeholder="PIN"
          className="results-lock-input"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError(false);
          }}
        />
        <button type="submit" className="btn-secondary results-lock-btn">
          Desbloquear
        </button>
      </div>
      {error && <p className="error">PIN incorrecto.</p>}
    </form>
  );
}
