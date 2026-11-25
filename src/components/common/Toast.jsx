export default function Toast({ message }) {
  return (
    <div className={`toast ${message ? 'show' : ''}`} role="alert" aria-live="assertive">
      {message}
    </div>
  );
}
