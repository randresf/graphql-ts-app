import { Box, Button, Link } from "@chakra-ui/core";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import NextLink from 'next/link'
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useState } from "react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import createUrqlClient from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";

const ChangePassword: NextPage = () => {
  const [, changePassword] = useChangePasswordMutation()
  const route = useRouter()
  const token = typeof route.query.token === 'string' ? route.query.token : ''
  const [tokenError, setTokenError] = useState('')
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async ({ newPassword }, { setErrors }) => {
          const { data } = await changePassword({ newPassword, token });
          if (data?.changePassword.errors) {
            const errorMap = toErrorMap(data?.changePassword.errors)

            if ('token' in errorMap) { setTokenError(errorMap.token) }
            setErrors(errorMap);
          } else if (data?.changePassword.user) {
            route.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="new password"
              label="New Password"
              type="password"
            />
            {tokenError && <Box>
              <Box style={{ color: 'red' }}>{tokenError}</Box>
              <NextLink href='/forgot-password'>
                <Link>get a new token</Link>
              </NextLink>
            </Box>}
            <Button
              type="submit"
              variantColor="teal"
              mt={4}
              isLoading={isSubmitting}
            >
              change password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
