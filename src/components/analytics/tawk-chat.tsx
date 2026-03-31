import Script from "next/script";

const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
const tawkWidgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

export function TawkChat() {
  if (!tawkPropertyId || !tawkWidgetId) {
    return null;
  }

  return (
    <>
      <Script id="tawk-to-init" strategy="afterInteractive">
        {`
          window.Tawk_API = window.Tawk_API || {};
          window.Tawk_LoadStart = new Date();
        `}
      </Script>
      <Script
        id="tawk-to-widget"
        src={`https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
    </>
  );
}
