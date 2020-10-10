import { Box, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react'
import InputField from '../components/InputField';
import { Layout } from '../components/Layout';
import { useCreatePostMutation, useMeQuery } from '../generated/graphql';
import createUrqlClient from '../utils/createUrqlClient';
import { useIsAuth } from '../utils/useIfAuth';

const CreatePost: React.FC<{}> = ({ }) => {
    const [, createPost] = useCreatePostMutation()
    const route = useRouter()
    useIsAuth()
    return <Layout variant='small'><Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
            const { error } = await createPost({ input: values })
            if (!error)
                route.push('/')
        }}
    >
        {({ isSubmitting }) => (
            <Form>
                <InputField
                    name="title"
                    placeholder="title..."
                    label="Title"
                />
                <Box mt={4}>
                    <InputField
                        textarea
                        name="text"
                        placeholder="text..."
                        label="Body"
                    />
                </Box>
                <Button
                    type="submit"
                    variantColor="teal"
                    mt={4}
                    isLoading={isSubmitting}
                >
                    create
            </Button>
            </Form>
        )}
    </Formik></Layout>;
}

export default withUrqlClient(createUrqlClient)(CreatePost)