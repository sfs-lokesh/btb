import { UserRegistrationForm } from '@/components/user-registration-form';
import { Toaster } from '@/components/ui/toaster';

export default function RegisterPage() {
  return (
    <>
      <UserRegistrationForm />
      <Toaster />
    </>
  );
}
