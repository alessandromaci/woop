import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../public/woop_logo_beta.svg";
import { useRouter } from "next/router";
import { telegramLink } from "../../utils/constants";

interface HeaderProps {
  isDashboard?: boolean;
  isWidget?: boolean;
}

const Header = ({ isDashboard, isWidget }: HeaderProps) => {
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
      <div className="w-full flex justify-between px-5 py-4 z-30 items-center bg-transparent border-b border-gray-200">
        {/* Logo */}
        <div className="flex items-center">
          {isWidget ? (
            <div className="flex items-center">
              <Link href="/">
                <Image alt="woop" src={Logo} width={140} height={120} />
              </Link>
              <span className="bg-[#4B6BFB] text-white text-sm px-3 py-1 ml-2 rounded-full font-sans font-medium">
                widget
              </span>
            </div>
          ) : (
            !isWidget && (
              <div className="flex items-center">
                <Link href="/">
                  <Image alt="woop" src={Logo} width={140} height={120} />
                </Link>
              </div>
            )
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-[#4B6BFB] font-medium"
            >
              Contact us
            </a>
            {isDashboard ? (
              <>
                <button
                  onClick={() => router.push("/")}
                  className="bg-[#4B6BFB] text-white px-6 py-2 rounded-full font-medium hover:bg-[#3b56e6] transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => router.push("/widget")}
                  className="bg-[#4B6BFB] text-white px-6 py-2 rounded-full font-medium hover:bg-[#3b56e6] transition-colors"
                >
                  Integrate Woop
                </button>
              </>
            ) : isWidget ? (
              <>
                <button
                  onClick={() => router.push("/")}
                  className="bg-[#4B6BFB] text-white px-6 py-2 rounded-full font-medium hover:bg-[#3b56e6] transition-colors"
                >
                  Home
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center focus:outline-none"
            >
              {menuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="h-6 w-6 text-gray-900"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="h-6 w-6 text-gray-900"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 8h16M4 16h16"
                  />
                </svg>
              )}
            </button>

            {/* Mobile Dropdown Menu */}
            {menuOpen && (
              <div className="absolute left-0 top-[79px] w-full bg-[#F8F9FF] border-t border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.1)] z-50">
                <div className="max-w-7xl mx-auto px-7 py-8">
                  <nav className="flex flex-col gap-6">
                    {isDashboard ? (
                      <>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            router.push("/");
                          }}
                          className="text-lg font-medium text-white bg-[#4B6BFB] hover:bg-[#3b56e6] px-6 py-2 rounded-full transition-colors w-fit"
                        >
                          Home
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            router.push("/widget");
                          }}
                          className="text-lg font-medium text-white bg-[#4B6BFB] hover:bg-[#3b56e6] px-6 py-2 rounded-full transition-colors w-fit"
                        >
                          Integrate Woop
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            router.push("/dashboard");
                          }}
                          className="text-lg font-medium text-white bg-[#4B6BFB] hover:bg-[#3b56e6] px-6 py-2 rounded-full transition-colors w-fit"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            router.push("/widget");
                          }}
                          className="text-lg font-medium text-white bg-[#4B6BFB] hover:bg-[#3b56e6] px-6 py-2 rounded-full transition-colors w-fit"
                        >
                          Integrate Woop
                        </button>
                      </>
                    )}
                    <a
                      href={telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-medium text-black hover:text-[#4B6BFB] transition-colors"
                    >
                      Contact us
                    </a>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
