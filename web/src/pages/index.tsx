import { Box, Button, Flex, Heading, IconButton, Link, Stack, Text } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import { Layout } from "../components/Layout";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import createUrqlClient from "../utils/createUrqlClient";
import NextLink from 'next/link'
import { useState } from "react";
import UpdootSection from "../components/UpdootSection";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";

// osmehi
const Index = () => {
  const [variables, setVariables] = useState({ limit: 15, cursor: null as null | string })
  const [{ data, fetching }] = usePostsQuery({ variables });

  return (
    <Layout>
      {fetching && !data ? (
        <div>loading...</div>
      ) : (
          <>
            <Stack>{
              data!.posts.posts.map((p) => !p ? null :
                <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                  <UpdootSection post={p} />
                  <Box flex={1}>
                    <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                      <Link>
                        <Heading>{p.title}</Heading>
                      </Link></NextLink>
                    <Text>posted by {p.creator.username}</Text>
                    <Flex align="center">
                      <Text flex={1} mt={4}>{p.textSnipped}</Text>
                      <Box ml="auto">
                        <EditDeletePostButtons id={p.id} creatorId={p.creator.id} />
                      </Box>
                    </Flex>
                  </Box>
                </Flex>)
            }</Stack>
            {data?.posts.hasMore
              ? <Flex>
                <Button isLoading={fetching} mt={8} m="auto" onClick={() => {
                  setVariables({
                    limit: variables.limit,
                    cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
                  })
                }
                }>load more</Button></Flex>
              : null}
          </>
        )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
