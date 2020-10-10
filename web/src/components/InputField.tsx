import React, { InputHTMLAttributes } from "react";
import { useField } from "formik";
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage, Textarea
} from "@chakra-ui/core";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  // make name required with this object
  name: string;
  label: string;
  textarea?: boolean
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  size: _, // get out size since Input does not sup that type
  textarea = false,
  ...props
}) => {
  let InputOfTextarea = textarea ? Textarea : Input
  const [field, { error }] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor="name">{label}</FormLabel>
      <InputOfTextarea {...field} {...props} id={field.name} />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};

export default InputField;
