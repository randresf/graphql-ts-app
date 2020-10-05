import { Box } from "@chakra-ui/core";
import React from "react";

interface WrapperProps {
  variant?: "small" | "regular"; // ? make it optional
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
