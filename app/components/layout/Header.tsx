"use client";

import "../../styles/Header.css";

const Header: React.FC = () => {
  return (
    <header className="header-bg" role="banner" aria-label="Header">
      <div className="header-content">
        <h1 className="how-to-wiki-heading">How-To-Wiki</h1>
        <p className="cta-text">
          Her finner du guider som gir deg praktiske verktøy og innsikt for å
          jobbe mer effektivt og profesjonelt.
        </p>
      </div>
    </header>
  );
};

export default Header;
