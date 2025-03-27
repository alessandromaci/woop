import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 py-4">
      <div className="container mx-auto flex justify-center items-center gap-8 text-sm text-gray-500">
        <span>© 2025 Woop</span>
        <Link href="/terms" className="hover:text-gray-900">
          Terms of Service
        </Link>
        <Link href="/policy" className="hover:text-gray-900">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
