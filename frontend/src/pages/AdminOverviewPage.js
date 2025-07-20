import { FaUsers, FaShieldAlt, FaMoneyCheckAlt, FaExchangeAlt, FaClipboardList } from "react-icons/fa";

const overviewLinks = [
  {
    to: "/admin/users",
    label: "Users",
    icon: <FaUsers className="text-[#17604e] text-3xl mb-2 drop-shadow-lg" />,
    color: "from-green-200 to-green-50",
  },
  {
    to: "/admin/kyc",
    label: "KYC Approvals",
    icon: <FaShieldAlt className="text-[#ffd700] text-3xl mb-2 drop-shadow-lg" />,
    color: "from-yellow-100 to-white",
  },
  {
    to: "/admin/deposit",
    label: "Deposits",
    icon: <FaMoneyCheckAlt className="text-[#27ae60] text-3xl mb-2 drop-shadow-lg" />,
    color: "from-emerald-100 to-white",
  },
  {
    to: "/admin/withdraw",
    label: "Withdraws",
    icon: <FaExchangeAlt className="text-[#17604e] text-3xl mb-2 drop-shadow-lg" />,
    color: "from-green-100 to-white",
  },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: <FaClipboardList className="text-[#9b59b6] text-3xl mb-2 drop-shadow-lg" />,
    color: "from-purple-100 to-white",
  },
];

export default function AdminOverviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2E5C0] to-[#e6f3ee] font-inter">
      <div className="max-w-3xl mx-auto py-20 flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#17604e] mb-8 tracking-tight">
          Admin Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {overviewLinks.map((item) => (
            <a
              key={item.to}
              href={item.to}
              className={`rounded-2xl shadow-xl p-7 bg-gradient-to-br ${item.color} 
                flex flex-col items-center transition transform hover:-translate-y-1 hover:scale-105 hover:shadow-2xl focus:ring-2 ring-[#ffd700] ring-opacity-40 outline-none duration-150 cursor-pointer
                border border-white/50 hover:border-[#ffd700]/40
              `}
              tabIndex={0}
            >
              {item.icon}
              <span className="font-bold text-lg text-green-900 mt-1 mb-0.5 tracking-wide">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
