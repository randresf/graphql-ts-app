import { Box } from "@chakra-ui/core";
import React from "react";

export type WrapperVariant = "small" | "regular"

interface WrapperProps {
  variant?: WrapperVariant; // ? make it optional
}

const Wrapper: React.FC<WrapperProps> = ({ children, variant = "regular" }) => {
  return (
    <Box
      mx="auto"
      maxW={variant === "regular" ? "800px" : "400px"}
      mt={8}
      w="100%"
    >
      {children}
    </Box>
  );
};

export default Wrapper;
