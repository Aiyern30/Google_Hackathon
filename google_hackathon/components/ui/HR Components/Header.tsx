import React from "react";

interface HeaderProps {
  Title: string;
}

const Header = ({ Title }: HeaderProps) => {
  return (
    <div className="text-3xl font-bold text-center p-8 bg-black text-white">
      {Title}
    </div>
  );
};

export default Header;
