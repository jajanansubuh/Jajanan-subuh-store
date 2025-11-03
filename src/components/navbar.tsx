// ...existing code...
import Container from "./ui/container";
import MainNav from "./main-nav";
import NavActions from "./nav-actions";
import getCategories from "@/actions/get-categories";
import LogoLoader from "./logo-loader";

export const revalidate = 0;

const Navbar = async () => {
  // Ambil data kategori dari API
  const categories = await getCategories();

  return (
    <>
      {/* Fixed navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#18442a] text-white">
        <Container>
          {/* NOTE: justify-center untuk menengahkan komponen, logo dan mobile menu diposisikan absolute */}
          <div className="relative px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-center">
            {/* Logo dan Teks - diposisikan absolute ke kiri */}
            {/* Logo: gunakan LogoLoader client component untuk men-trigger loading global */}
            <LogoLoader />

            {/* Navigasi Desktop - sekarang berada di tengah */}
            <div className="hidden lg:flex flex-1 justify-center">
              <MainNav data={categories} />
            </div>

            {/* Right side: show search (desktop + mobile button inside) and hamburger on mobile */}
            <NavActions categories={categories} />
          </div>
        </Container>
      </div>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div aria-hidden className="h-16" />
    </>
  );
};

export default Navbar;
