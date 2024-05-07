import { Fragment, useState, useEffect } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { FaCheck } from "react-icons/fa6";
import { LuChevronsUpDown } from "react-icons/lu";

const ComboBox = ({
  options,
  defaultSelect = {},
  handleEmailSelected,
  selectedUser,
  comboBoxId,
}) => {
  const [selected, setSelected] = useState(selectedUser);
  const [query, setQuery] = useState("");
  const filteredUsers =
    query === ""
      ? options
      : options.filter((user) =>
          user.label
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, "")),
        );

  const handleEmailChange = (user) => {
    setSelected(user);
    const [groupId, attendeeIndex] = comboBoxId
      .split("_")
      .map((value, index) => (index === 0 ? value : parseInt(value, 10)));

    handleEmailSelected(groupId, attendeeIndex, user);
  };
  useEffect(() => {
    console.log("selectedUser:", selectedUser);
    setSelected(selectedUser);
  }, [selectedUser]);

  return (
    <Combobox value={selected} onChange={handleEmailChange}>
      <div className="m-2 flex  w-full flex-col rounded-lg bg-gray-200">
        <div className="relative w-full rounded-lg ">
          <Combobox.Input
            className="w-full border-none py-2 pl-3 pr-10 text-sm  text-theme-dark-blue focus:outline-none"
            displayValue={(user) => user.label}
            onChange={(event) => setQuery(event.target.value)}
            required
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <LuChevronsUpDown
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <Combobox.Options
            onFocus={(e) => e.preventDefault()}
            className="absolute z-10 mt-10 max-h-60 w-64 overflow-auto rounded-md bg-white py-1"
          >
            {filteredUsers.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                Nothing found.
              </div>
            ) : (
              filteredUsers.map((user) => (
                <Combobox.Option
                  key={user.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active
                        ? "bg-theme-dark-orange text-white"
                        : "text-theme-dark-blue"
                    }`
                  }
                  value={user}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {user.label}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? "text-white" : "text-teal-600"
                          }`}
                        >
                          <FaCheck className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
};

export default ComboBox;
