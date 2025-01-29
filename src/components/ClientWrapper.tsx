"use client";

import dynamic from "next/dynamic";

const Land = dynamic(() => import('./Land'), {
  ssr: false,
});

export default function ClientWrapper() {
  return <Land />;
}
