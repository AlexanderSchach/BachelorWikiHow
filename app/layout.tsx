import "./styles/globals.css";
import ClientLayout from "./components/layout/ClientLayout";
import { AuthProvider } from "./context/AuthProvider";
import { FilterProvider } from "../app/context/FilterContext";

// Static site metadata (Tab title and icon)
export const metadata = {
  title: "Yobr Wiki-How",
  description: "Beskrivelse av nettstedet",
  icons: {
    icon: "/yobr.png",
  },
};

// Root layout component applied to all pages
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body>
        {/* Global auth and filter state providers */}
        <AuthProvider>
          <FilterProvider>
            {/* Shared UI layout (header, footer, etc.) */}
            <ClientLayout>{children}</ClientLayout>
          </FilterProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
