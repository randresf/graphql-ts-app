import { Box, Heading } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import React from 'react'
import { EditDeletePostButtons } from '../../components/EditDeletePostButtons';
import { Layout } from '../../components/Layout';
import { usePostQuery } from '../../generated/graphql';
import createUrqlClient from '../../utils/createUrqlClient';
import { useGetIntId } from '../../utils/useGetIntId';

const Post = ({ }) => {
    const id = useGetIntId()
    const [{ fetching, error, data }] = usePostQuery({
        pause: id === -1,
        variables: { id }
    })

    if (fetching) {
        return <Layout>
            <div>...loading</div>
        </Layout>
    }

    if (error) {
        return <Layout>
            <div>{error.message}</div>
        </Layout>
    }

    const { post } = data as any
    if (!post) {
        return <Layout>
            <div>post not found</div>
        </Layout>
    }

    return (
        <Layout>
            <Heading mb={4}>
                {post.title}
            </Heading>
            {post?.text}
            <Box mt={4}>
                <EditDeletePostButtons id={post.id} creatorId={post.creator.id} />
            </Box>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post)