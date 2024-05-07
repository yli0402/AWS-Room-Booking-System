import SearchIconSVG from "../assets/search-icon.svg";
import DiscussionIconSVG from "../assets/discussion-icon.svg";
import GlobalIconSVG from "../assets/global-icon.svg";
import LocationIconSVG from "../assets/location-icon.svg";
import WifiIconSVG from "../assets/wifi-icon.svg";
import logo from "../assets/main-home-img.jpg";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="flex flex-row font-amazon-ember md:w-screen">
      <div className="flex flex-col md:w-10/12">
        <h1 className="m-3 text-[40px] md:text-[50px]">
          Book Your Meeting Room Today
        </h1>
        <div className="relative flex flex-col items-center md:hidden">
          <div className="">
            <img src={logo} alt="logo" className="h-[45vh] object-cover" />
          </div>
          <div className="absolute bottom-5 m-5">
            <Link
              to="/booking"
              className="rounded border-2 border-white px-12 py-2 text-white transition-colors duration-300  ease-in-out hover:bg-zinc-800 hover:bg-opacity-60"
            >
              Book Now
            </Link>
          </div>
        </div>

        <div className="mx-10 my-3 flex-col text-center sm:flex md:mx-0 md:my-8 md:mr-36 md:gap-4 md:text-left">
          <div className="flex flex-col items-center lg:flex-row">
            <div className="my-5 min-w-16">
              <img
                src={SearchIconSVG}
                alt="Room Mngt Icon"
                className="h-10 w-16"
              />
            </div>
            <p className="md:ml-8">
              Find the perfect meeting space with advanced search tools,
              allowing customization based on room size, A/V facilities, and
              location.
            </p>
          </div>

          <div className="flex flex-col items-center lg:flex-row">
            <div className="my-5 min-w-16">
              <img
                src={DiscussionIconSVG}
                alt="Room Mngt Icon"
                className="h-10 w-16"
              />
            </div>
            <p className="md:ml-8">
              Effortlessly reserve spaces for hybrid meetings, facilitating
              participants from various locations, while guaranteeing optimal
              room allocation and A/V setup.
            </p>
          </div>

          <div className="flex flex-col items-center lg:flex-row">
            <div className="my-5 min-w-16">
              <img
                src={GlobalIconSVG}
                alt="Room Mngt Icon"
                className="h-10 w-16"
              />
            </div>
            <p className="md:ml-8">
              Book meeting rooms across AWS locations in Canada and the US.
            </p>
          </div>

          <div className="flex flex-col items-center lg:flex-row">
            <div className=" my-5 min-w-16">
              <img
                src={LocationIconSVG}
                alt="Room Mngt Icon"
                className="h-10 w-16"
              />
            </div>
            <p className="md:ml-8">
              We offer a variety of meeting spaces: small rooms, regular meeting rooms,
              & conference rooms.
            </p>
          </div>

          <div className="flex flex-col items-center lg:flex-row">
            <div className="my-5 min-w-16">
              <img
                src={WifiIconSVG}
                alt="Room Mngt Icon"
                className="h-10 w-16"
              />
            </div>
            <p className="md:ml-8">
              Enjoy high speed Wi-Fi, on-site support, and more during your meeting.
            </p>
          </div>
        </div>
        <div className="m-5 hidden md:block">
          <Link
            to="/booking"
            className="rounded bg-theme-orange px-12 py-3 text-black transition-colors duration-300  ease-in-out hover:bg-theme-dark-orange hover:text-white"
          >
            Book Now
          </Link>
        </div>
      </div>
      <div className="hidden md:flex  md:flex-col md:justify-center">
        <img src={logo} alt="logo" className="h-[80vh] object-cover" />
      </div>
    </div>
  );
}

export default LandingPage;
