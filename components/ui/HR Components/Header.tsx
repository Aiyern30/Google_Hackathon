import React from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/Menubar";
import router from "next/router";

interface HeaderProps {
  Title: string;
}

const Header = ({ Title }: HeaderProps) => {
  return (
    <div className="p-8 bg-black flex items-center justify-between">
      <div
        className="flex items-center cursor-pointer"
        onClick={() => router.push("/Human")}
      >
        <img
          src="/logo.png"
          alt="Logo"
          className="h-16 w-16 mr-4 rounded-full"
        />
      </div>
      <div className="text-3xl font-bold text-center text-white flex-1">
        {Title}
      </div>
      <div>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Employee</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => router.push("/Human/Recruitments")}>
                View Recruitment
              </MenubarItem>
              <MenubarItem onClick={() => router.push("/Human/TakeLeave")}>
                View Take Leave Request
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </div>
  );
};

export default Header;
