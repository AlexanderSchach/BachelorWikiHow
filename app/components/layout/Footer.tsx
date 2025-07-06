const Footer: React.FC = () => {
  return (
    <footer className="text-white z-10 py-17 bg-purple-900 relative">
      <div className="container mx-auto text-center px-6">
        <p className="mb-2 font-bold text-xl">hello@yobr.io</p>
        <p className="mb-4 text-md">Rosenkrantz' gate 4, 0159 Oslo, Norway</p>
        <a
          href="https://www.linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/LinkedINLogo.png"
            alt="LinkedIn"
            className="h-12 w-12 inline-block"
          />
        </a>
        <p className="mt-4 text-sm">&copy; 2024 Yobr. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
