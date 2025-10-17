import { Button, buttonVariants } from "@/components/ui/button";
import WaitlistModal from "@/components/waitlist-modal";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const useLockBodyScroll = (isLocked: boolean) => {
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (isLocked) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]);
};

const navigationItems = [
  { label: "Demo", href: "#demo" },
  { label: "Advantages", href: "#advantages" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#process" },
  // { label: "Pricing", href: "#pricing" },
];

const NavLinks = ({
  isMobile = false,
  onLinkClick,
}: {
  isMobile?: boolean;
  onLinkClick?: () => void;
}) => {
  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerElement = document.querySelector("header");
      const headerOffset = headerElement ? headerElement.offsetHeight : 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    onLinkClick?.();
  };

  return (
    <>
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "text-black font-medium text-sm",
            isMobile
              ? "w-full justify-start px-5 py-2.5"
              : "py-2.5 md:px-3 lg:px-5"
          )}
          onClick={(e) => handleLinkClick(e, item.href)}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
};

const TrialButton = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [showWaitlist, setShowWaitlist] = useState(false);

  return (
    <>
      <Button
        variant="trial"
        className={cn(
          "rounded-full h-auto",
          isMobile
            ? "w-full px-5 py-2.5"
            : "hidden md:flex py-2.5 md:px-4 lg:px-5"
        )}
        onClick={() => setShowWaitlist(true)}
      >
        Join the Waitlist
      </Button>
      <WaitlistModal
        open={showWaitlist}
        onOpenChange={setShowWaitlist}
        source={isMobile ? "header-mobile" : "header"}
      />
    </>
  );
};

const MobileMenu = ({
  isOpen,
  onLinkClick,
}: {
  isOpen: boolean;
  onLinkClick: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden absolute top-full left-0 w-full px-4 pb-4">
      <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/50 flex flex-col gap-4 p-4">
        <nav className="flex flex-col gap-2">
          <NavLinks isMobile onLinkClick={onLinkClick} />
        </nav>
        <TrialButton isMobile />
      </div>
    </div>
  );
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);

  useLockBodyScroll(isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const headerHeight = headerRef.current
        ? headerRef.current.offsetHeight
        : 80;
      const scrollThreshold = 10;

      if (isMenuOpen) {
        return;
      }

      if (currentScrollY < headerHeight) {
        setIsHeaderVisible(true);
      } else if (lastScrollY.current - currentScrollY > scrollThreshold) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsHeaderVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header
      ref={headerRef}
      className={cn(
        "w-full sticky top-0 z-50 transition-transform duration-200 pt-4",
        !isHeaderVisible && "-translate-y-full"
      )}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/50 px-4 h-16 md:h-20 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            if (isMenuOpen) {
              toggleMenu();
            }
          }}
        >
          <Image
            src="/logo.svg"
            alt="Code Press Logo"
            width={89}
            height={32}
            className="h-auto"
          />
        </Link>
        <nav className="hidden md:flex items-center md:gap-1 lg:gap-2">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2">
          <TrialButton />

          <Button
            variant="ghost"
            className="md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="text-black size-6" />
            ) : (
              <Menu className="text-black size-6" />
            )}
          </Button>
        </div>
        </div>
      </div>

      <MobileMenu isOpen={isMenuOpen} onLinkClick={toggleMenu} />
    </header>
  );
}
