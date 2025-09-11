import Layout from "./Layout.jsx";
import Home from "./Home.jsx";
import TripCreation from "./TripCreation.jsx";
import Dashboard from "./Dashboard.jsx";
import JoinTrip from "./JoinTrip.jsx";
import Itinerary from "./Itinerary.jsx";
import Expenses from "./Expenses.jsx";
import Participants from "./Participants.jsx";
import Profile from "./Profile.jsx";
import Chat from "./Chat.jsx";
import ManageTrip from "./ManageTrip.jsx";
import MyTrips from "./MyTrips.jsx";
import Payments from "./Payments.jsx";
import ParticipantDashboard from "./ParticipantDashboard.jsx";
import Help from "./Help.jsx";
import Feedback from "./Feedback.jsx";
import CancelTrip from "./CancelTrip.jsx";
import Policies from "./Policies.jsx";
import PoliciesAgreement from "./PoliciesAgreement.jsx";
import ExpediaTeaser from "./ExpediaTeaser.jsx";
import ParticipantsManagment from "./ParticipantsManagment.jsx";
import LoginPage from "./Login.jsx";
import RegisterPage from "./Register.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import VerifyOtp from "./VerifyOtp.jsx";
import ChangePassword from "./ChangePassword.jsx";
import TripSelection from "./TripList.jsx";
import EmailVerifiedPage from "./EmailSuccess.jsx";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useSelector } from "react-redux";
import KasamaTips from "./KasamaTips.jsx";
import TripInvitePage from "./TripInvitePage.jsx";

// Pages mapping (for Layout)
const PAGES = {
  // TripCreation: TripCreation,
  Home,
  Dashboard,
  JoinTrip,
  Itinerary,
  Expenses,
  Participants,
  Profile,
  Chat,
  ManageTrip,
  MyTrips,
  Payments,
  ParticipantDashboard,
  Tips: KasamaTips,
  Help,
  Feedback,
  CancelTrip,
  Policies,
  PoliciesAgreement,
  ExpediaTeaser,
  ParticipantsManagment,
  TripCreation,
};

// Get current page for Layout
function _getCurrentPage(url) {
  if (url.endsWith("/")) url = url.slice(0, -1);
  let urlLastPart = url.split("/").pop();
  if (urlLastPart.includes("?")) urlLastPart = urlLastPart.split("?")[0];
  const pageName = Object.keys(PAGES).find(
    (page) => page.toLowerCase() === urlLastPart.toLowerCase()
  );
  return pageName || Object.keys(PAGES)[0];
}

// PrivateRoute wrapper
function PrivateRoute({ children }) {
  const user = useSelector((state) => state.user.user);
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// Main content
function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/changePassword" element={<ChangePassword />} />
        <Route path="/emailSuccess" element={<EmailVerifiedPage />} />
        <Route path="/JoinTrip" element={<JoinTrip />} />
        {/* Protected routes */}
        <Route
          path="/tripSelection"
          element={
            <PrivateRoute>
              <TripSelection />
            </PrivateRoute>
          }
        />
        <Route
          path="/TripCreation"
          element={
            <PrivateRoute>
              <TripCreation />
            </PrivateRoute>
          }
        />
        <Route
          path="/Dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/Itinerary"
          element={
            <PrivateRoute>
              <Itinerary />
            </PrivateRoute>
          }
        />
        <Route
          path="/ParticipantsManagment"
          element={
            <PrivateRoute>
              <ParticipantsManagment />
            </PrivateRoute>
          }
        />
        <Route
          path="/Expenses"
          element={
            <PrivateRoute>
              <Expenses />
            </PrivateRoute>
          }
        />
        <Route
          path="/Participants"
          element={
            <PrivateRoute>
              <Participants />
            </PrivateRoute>
          }
        />
        <Route
          path="/Profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/Chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/ManageTrip"
          element={
            <PrivateRoute>
              <ManageTrip />
            </PrivateRoute>
          }
        />
        <Route
          path="/MyTrips"
          element={
            <PrivateRoute>
              <MyTrips />
            </PrivateRoute>
          }
        />
        <Route
          path="/Payments"
          element={
            <PrivateRoute>
              <Payments />
            </PrivateRoute>
          }
        />
        <Route
          path="/ParticipantDashboard"
          element={
            <PrivateRoute>
              <ParticipantDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/Help"
          element={
            <PrivateRoute>
              <Help />
            </PrivateRoute>
          }
        />
        <Route
          path="/Tips"
          element={
            <PrivateRoute>
              <KasamaTips />
            </PrivateRoute>
          }
        />
        <Route
          path="/Feedback"
          element={
            <PrivateRoute>
              <Feedback />
            </PrivateRoute>
          }
        />
        <Route
          path="/CancelTrip"
          element={
            <PrivateRoute>
              <CancelTrip />
            </PrivateRoute>
          }
        />
        <Route
          path="/Policies"
          element={
            <PrivateRoute>
              <Policies />
            </PrivateRoute>
          }
        />
        <Route
          path="/PoliciesAgreement"
          element={
            <PrivateRoute>
              <PoliciesAgreement />
            </PrivateRoute>
          }
        />
        <Route
          path="/ExpediaTeaser"
          element={
            <PrivateRoute>
              <ExpediaTeaser />
            </PrivateRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

export default function Pages() {
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}
