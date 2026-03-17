import type { Metadata } from "next";
import type { JSX, ReactNode } from "react";

import "@awesome.me/webawesome/dist/styles/webawesome.css";

import { WebAwesomeRegistry } from "@/presentation/shared";

import "./globals.css";

export const metadata: Metadata = {
  title: "GoFundMe V2",
  description: "Project scaffold placeholder for the modular monolith MVP.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({
  children,
}: RootLayoutProps): JSX.Element {
  return (
    <html lang="en">
      <body>
        <WebAwesomeRegistry />
        {children}
      </body>
    </html>
  );
}
