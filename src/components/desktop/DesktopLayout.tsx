import React from 'react';
import '../../styles/desktop-tokens.css';

interface DesktopLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  children,
  sidebar,
  header,
}) => {
  return (
    <div className="desktop-layout">
      {sidebar}
      <div className="desktop-main">
        {header}
        <main className="desktop-content">{children}</main>
      </div>
      
      <style>{`
        .desktop-layout {
          display: flex;
          min-height: 100vh;
          background: var(--desktop-white-500);
          font-family: var(--desktop-font-family);
          min-width: var(--desktop-min-width);
        }
        
        .desktop-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-left: var(--desktop-sidebar-width);
        }
        
        .desktop-content {
          flex: 1;
          padding: var(--desktop-content-padding);
          padding-top: calc(var(--desktop-header-height) + var(--desktop-content-padding));
        }
      `}</style>
    </div>
  );
};
