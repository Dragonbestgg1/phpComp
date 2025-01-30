"use client";

import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";

const Land = dynamic(() => import('./Land'), {
  ssr: false,
});

export default function ClientWrapper() {
  return (
    <SessionProvider>
      <Land />
    </SessionProvider>
  );
}
