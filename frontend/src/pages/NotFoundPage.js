import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div class="flex min-h-[70vh] w-full items-center justify-center px-4 font-amazon-ember text-gray-900">
      <div class="flex w-full flex-col items-center gap-8">
        <h1 class="md:text-16xl w-full select-none text-center text-9xl font-bold text-theme-orange">
          404
        </h1>

        <p class="text-center text-2xl md:px-12">
          This page could not be found.
        </p>
        <div class="flex flex-row justify-between gap-8">
          <Link
            to="/"
            className="flex h-8 cursor-pointer items-center rounded-lg bg-theme-orange px-4 py-2 font-amazon-ember text-sm text-theme-dark-blue transition-colors duration-300 ease-in-out  hover:bg-theme-dark-orange hover:text-white   md:h-10 md:text-base"
          >
            Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
