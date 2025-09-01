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
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import LoginPage from "./Login.jsx";
import RegisterPage from "./Register.jsx";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import EmailVerifiedPage from "./EmailSuccess.jsx";
import ParticipantsManagment from "./ParticipantsManagment.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import VerifyOtp from "./VerifyOtp.jsx";
import ChangePassword from "./ChangePassword.jsx";

const PAGES = {
  Home: Home,
  TripCreation: TripCreation,
  Dashboard: Dashboard,
  JoinTrip: JoinTrip,
  Itinerary: Itinerary,
  Expenses: Expenses,
  Participants: Participants,
  Profile: Profile,
  Chat: Chat,
  ManageTrip: ManageTrip,
  MyTrips: MyTrips,
  Payments: Payments,
  ParticipantDashboard: ParticipantDashboard,
  Help: Help,
  Feedback: Feedback,
  CancelTrip: CancelTrip,
  Policies: Policies,
  PoliciesAgreement: PoliciesAgreement,
  ExpediaTeaser: ExpediaTeaser,
  ParticipantsManagment: ParticipantsManagment,
};

function _getCurrentPage(url) {
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  let urlLastPart = url.split("/").pop();
  if (urlLastPart.includes("?")) {
    urlLastPart = urlLastPart.split("?")[0];
  }

  const pageName = Object.keys(PAGES).find(
    (page) => page.toLowerCase() === urlLastPart.toLowerCase()
  );
  return pageName || Object.keys(PAGES)[0];
}

function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  console.log("User from Route", user);
  let userRole = user?.role;
  console.log('userRole',userRole)
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  }, [user]);

  return (
    <Layout currentPageName={currentPage}>
      <Routes>
        {user ? (
          <>
            {" "}
            <Route path="/TripCreation" element={<TripCreation />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/JoinTrip" element={<JoinTrip />} />
            <Route path="/Itinerary" element={<Itinerary />} />
            <Route
              path="/ParticipantsManagment"
              element={<ParticipantsManagment />}
            />
            <Route path="/Expenses" element={<Expenses />} />
            <Route path="/Participants" element={<Participants />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/Chat" element={<Chat />} />
            <Route path="/ManageTrip" element={<ManageTrip />} />
            <Route path="/MyTrips" element={<MyTrips />} />
            <Route path="/Payments" element={<Payments />} />
            <Route
              path="/ParticipantDashboard"
              element={<ParticipantDashboard />}
            />
            <Route path="/Help" element={<Help />} />
            <Route path="/Feedback" element={<Feedback />} />
            <Route path="/CancelTrip" element={<CancelTrip />} />
            <Route path="/Policies" element={<Policies />} />
            <Route path="/PoliciesAgreement" element={<PoliciesAgreement />} />
            <Route path="/ExpediaTeaser" element={<ExpediaTeaser />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} />{" "}
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/emailSuccess" element={<EmailVerifiedPage />} />
            <Route path="/changePassword" element={<ChangePassword />} />
          </>
        )}
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
