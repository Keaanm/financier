import { Filters } from "./filters";
import HeaderLogo from "./header-logo";
import Navigation from "./navigation";
import UserButton from "./user-button";

const Header = () => {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-20">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex items-center w-full gap-2">
          <HeaderLogo />
          <Navigation />
        </div>
        <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
          <Filters />
          <UserButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
