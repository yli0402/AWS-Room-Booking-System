import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import AdminHomePage from "./pages/admin/AdminHomePage/AdminHomePage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import BookingPage from "./pages/BookingPage";
import BookingReviewPage from "./pages/BookingReviewPage";
import BookingCompletePage from "./pages/BookingCompletePage";
import reportWebVitals from "./reportWebVitals";
import MyFavouritePage from "./pages/MyFavouritePage";
import UserManagementAddPage from "./pages/admin/UserManagement/UserManagementAddPage";
import UserManagementEditPage from "./pages/admin/UserManagement/UserManagementEditPage";
import UserManagementPage from "./pages/admin/UserManagement/UserManagementPage";
import RoomManagementAddPage from "./pages/admin/RoomManagement/RoomManagementAddPage";
import RoomManagementEditPage from "./pages/admin/RoomManagement/RoomManagementEditPage";
import RoomManagementPage from "./pages/admin/RoomManagement/RoomManagementPage";
import BuildingManagementPage from "./pages/admin/RoomManagement/BuildingManagementPage";
import BuildingManagementAddPage from "./pages/admin/RoomManagement/BuildingManagementAddPage";
import BuildingManagementEditPage from "./pages/admin/RoomManagement/BuildingManagementEditPage";
import { persistor, store } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { StyledEngineProvider } from "@mui/material/styles";
import BookingHistoryPage from "./pages/BookingHistoryPage";
import UserSchedulePage from "./pages/UserSchedulePage";
import NotFoundPage from "./pages/NotFoundPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* All public routes */}
      <Route index element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* private routes */}
      <Route path="" element={<PrivateRoute />}>
        <Route path="/bookingHistory" element={<BookingHistoryPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/userSchedule" element={<UserSchedulePage />} />
        <Route path="/bookingReview" element={<BookingReviewPage />} />
        <Route path="/bookingComplete" element={<BookingCompletePage />} />
      </Route>

      {/* Admin routes */}
      <Route path="" element={<AdminRoute />}>
        <Route path="/adminHomePage" element={<AdminHomePage />} />
        <Route path="/userManagementPage" element={<UserManagementPage />} />
        <Route
          path="/userManagementAddPage"
          element={<UserManagementAddPage />}
        />
        <Route
          path="/userManagementEditPage/:id"
          element={<UserManagementEditPage />}
        />
        <Route path="/roomManagementPage" element={<RoomManagementPage />} />
        <Route
          path="/roomManagementAddPage"
          element={<RoomManagementAddPage />}
        />
        <Route
          path="/roomManagementEditPage/:id"
          element={<RoomManagementEditPage />}
        />

        <Route
          path="/buildingManagementPage"
          element={<BuildingManagementPage />}
        />

        <Route
          path="/buildingManagementAddPage"
          element={<BuildingManagementAddPage />}
        />
        <Route
          path="/buildingManagementEditPage/:id"
          element={<BuildingManagementEditPage />}
        />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ),
);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StyledEngineProvider injectFirst>
          <GoogleOAuthProvider
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
          >
            <RouterProvider router={router} />
          </GoogleOAuthProvider>
        </StyledEngineProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
