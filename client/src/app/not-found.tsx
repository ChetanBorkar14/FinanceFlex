import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import Link from "next/link";

export default function NotFound() {
  return (
    <BackgroundBeamsWithCollision className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-gray-900 dark:text-white">
      <h1 className="text-9xl font-extrabold text-black dark:text-white animate-bounce">
        404
      </h1>
      <p className="mt-6 text-xl text-center max-w-md">
        Oops! The page you are looking for doesn’t exist.
      </p>
      <Link
        href="/"
        className="mt-8 px-6 py-3 rounded-2xl bg-primary text-white dark:bg-primary-dark dark:text-white font-semibold transition-all duration-300"
      >
        Go Back Home
      </Link>
    </BackgroundBeamsWithCollision>
  );
}
