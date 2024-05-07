import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import TokenExpirationListener from "./components/TokenExpirationListener";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Header />
      <main className="pt-28">
        <div className="container mx-auto">
          <Outlet />
        </div>
      </main>
      <TokenExpirationListener />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
