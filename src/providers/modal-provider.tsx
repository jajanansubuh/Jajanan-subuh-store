"use client";

import PreviewModal from "@/components/preview-modal";
import CheckoutModal from "@/components/modals/checkout-modal";
import { useEffect, useState } from "react";

const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <PreviewModal />
      <CheckoutModal />
    </>
  );
};

export default ModalProvider;
