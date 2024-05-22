import NextLink from "next/link";
import { Link } from "@chakra-ui/react";
import { Github } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="h-14 border-t shadow">
      <div className="flex max-w-screen-lg mx-auto items-center h-14 px-4 gap-x-3">
        <Link
          className="flex gap-x-1"
          as={NextLink}
          href={"https://github.com/mooncorn/gshub"}
          target="_blank"
        >
          <Github />
          Github
        </Link>
      </div>
    </footer>
  );
};
