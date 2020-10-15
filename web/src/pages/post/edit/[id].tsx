import { Box, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'
import InputField from '../../../components/InputField';
import { Layout } from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import createUrqlClient from '../../../utils/createUrqlClient';
import { useGetIntId } from '../../../utils/useGetIntId';

const UpdatePost = ({ }) => {
	const route = useRouter()
	const id = useGetIntId()
	const [{ fetching, data }] = usePostQuery({
		pause: id === -1,
		variables: {
			id
		}
	})
	const [, updatePost] = useUpdatePostMutation()

	if (fetching) {
		return <div>...loading</div>
	}

	console.log(id)

	const { post } = data as any
	if (!post) {
		return <Layout>
			<div>post not found</div>
		</Layout>
	}
	return (
		<Layout variant='small'>
			<Formik
				initialValues={{ title: post.title, text: post.text }}
				onSubmit={async (values, { setErrors }) => {
					const { error } = await updatePost({ id: post.id, ...values })
					if (!error)
						route.back()
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
							save
            </Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
}

export default withUrqlClient(createUrqlClient, { ssr: true })(UpdatePost)