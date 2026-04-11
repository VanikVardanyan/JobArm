"use client";

import { useEffect, useState } from "react";

export default function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium shadow-xl transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {message}
    </div>
  );
}
