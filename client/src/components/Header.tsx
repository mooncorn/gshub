import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";
import GoogleAuth from "./GoogleLoginButton";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorMode,
} from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import NextLink from "next/link";

import { Sun, Moon, ChevronDownIcon, Gamepad2 } from "lucide-react";

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <header className="border-b shadow">
      <div className="flex justify-between max-w-screen-lg mx-auto items-center h-14 px-4 ">
        <div className="flex items-center gap-x-4">
          <Button
            className="gap-x-2"
            variant={"outline"}
            href="/instances"
            as={NextLink}
          >
            <Gamepad2 />
            <h1>GSH 3.0</h1>
          </Button>
          {/* <Link as={NextLink} href={"/instances"}>
            Instances
          </Link> */}
        </div>
        <nav className="flex gap-x-2">
          <Button variant={"outline"} onClick={toggleColorMode}>
            {colorMode === "dark" ? (
              <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all light:rotate-90 light:scale-0" />
            ) : (
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            )}
          </Button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-x-2">
              <div className="flex items-center gap-x-2">
                <Avatar size={"sm"} name={user.name} src={user.picture} />
                <span>{user.name}</span>
              </div>

              <Menu>
                <MenuButton>
                  <ChevronDownIcon />
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={logout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </div>
          ) : (
            <GoogleAuth />
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
