import LoginForm from '@/app/ui/login-form';
// import bcrypt from 'bcrypt';
 
export default function LoginPage() {
// export default async function LoginPage() {

//   const password = 'drowssap';
//   const hashedPassword = await bcrypt.hash(password, 10);

//   console.log(hashedPassword);

  
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <LoginForm />
      </div>
    </main>
  );
}