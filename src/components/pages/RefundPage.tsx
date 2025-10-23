export default function RefundPage() {
  return (
    <div>
      <h1 className="text-3xl font-black text-red-600 mb-6">Request Refund</h1>
      <div className="bg-white border-4 border-red-600 rounded-2xl p-8 shadow-xl">
        <p className="text-sm text-gray-600 mb-6">Refunds are available for eligible items within the policy window.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Item</label>
            <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl">
              <option>AI Upgrade</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Reason</label>
            <textarea className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl" rows={4} placeholder="Explain your reason..."></textarea>
          </div>
          <button className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700">
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}
