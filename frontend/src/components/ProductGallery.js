// src/components/ProductGallery.js
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function ProductGallery({ gallery, title }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-2 mb-4">
      <Swiper
        spaceBetween={10}
        slidesPerView={1}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        className="w-full max-w-full"
      >
        {(Array.isArray(gallery) ? gallery : []).map((img, i) => (
          <SwiperSlide key={i}>
            <div
              className="w-full flex justify-center items-center bg-white"
              style={{
                minHeight: "240px",
                height: "45vw",
                maxHeight: 400
              }}
            >
              <img
                src={img}
                alt={title}
                className="w-full h-auto object-contain"
                style={{ maxHeight: "100%", width: "100%" }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
