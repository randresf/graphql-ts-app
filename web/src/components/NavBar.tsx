import { Box, Button, Flex, Heading, Link } from "@chakra-ui/core";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from "next/router";

interface NavBarProps { }

export const NavBar: React.FC<NavBarProps> = ({ }) => {
  const router = useRouter()
  const [{ data, fetching }] = useMeQuery({ pause: isServer() });
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  let bd = null;
  if (fetching) {
  } else if (!data?.me) {
    bd = (
      <>
        <NextLink href="/login">
          <Link mr={2}>login as</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>register</Link>
        </NextLink>
      </>
    );
  } else {
    bd = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button as={Link} mr={4}>create post</Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={async () => {
            await logout();
            router.reload()
          }}
          variant="link"
          isLoading={logoutFetching}
        >
          logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex position="sticky" top="0" zIndex={1} bg="tan" p={4}>
      <Flex flex={1} m="auto" align="center" maxW={800}>
        <NextLink href="/">
          <Link>
            <Heading>LiReddit</Heading>
          </Link>
        </NextLink>
        <Box ml="auto">{bd}</Box>
      </Flex>
    </Flex>
  );
};
