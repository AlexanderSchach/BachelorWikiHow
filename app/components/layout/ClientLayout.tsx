"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import NavBar from "./NavBar";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "../Sidebar";
import CategoryPage from "../categories/CategoryPage";
import GuidesShowcase from "../GuidesShowcase";

interface LayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Listen for auth state changes for login/logout
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // If unauthenticated and not on auth pages, redirect to login
    if (!loading && !user && !isLoginPage && !isRegisterPage) {
      router.replace("/login");
    }
  }, [user, loading, isLoginPage, isRegisterPage, router]);

  useEffect(() => {
    // Handle sidebar toggle via custom event (for global control)
    const toggleHandler = (e: any) => {
      if (typeof e.detail?.open === "boolean") {
        setSidebarOpen(e.detail.open);
        document.body.classList.toggle("sidebar-open", e.detail.open);
      }
    };

    window.addEventListener("sidebarToggle", toggleHandler);
    return () => window.removeEventListener("sidebarToggle", toggleHandler);
  }, []);

  // Avoid rendering layout during initial auth check or redirecting
  if (loading || (!user && !isLoginPage && !isRegisterPage)) {
    return null;
  }

  // Allow full-page rendering for auth pages
  if (isLoginPage || isRegisterPage) {
    return <>{children}</>;
  }

  return (
    <>
      {/* NavBar  */}
      <div className="sticky top-0 z-100 bg-[#240943]">
        <NavBar />
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Overlay for mobile sidebar toggle */}
        <div
          className={`fixed inset-0 bg-opacity-50 z-30 transition-opacity duration-300 ${
            sidebarOpen ? "block md:hidden" : "hidden"
          }`}
          onClick={() => {
            // Close sidebar when clicking outside
            window.dispatchEvent(
              new CustomEvent("sidebarToggle", { detail: { open: false } })
            );
            window.dispatchEvent(new Event("sidebarClose"));
          }}
        />

        {/* Main layout container */}
        <div className="flex flex-col flex-grow transition-all duration-300 w-full">
          {isHomePage && <Header />}

          <main
            className={`flex-grow transition-all duration-300 px-4 md:px-8 ${
              sidebarOpen ? "md:ml-[280px]" : "md:ml-[64px]"
            }`}
          >
            {isHomePage ? (
              <>
                <CategoryPage />
                <GuidesShowcase />
              </>
            ) : (
              children
            )}
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default ClientLayout;
