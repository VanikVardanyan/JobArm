import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at top left, rgba(242,107,29,0.22), transparent 35%), radial-gradient(circle at top right, rgba(43,138,87,0.12), transparent 28%), linear-gradient(135deg, #fff7ef 0%, #f6e6d4 100%)",
          color: "#1d1a16",
          padding: "56px",
          fontFamily: "Manrope, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            borderRadius: "36px",
            border: "1px solid rgba(80, 63, 42, 0.14)",
            background: "rgba(255, 252, 247, 0.82)",
            padding: "52px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "82px",
                height: "82px",
                borderRadius: "26px",
                background: "#1d1a16",
                color: "#fff7ef",
                fontSize: "28px",
                fontWeight: 800,
              }}
            >
              JA
            </div>
            <div style={{ display: "flex", fontSize: "54px", fontWeight: 800, letterSpacing: "-0.04em" }}>
              <span>job</span>
              <span style={{ color: "#f26b1d" }}>Arm</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "850px" }}>
            <div style={{ fontSize: "68px", lineHeight: 1.05, fontWeight: 800, letterSpacing: "-0.05em" }}>
              Быстрые задачи и подработка по всей Армении
            </div>
            <div style={{ fontSize: "30px", lineHeight: 1.35, color: "#4f473f" }}>
              Разовые заявки, срочная помощь и локальные подработки в одном простом сервисе.
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
