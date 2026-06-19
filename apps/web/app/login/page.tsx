'use client';

import {
  Anchor,
  Button,
  Center,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Brand } from '@/components/brand';
import { login } from '@/lib/api';
import { useSessionStore } from '@/stores/session-store';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const setProfile = useSessionStore((s) => s.setProfile);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ defaultValues: { email: '', password: '' } });

  const submit = async (values: LoginFormValues): Promise<void> => {
    try {
      const profile = await login(values);
      setProfile(profile);
      router.replace('/app');
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Login failed';
      setError('root', { message });
    }
  };

  return (
    <Container size={420} py={80}>
      <Center mb="lg">
        <Brand size={32} />
      </Center>
      <Title order={2} mb={4} ta="center">
        Sign in to Lane
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb="lg">
        Don't have an account?{' '}
        <Anchor component={Link} href="/signup" size="sm">
          Sign up
        </Anchor>
      </Text>
      <Paper withBorder p={30} radius="md">
        <form onSubmit={handleSubmit(submit)}>
          <Stack gap="md">
            <TextInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />
            {errors.root && (
              <Text size="sm" c="red">
                {errors.root.message}
              </Text>
            )}
            <Button type="submit" fullWidth loading={isSubmitting}>
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
