import { Flex, Link, Button, Box } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { route } from 'next/dist/next-server/server/router';
import React, { useState } from 'react'
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import createUrqlClient from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';
import login from './login';
import NextLink from 'next/link'
import { useForgotPasswordMutation } from '../generated/graphql';
import { useRouter } from 'next/router';

const ForgotPassword: React.FC<{}> = ({ }) => {
    const [, forgotPassword] = useForgotPasswordMutation()
    const [complete, setComplete] = useState(false)
    const route = useRouter()
    return (<Wrapper variant="small">
        <Formik
            initialValues={{ email: "" }}
            onSubmit={async (values) => {
                const response = await forgotPassword(values);
                setComplete(true)
                setTimeout(() => {
                    route.push('/')
                }, 3000)
            }}
        >
            {({ isSubmitting }) => (
                complete
                    ? <Box> if the email is valid, we sent you an email!</Box>
                    : (
                        <Form>
                            <InputField
                                name="email"
                                placeholder="email"
                                label="Email"
                                type="email"
                            />
                            <Button
                                type="submit"
                                variantColor="teal"
                                mt={4}
                                isLoading={isSubmitting}
                            >
                                forgot password
          </Button>
                        </Form>
                    ))}
        </Formik>
    </Wrapper>);
}

export default withUrqlClient(createUrqlClient)(ForgotPassword)