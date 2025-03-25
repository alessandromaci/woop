import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Logo from "../../public/woop_logo_beta.svg";
import { useRouter } from "next/router";
import { telegramLink } from "../../utils/constants";

const Header = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="absolute top-0 left-0 w-full flex justify-between p-7 z-30 items-center bg-transparent">
        {/* Logo and Navigation */}
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex items-center">
            <Image alt="woop" src={Logo} width={140} height={120} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4B6BFB] hover:text-[#3b56e6] font-medium"
            >
              Contact us
            </a>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-[#4B6BFB] text-white px-6 py-2 rounded-full font-medium hover:bg-[#3b56e6] transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/widget")}
              className="bg-[#4B6BFB] text-white px-6 py-2 rounded-full font-medium hover:bg-[#3b56e6] transition-colors"
            >
              Integrate Woop
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="h-10 w-10 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </button>

            {/* Mobile Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 top-16 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/dashboard");
                    }}
                    className="block w-full text-left px-4 py-2 text-[#4B6BFB] hover:bg-gray-100"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/widget");
                    }}
                    className="block w-full text-left px-4 py-2 text-[#4B6BFB] hover:bg-gray-100"
                  >
                    Integrate Woop
                  </button>
                  <a
                    href={telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Contact us
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="absolute top-[88px] left-0 w-full h-px bg-gray-200" />
    </>
  );
};

export default Header;
