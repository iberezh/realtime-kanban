'use client';

import { Anchor, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { AuthShell } from '@/components/auth-shell';
import { signup } from '@/lib/api';
import { useSessionStore } from '@/stores/session-store';

interface SignupFormValues {
  accountName: string;
  name: string;
  email: string;
  password: string;
}

export default function SignupPage() {
  const router = useRouter();
  const setProfile = useSessionStore((s) => s.setProfile);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    defaultValues: { accountName: '', name: '', email: '', password: '' },
  });

  const submit = async (values: SignupFormValues): Promise<void> => {
    try {
      const profile = await signup(values);
      setProfile(profile);
      router.replace('/app');
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Signup failed';
      setError('root', { message });
    }
  };

  return (
    <AuthShell>
      <Title order={2} mb={4} ta="center">
        Create your workspace
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb="lg">
        Already have an account?{' '}
        <Anchor component={Link} href="/login" size="sm">
          Sign in
        </Anchor>
      </Text>
      <Paper withBorder p={30} radius="md">
        <form onSubmit={handleSubmit(submit)}>
          <Stack gap="md">
            <TextInput
              label="Workspace name"
              placeholder="Acme Inc."
              error={errors.accountName?.message}
              {...register('accountName', { required: 'Workspace name is required' })}
            />
            <TextInput
              label="Your name"
              placeholder="Ada Lovelace"
              error={errors.name?.message}
              {...register('name', {
                required: 'Name is required',
                maxLength: { value: 40, message: 'Keep it under 40 characters' },
              })}
            />
            <TextInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <PasswordInput
              label="Password"
              placeholder="Choose a password"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
            />
            {errors.root && (
              <Text size="sm" c="red">
                {errors.root.message}
              </Text>
            )}
            <Button type="submit" fullWidth loading={isSubmitting}>
              Create account
            </Button>
          </Stack>
        </form>
      </Paper>
    </AuthShell>
  );
}
