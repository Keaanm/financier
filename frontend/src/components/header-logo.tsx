import { Link } from "@tanstack/react-router";

const HeaderLogo = () => {
  return (
    <Link to="/">
      <div className="hidden mr-6 lg:flex items-center space-x-2">
        <img src="/Financier.svg" alt="Financer" className="h-[25px] w-auto" />
      </div>
    </Link>
  );
};

export default HeaderLogo;
