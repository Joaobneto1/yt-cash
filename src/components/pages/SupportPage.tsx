export default function SupportPage() {
  return (
    <div>
      <h1 className="text-3xl font-black text-red-600 mb-6">Support</h1>
      <div className="bg-white border-4 border-red-600 rounded-2xl p-8 shadow-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Topic</label>
            <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl">
              <option>Withdrawal</option>
              <option>Refund</option>
              <option>Evaluation</option>
              <option>AI</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
            <textarea className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl" rows={5} placeholder="Describe your issue..."></textarea>
          </div>
          <button className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700">
            Submit Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
