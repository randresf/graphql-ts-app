import { Box, Button, Flex, Heading, IconButton, Link, Stack, Text } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import { Layout } from "../components/Layout";
import { NavBar } from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import createUrqlClient from "../utils/createUrqlClient";
import NextLink from 'next/link'
import { useState } from "react";
import UpdootSection from "../components/UpdootSection";

// osmehi
const Index = () => {
  const [variables, setVariables] = useState({ limit: 15, cursor: null as null | string })
  const [{ data, fetching }] = usePostsQuery({ variables });
  return (
    <Layout>
      <Flex align="center">
        <Heading>Post List</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">create post</Link>
        </NextLink>
      </Flex>
      <br />
      {fetching && !data ? (
        <div>loading...</div>
      ) : (<Stack>{
        data!.posts.posts.map((p) =>
          <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
            <UpdootSection post={p} />
            <Box>
              <Heading>{p.title}</Heading>
              <Text>posted by {p.creator.username}</Text>
              <Text mt={4}>{p.textSnipped}</Text>
            </Box>
          </Flex>)
      }</Stack>)}
      {data && data.posts.hasMore ? <Flex>
        <Button isLoading={fetching} mt={8} m="auto" onClick={() => {
          setVariables({
            limit: variables.limit,
            cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
          })
        }
        }>load more</Button>
      </Flex> : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
