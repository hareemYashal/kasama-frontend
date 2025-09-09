import React from "react";

const KasamaTips = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-lightbulb w-8 h-8 text-white"
                data-filename="pages/Tips"
                data-linenumber="140"
                data-visual-selector-id="pages/Tips140"
                data-source-location="pages/Tips:140:14"
                data-dynamic-content="false"
              >
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
                <path d="M9 18h6"></path>
                <path d="M10 22h4"></path>
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Tips for Using Kasama
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Kasama was built to make group trips stress-free. Whether you're
            planning a vacation, reunion, or celebration, the idea is simple:{" "}
            <strong>one person organizes, everyone chips in.</strong>
          </p>
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border text-card-foreground bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <div className="flex flex-col space-y-1.5 p-6 pb-4">
              <h3
                className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-3 text-slate-800"
                data-dynamic-content="true"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-user-cog w-5 h-5 text-blue-600"
                    data-filename="pages/Tips"
                    data-linenumber="10"
                    data-visual-selector-id="pages/Tips10"
                    data-source-location="pages/Tips:10:12"
                    data-dynamic-content="false"
                  >
                    <circle cx="18" cy="15" r="3"></circle>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M10 15H6a4 4 0 0 0-4 4v2"></path>
                    <path d="m21.7 16.4-.9-.3"></path>
                    <path d="m15.2 13.9-.9-.3"></path>
                    <path d="m16.6 18.7.3-.9"></path>
                    <path d="m19.1 12.2.3-.9"></path>
                    <path d="m19.6 18.7-.4-1"></path>
                    <path d="m16.8 12.3-.4-1"></path>
                    <path d="m14.3 16.6 1-.4"></path>
                    <path d="m20.7 13.8 1-.4"></path>
                  </svg>
                </div>
                <span
                  data-filename="pages/Tips"
                  data-linenumber="159"
                  data-visual-selector-id="pages/Tips159"
                  data-source-location="pages/Tips:159:18"
                  data-dynamic-content="true"
                  className="text-xl"
                >
                  1. One Trip = One Admin
                </span>
              </h3>
            </div>
            <div className="p-6 pt-0">
              <p className="text-slate-700 mb-2">
                Every trip has a Trip Admin—the person who creates the trip,
                sets up details, and books everything.
              </p>
              <p className="text-slate-700 mb-2">
                The admin manages the budget, collects contributions, and
                finalizes reservations (flights, hotels, activities).
              </p>
              <p className="text-slate-700 mb-2">
                Participants don't need to worry about booking—once they've
                contributed, the admin handles logistics.
              </p>
            </div>
          </div>
          <div className="rounded-lg border text-card-foreground bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <div className="flex flex-col space-y-1.5 p-6 pb-4">
              <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-3 text-slate-800">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-calendar w-5 h-5 text-green-600"
                    data-filename="pages/Tips"
                    data-linenumber="20"
                    data-visual-selector-id="pages/Tips20"
                    data-source-location="pages/Tips:20:12"
                    data-dynamic-content="false"
                  >
                    <path d="M8 2v4"></path>
                    <path d="M16 2v4"></path>
                    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                    <path d="M3 10h18"></path>
                  </svg>
                </div>
                <span className="text-xl">2. Starting a Trip (Admin)</span>
              </h3>
            </div>
            <div className="p-6 pt-0">
              <p className="text-slate-700 mb-2">
                Click Start a Trip and enter trip details like:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-1 ml-4 mb-3">
                <li>Occasion (Family Vacation, Birthday Trip, etc.)</li>
                <li>Destination &amp; dates</li>
                <li>Group budget &amp; expenses</li>
                <li>A welcome message for participants</li>
                <li>
                  Estimated costs (hotel, flights, tours) so everyone knows what
                  they're saving toward
                </li>
              </ul>
            </div>
          </div>
          <div className="rounded-lg border text-card-foreground bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <div className="flex flex-col space-y-1.5 p-6 pb-4">
              <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-3 text-slate-800">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-users w-5 h-5 text-purple-600"
                    data-filename="pages/Tips"
                    data-linenumber="37"
                    data-visual-selector-id="pages/Tips37"
                    data-source-location="pages/Tips:37:12"
                    data-dynamic-content="false"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <span className="text-xl">3. Joining a Trip (Participant)</span>
              </h3>
            </div>
            <div className="p-6 pt-0">
              <p className="text-slate-700 mb-2">
                Receive an invite link from the admin.
              </p>
              <p className="text-slate-700 mb-2">
                Sign up or log in, then join the trip.
              </p>
              <p className="text-slate-700 mb-2">As a participant, you can:</p>
              <ul className="list-disc list-inside text-slate-700 space-y-1 ml-4 mb-3">
                <li>Contribute funds toward the shared wallet</li>
                <li>View the itinerary, budget, and progress bar</li>
                <li>Chat with the group and stay updated</li>
              </ul>
              <p className="text-slate-700 mb-2">
                You cannot edit trip details or withdraw funds—only the admin
                has those permissions.
              </p>
            </div>
          </div>
          <div className="rounded-lg border text-card-foreground bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <div className="flex flex-col space-y-1.5 p-6 pb-4">
              <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-3 text-slate-800">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-credit-card w-5 h-5 text-emerald-600"
                    data-filename="pages/Tips"
                    data-linenumber="55"
                    data-visual-selector-id="pages/Tips55"
                    data-source-location="pages/Tips:55:12"
                    data-dynamic-content="false"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                    <line x1="2" x2="22" y1="10" y2="10"></line>
                  </svg>
                </div>
                <span className="text-xl">4. Contributions &amp; Payments</span>
              </h3>
            </div>
            <div className="p-6 pt-0">
              <p className="text-slate-700 mb-2">
                Participants choose one-time or recurring deposits.
              </p>
              <p className="text-slate-700 mb-2">
                Contributions go into the secure trip wallet (separate for each
                trip).
              </p>
              <p className="text-slate-700 mb-2">
                Only the admin can withdraw money, and only for that specific
                trip.
              </p>
              <p className="text-slate-700 mb-2">
                Accepted payment methods: debit, credit, and ACH transfers.
              </p>
            </div>
          </div>
          <div className="rounded-lg border text-card-foreground bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <div className="flex flex-col space-y-1.5 p-6 pb-4">
              <h3
                className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-3 text-slate-800"
                data-filename="pages/Tips"
                data-linenumber="155"
                data-visual-selector-id="pages/Tips155"
                data-source-location="pages/Tips:155:16"
                data-dynamic-content="true"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-circle-check-big w-5 h-5 text-cyan-600"
                    data-filename="pages/Tips"
                    data-linenumber="66"
                    data-visual-selector-id="pages/Tips66"
                    data-source-location="pages/Tips:66:12"
                    data-dynamic-content="false"
                  >
                    <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                    <path d="m9 11 3 3L22 4"></path>
                  </svg>
                </div>
                <span className="text-xl">5. Tracking Progress</span>
              </h3>
            </div>
            <div className="p-6 pt-0">
              <p className="text-slate-700 mb-2">
                Both admin and participants can see:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-1 ml-4 mb-3">
                <li>
                  Group Progress – how close everyone is to the total budget
                </li>
                <li>Your Contributions – what you've personally chipped in</li>
                <li>
                  Expense Breakdown – where the money is going (lodging,
                  flights, activities)
                </li>
              </ul>
              <p className="text-slate-700 mb-2">
                Ensures transparency and fairness.
              </p>
            </div>
          </div>
          <div className="rounded-lg border text-card-foreground bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <div className="flex flex-col space-y-1.5 p-6 pb-4">
              <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-3 text-slate-800">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-arrow-right w-5 h-5 text-amber-600"
                    data-filename="pages/Tips"
                    data-linenumber="82"
                    data-visual-selector-id="pages/Tips82"
                    data-source-location="pages/Tips:82:12"
                    data-dynamic-content="false"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </div>
                <span className="text-xl">
                  6. Booking &amp; Withdrawals (Admin Only)
                </span>
              </h3>
            </div>
            <div className="p-6 pt-0">
              <p className="text-slate-700 mb-2">
                The admin withdraws funds when it's time to book.
              </p>
              <p className="text-slate-700 mb-2">
                They use these funds to reserve flights, hotels, or activities.
              </p>
              <p className="text-slate-700 mb-2">
                Participants don't pay providers directly—everything is managed
                through Kasama.
              </p>
            </div>
          </div>
          <div className="rounded-lg border text-card-foreground bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <div className="flex flex-col space-y-1.5 p-6 pb-4">
              <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-3 text-slate-800">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-message-circle w-5 h-5 text-red-600"
                    data-filename="pages/Tips"
                    data-linenumber="92"
                    data-visual-selector-id="pages/Tips92"
                    data-source-location="pages/Tips:92:12"
                    data-dynamic-content="false"
                  >
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                  </svg>
                </div>
                <span className="text-xl">7. If Plans Change</span>
              </h3>
            </div>
            <div className="p-6 pt-0">
              <p className="text-slate-700 mb-2">
                The admin can cancel a trip if necessary.
              </p>
              <p className="text-slate-700 mb-2">
                A cancellation fee applies, and the admin handles fund
                withdrawals and redistributions.
              </p>
              <p className="text-slate-700 mb-2">
                Participants will be notified via the dashboard and chat.
              </p>
            </div>
          </div>
          <div className="rounded-lg border text-card-foreground bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <div className="flex flex-col space-y-1.5 p-6 pb-4">
              <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-3 text-slate-800">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-message-circle w-5 h-5 text-indigo-600"
                    data-filename="pages/Tips"
                    data-linenumber="102"
                    data-visual-selector-id="pages/Tips102"
                    data-source-location="pages/Tips:102:12"
                    data-dynamic-content="false"
                  >
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                  </svg>
                </div>
                <span className="text-xl">8. Communication</span>
              </h3>
            </div>
            <div className="p-6 pt-0">
              <p className="text-slate-700 mb-2">
                Admins send booking confirmations, payment deadlines, and trip
                updates.
              </p>
              <p className="text-slate-700 mb-2">
                Participants can chat, ask questions, and share suggestions.
              </p>
              <p className="text-slate-700 mb-2">
                Notifications ensure no one misses updates.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border text-card-foreground bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3
              className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-3 text-slate-800"
              data-dynamic-content="false"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-circle-check-big w-5 h-5 text-green-600"
                  data-filename="pages/Tips"
                  data-linenumber="176"
                  data-visual-selector-id="pages/Tips176"
                  data-source-location="pages/Tips:176:16"
                  data-dynamic-content="false"
                >
                  <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                  <path d="m9 11 3 3L22 4"></path>
                </svg>
              </div>
              <span className="text-xl">9. Best Practices</span>
            </h3>
          </div>
          <div className="p-6 pt-0 space-y-6">
            <div>
              <h4 className="font-semibold text-slate-800 mb-3 text-lg">
                For Admins:
              </h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1 ml-4">
                <li>Set clear deadlines for contributions</li>
                <li
                  data-filename="pages/Tips"
                  data-linenumber="186"
                  data-visual-selector-id="pages/Tips186"
                  data-source-location="pages/Tips:186:16"
                  data-dynamic-content="false"
                >
                  Add a small buffer to expenses
                </li>
                <li>Keep participants updated regularly</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-3 text-lg">
                For Participants:
              </h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1 ml-4">
                <li>Contribute early to avoid booking delays</li>
                <li>Check the dashboard to track progress</li>
                <li>
                  Respect deadlines and trust the admin to handle logistics
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div
          className="rounded-lg border bg-card bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl"
          data-filename="pages/Tips"
          data-linenumber="203"
          data-visual-selector-id="pages/Tips203"
          data-source-location="pages/Tips:203:8"
          data-dynamic-content="false"
        >
          <div
            className="p-8 text-center"
            data-filename="pages/Tips"
            data-linenumber="204"
            data-visual-selector-id="pages/Tips204"
            data-source-location="pages/Tips:204:10"
            data-dynamic-content="false"
          >
            <div
              data-filename="pages/Tips"
              data-linenumber="205"
              data-visual-selector-id="pages/Tips205"
              data-source-location="pages/Tips:205:12"
              data-dynamic-content="false"
              className="flex justify-center mb-4"
            >
              <div
                data-filename="pages/Tips"
                data-linenumber="206"
                data-visual-selector-id="pages/Tips206"
                data-source-location="pages/Tips:206:14"
                data-dynamic-content="false"
                className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-arrow-right w-6 h-6 text-white"
                  data-filename="pages/Tips"
                  data-linenumber="207"
                  data-visual-selector-id="pages/Tips207"
                  data-source-location="pages/Tips:207:16"
                  data-dynamic-content="false"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">In Short:</h3>
            <div className="space-y-2 text-lg">
              <p>
                <strong>Admins</strong> organize, collect, and book.
              </p>
              <p>
                <strong>Participants</strong> chip in, stay informed, and show
                up.
              </p>
              <p className="text-xl font-semibold mt-4">
                Together, Kasama makes group travel effortless.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KasamaTips;
