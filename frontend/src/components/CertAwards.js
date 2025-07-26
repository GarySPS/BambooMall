import React from "react";

// Main badge medals (gold PNGs)
const badges = [
  { img: "/iso.png", label: "ISO 9001:2015" },
  { img: "/verified.png", label: "Verified Exporter" },
  { img: "/security.png", label: "Cyber Security" },
  { img: "/safety.png", label: "Global Trade" },
];

// Real certificate images (large, clear)
const certImgs = [
  { img: "/1.jpg", alt: "Business License or ISO Certificate" },
  { img: "/2.jpg", alt: "Verified Exporter License" },
  { img: "/3.jpg", alt: "International Trade Compliance" }
];

export default function CertAwards() {
  return (
<section className="w-full py-8 px-2">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <h2
          className="text-4xl md:text-5xl font-extrabold text-center mb-14"
          style={{
            color: "#20724a",
            letterSpacing: "0.01em",
            textShadow: "0 2px 8px #fff6e5",
            lineHeight: 1.15,
          }}
        >
          Certifications &amp; Awards
        </h2>

        {/* Badges: 4 in a row, premium look */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 mb-10 w-full">
          {badges.map((badge, i) => (
            <div
              key={i}
              className="flex flex-col items-center w-full"
              style={{ minWidth: "120px" }}
            >
              <img
                src={badge.img}
                alt={badge.label}
                className="w-32 h-32 md:w-40 md:h-40 object-contain mb-3"
                style={{
                  background: "transparent",
                  filter: "drop-shadow(0 3px 15px #f5e4b8)",
                }}
                draggable={false}
              />
              <div
                className="text-base md:text-lg font-bold text-center"
                style={{
                  color: "#b68b1d",
                  textShadow: "0 1px 4px #f2dfad",
                  letterSpacing: "0.01em",
                  minHeight: "2.7rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {badge.label}
              </div>
            </div>
          ))}
        </div>

        {/* Section highlight for trust */}
        <div className="text-lg md:text-xl text-green-800 opacity-90 text-center mb-12 max-w-2xl">
          <span style={{ fontWeight: 600 }}>BambooMall</span> is officially certified and regularly audited for global trade security, business standards, and international compliance.
        </div>

        {/* Real Certificates - with premium gold border card */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-8 items-center justify-center w-full mb-6">
          {certImgs.map((cert, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center w-full premium-certificate-card"
              style={{ minWidth: 270, maxWidth: 420 }}
            >
              <img
                src={cert.img}
                alt={cert.alt}
                className="w-full h-auto rounded-lg object-contain"
                style={{
                  minHeight: "330px",
                  maxHeight: "440px",
                  objectFit: "contain",
                  marginBottom: "0.5rem",
                  userSelect: "none",
                  boxShadow: "0 2px 8px #e5e5e5",
                  borderRadius: "1.1rem"
                }}
                draggable={false}
              />
            </div>
          ))}
        </div>

        <div className="text-base text-gray-500 text-center max-w-xl mt-2">
          * All certificates shown are authentic and represent real registration, ISO, and international audit verification for your full business confidence.
        </div>
      </div>
    </section>
  );
}
