export default function AppButton({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`app-button app-button-${variant}`}
    >
      {children}
    </button>
  )
}