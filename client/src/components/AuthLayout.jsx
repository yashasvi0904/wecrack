import { Logo } from "./ui";

// Centered glass card on the copper backdrop, shared by the login and register pages.
export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="apple-ui">
      <div className="ux-auth">
        <div className="ux-auth-card">
          <div className="ux-brand ux-auth-brand">
            <Logo />
            WeCrack
          </div>
          <h1 className="ux-auth-title">{title}</h1>
          <p className="ux-auth-sub">{subtitle}</p>
          {children}
          {footer && <div className="ux-auth-foot">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
