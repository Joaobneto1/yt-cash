export default function WithdrawPage() {
  return (
    <div>
      <h1 className="text-3xl font-black text-red-600 mb-6">Request Withdrawal</h1>
      <div className="bg-white border-4 border-red-600 rounded-2xl p-8 shadow-xl">
        <p className="text-sm text-gray-600 mb-6">Minimum points, timelines and KYC apply per policy.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Points to Withdraw</label>
            <input type="number" className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl" placeholder="Minimum 5000 points" />
          </div>
          <button className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700">
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}
