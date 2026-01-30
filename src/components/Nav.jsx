import { NavLink } from 'react-router-dom'

export function Nav({ unseenCount = 0 }) {
  const base = "flex-1 flex flex-col items-center justify-center transition-colors"
  const active = "text-white"
  const inactive = "text-zinc-600"

  const badgeText = unseenCount > 99 ? '99+' : String(unseenCount)

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800" style={{ height: 'calc(72px + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <NavLink to="/" className={({ isActive }) => `${base} ${isActive ? active : inactive}`} style={{ gap: '6px' }}>
          <svg style={{ width: '28px', height: '28px' }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1a1 1 0 00.7-1.7l-9-9a1 1 0 00-1.4 0l-9 9A1 1 0 003 13z"/>
          </svg>
          <span style={{ fontSize: '11px' }} className="font-medium">Market</span>
        </NavLink>
        
        <NavLink to="/portfolio" className={({ isActive }) => `${base} ${isActive ? active : inactive} relative`} style={{ gap: '6px' }}>
          <div className="relative">
            <svg style={{ width: '28px', height: '28px' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            {unseenCount > 0 && (
              <div style={{ position: 'absolute', top: '-6px', right: '-6px', minWidth: '20px', height: '20px', backgroundColor: '#ff453a', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '4px', paddingRight: '4px' }}>
                <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold', lineHeight: '1' }}>{badgeText}</span>
              </div>
            )}
          </div>
          <span style={{ fontSize: '11px' }} className="font-medium">Portfolio</span>
        </NavLink>
        
        <NavLink to="/settings" className={({ isActive }) => `${base} ${isActive ? active : inactive}`} style={{ gap: '6px' }}>
          <svg style={{ width: '28px', height: '28px' }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.09 7.09 0 00-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z"/>
          </svg>
          <span style={{ fontSize: '11px' }} className="font-medium">Settings</span>
        </NavLink>
      </div>
    </nav>
  )
}

