import { Box, IconButton } from '@chakra-ui/core';
import React from 'react'
import NextLink from 'next/link'
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

interface EditDeletePostButtonsProps {
  id: number
  creatorId: number
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({ id, creatorId }) => {
  const [, deletePost] = useDeletePostMutation()
  const [{ data }] = useMeQuery()
  if (data?.me?.id !== creatorId)
    return null

  return (
    <Box>
      <NextLink href="/post/edit/[postId]" as={`/post/edit/${id}`}>
        <IconButton
          mr={4}
          icon='edit'
          aria-label="edit" />
      </NextLink>
      <IconButton
        icon='delete'
        aria-label="delete"
        onClick={() => {
          deletePost({ id })
        }} />
    </Box>
  );
}