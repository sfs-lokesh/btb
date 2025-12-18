import { UserLoginForm } from '@/components/user-login-form';
import { Toaster } from '@/components/ui/toaster';

export default function LoginPage() {
  return (
    <>
      <UserLoginForm />
      <Toaster />
    </>
  );
}
