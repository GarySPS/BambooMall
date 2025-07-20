export default function AdminOverviewPage() {
  return (
    <div className="min-h-screen bg-[#F2E5C0]">
      <div className="max-w-2xl mx-auto py-20 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-green-900 mb-6">Admin Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <a href="/admin/users" className="rounded-xl shadow-lg p-6 bg-white hover:bg-green-50 flex flex-col items-center">
            <span className="text-4xl mb-2">👤</span>
            <span className="font-semibold text-lg text-green-900">Users</span>
          </a>
          <a href="/admin/kyc" className="rounded-xl shadow-lg p-6 bg-white hover:bg-green-50 flex flex-col items-center">
            <span className="text-4xl mb-2">🛡️</span>
            <span className="font-semibold text-lg text-green-900">KYC Approvals</span>
          </a>
          <a href="/admin/deposits" className="rounded-xl shadow-lg p-6 bg-white hover:bg-green-50 flex flex-col items-center">
            <span className="text-4xl mb-2">💰</span>
            <span className="font-semibold text-lg text-green-900">Deposits</span>
          </a>
          <a href="/admin/withdraws" className="rounded-xl shadow-lg p-6 bg-white hover:bg-green-50 flex flex-col items-center">
            <span className="text-4xl mb-2">💸</span>
            <span className="font-semibold text-lg text-green-900">Withdraws</span>
          </a>
          <a href="/admin/orders" className="rounded-xl shadow-lg p-6 bg-white hover:bg-green-50 flex flex-col items-center">
            <span className="text-4xl mb-2">📝</span>
            <span className="font-semibold text-lg text-green-900">Orders</span>
          </a>
        </div>
      </div>
    </div>
  );
}
