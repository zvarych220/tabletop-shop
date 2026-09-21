import SiteHeader from './SiteHeader.jsx'

export default function AppLayout({ title, links, children }) {
  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">Перейти до вмісту</a>
      <SiteHeader title={title} links={links} />
      
      <main id="main-content" tabIndex={-1} className="main-container">
        {children}
      </main>

      <footer className="site-footer">
        <p>© 2026 {title}. Навчальний проєкт (Лабораторна 1.2: Компонентна архітектура).</p>
      </footer>
    </div>
  )
}