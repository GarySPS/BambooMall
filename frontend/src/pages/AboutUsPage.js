import React, { useState } from "react";

export default function AboutUsPage() {
  const [tab, setTab] = useState("about");

  return (
    <div className="max-w-2xl mx-auto py-20 px-4">
      <div className="flex gap-6 mb-8 justify-center">
        <button
          className={`py-2 px-6 rounded-t font-bold ${tab === "about" ? "bg-green-700 text-white" : "bg-green-100 text-green-700"}`}
          onClick={() => setTab("about")}
        >
          About
        </button>
        <button
          className={`py-2 px-6 rounded-t font-bold ${tab === "contact" ? "bg-green-700 text-white" : "bg-green-100 text-green-700"}`}
          onClick={() => setTab("contact")}
        >
          Contact
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        {tab === "about" && (
          <>
            <h1 className="text-3xl font-bold text-green-700 mb-4">About BambooMall</h1>
            <p>
              BambooMall is Asia’s most trusted hub for premium bulk deals—helping micro-businesses and resellers source top items direct from leading Asian factories. All products are demo/sample only for this project.<br /><br />
              In the final version, more supplier info and real factory connections will appear here!
            </p>
          </>
        )}
        {tab === "contact" && (
  <>
    <h1 className="text-3xl font-bold text-green-700 mb-4">Contact Us</h1>
    <p className="mb-2">
      Have a question about bulk shopping or BambooMall? Our team replies 8am–10pm (GMT+6:30).
    </p>
    <div className="flex flex-col items-center gap-4 mb-4">
      <a
        href="https://wa.me/959123456789" // replace with your WhatsApp
        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl shadow transition text-lg font-bold"
        target="_blank" rel="noopener noreferrer"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2.003C6.494 2.003 2 6.49 2 12.04c0 1.918.498 3.707 1.44 5.3L2 22l4.758-1.407c1.524.83 3.212 1.269 4.987 1.269h.012c5.547 0 10.04-4.488 10.04-10.038 0-2.678-1.045-5.195-2.945-7.087A9.944 9.944 0 0 0 12.04 2.003zm0 1.6a8.362 8.362 0 0 1 5.927 2.454A8.372 8.372 0 0 1 20 12.04c0 4.627-3.76 8.39-8.388 8.39-1.635 0-3.225-.471-4.584-1.362l-.33-.208-2.829.838.85-2.749-.215-.337a8.357 8.357 0 0 1-1.352-4.59c0-4.628 3.762-8.39 8.388-8.39zm-3.65 4.423c-.27.002-.528.091-.736.252-.327.252-1.02 1.01-1.02 2.423 0 1.413 1.046 2.776 1.193 2.968.146.192 2.043 3.232 5.168 4.401.723.277 1.287.442 1.729.566.442.123.843.106 1.16.065.317-.041 1.014-.415 1.157-.816.144-.402.144-.746.1-.815-.043-.07-.159-.115-.334-.202-.176-.087-1.044-.515-1.205-.574-.16-.059-.277-.087-.394.087-.115.174-.453.573-.555.691-.101.116-.202.13-.377.043-.174-.087-.736-.27-1.402-.857-.518-.462-.868-1.027-.97-1.201-.101-.174-.011-.267.076-.354.078-.077.174-.202.261-.303.087-.101.115-.174.173-.289.058-.116.029-.217-.014-.303-.043-.087-.38-.918-.522-1.256-.14-.337-.28-.291-.38-.297zm7.098 5.978c-.13-.002-.262.02-.392.065-.212.073-1.24.614-1.43.683-.19.07-.347.101-.492.045-.145-.056-.671-.263-1.279-.55a8.156 8.156 0 0 1-2.293-1.728 8.188 8.188 0 0 1-1.728-2.294c-.287-.607-.494-1.134-.549-1.278-.055-.145-.024-.303.045-.492.069-.19.611-1.218.683-1.43.073-.212.152-.335.261-.379.109-.044.24-.019.392.065.153.083.479.227.758.38.28.153.479.268.671.344.193.076.302.187.376.29.073.102.087.186.014.303-.073.116-.124.192-.174.29-.05.098-.139.207-.26.303-.118.098-.203.174-.24.271-.037.098.018.21.088.318.07.107.337.454.968.931.63.478 1.018.715 1.127.79.11.074.192.123.314.043.121-.079.453-.52.55-.687.097-.168.192-.164.319-.117.127.048 1.031.485 1.205.573.175.088.291.133.334.202.044.07.044.413-.099.815-.144.403-.84.776-1.158.818a1.582 1.582 0 0 1-.161.011z"/></svg>
        WhatsApp
      </a>
      <a
        href="https://t.me/bamboomall_support" // replace with your Telegram
        className="flex items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white px-5 py-3 rounded-xl shadow transition text-lg font-bold"
        target="_blank" rel="noopener noreferrer"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9.98 13.683l-.399 3.535c.57 0 .816-.242 1.117-.533l2.677-2.548 5.553 4.049c1.015.559 1.736.264 1.986-.93L23.85 6.694c.342-1.468-.525-2.043-1.488-1.711L2.426 10.75c-1.433.484-1.418 1.167-.244 1.478l4.363 1.363 10.139-6.386c.477-.316.911-.14.553.176l-8.203 7.176z"/></svg>
        Telegram
      </a>
    </div>
    <div className="mb-2">
      Email: <a href="mailto:support@bamboomall.com" className="text-green-700 underline">support@bamboomall.com</a><br />
      Phone: +1 234 567 8901
    </div>
    <div className="mt-4 text-xs text-gray-400">
      All chats are confidential. We’ll reply as soon as possible!
    </div>
  </>
)}
      </div>
    </div>
  );
}
