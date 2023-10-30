'use client';
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import CssBaseline from "@mui/material/CssBaseline";
import type { Metadata } from "next";
import { addRxPlugin } from "rxdb";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { DatabaseProvider } from "@swift-buy/database";

addRxPlugin(RxDBDevModePlugin);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CssBaseline />
        <DatabaseProvider>{children}</DatabaseProvider>
      </body>
    </html>
  );
}
