import React from "react";
import { Formik, Form } from "formik";
import { Box, Button } from "@chakra-ui/core";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import createUrqlClient from "../utils/createUrqlClient";

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const route = useRouter();
  const [, register] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "", email: "" }}
        onSubmit={async (values, { setErrors }) => {
          const { data } = await register({ options: values });
          if (data?.register.errors) {
            setErrors(toErrorMap(data?.register.errors));
          } else if (data?.register.user) {
            route.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Box mt={4}>
              <InputField
                name="email"
                placeholder="email"
                label="Email"
                type="email"
              />
            </Box>
            <Button
              type="submit"
              variantColor="teal"
              mt={4}
              isLoading={isSubmitting}
            >
              register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Register);
