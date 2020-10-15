import { Flex, IconButton } from '@chakra-ui/core';
import React, { useState } from 'react'
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
    post: PostSnippetFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
    const [, vote] = useVoteMutation()
    const [loading, setLoading] = useState<'updoot-loading' | 'downdoot-loading' | 'not-loading'>('not-loading')
    return (
        <Flex direction="column" alignItems="center" justifyContent="center" mr={4}>
            <IconButton
                aria-label="up doot"
                variantColor={post.voteStatus === 1 ? "green" : undefined}
                icon="chevron-up"
                onClick={async () => {
                    setLoading('updoot-loading')
                    await vote({ postId: post.id, value: 1 })
                    setLoading('not-loading')
                }}
                isLoading={loading === 'updoot-loading'}
                isDisabled={post.voteStatus === 1}
            />
            {post.points}
            <IconButton
                aria-label="down doot"
                variantColor={post.voteStatus === -1 ? "red" : undefined}
                icon="chevron-down"
                onClick={async () => {
                    setLoading('downdoot-loading')
                    await vote({ postId: post.id, value: -1 })
                    setLoading('not-loading')
                }}
                isLoading={loading === 'downdoot-loading'}
                isDisabled={post.voteStatus === -1}
            />
        </Flex>
    );
}

export default UpdootSection