"use client";

import { useServerInsertedHTML } from "next/navigation";
import { useState, type ReactNode } from "react";
import { createStyleRegistry, StyleRegistry } from "styled-jsx";

export default function StyledJsxRegistry({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [registry] = useState(() => createStyleRegistry());

  useServerInsertedHTML(() => {
    const styles = registry.styles();
    registry.flush();
    return <>{styles}</>;
  });

  return <StyleRegistry registry={registry}>{children}</StyleRegistry>;
}
