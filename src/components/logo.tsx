import Image from 'next/image';

export function Logo() {
  return (
    <div className="w-24 h-auto">
      <Image

        src="/logo.png"
        alt="Behind The Build Logo"
        width={200}
        height={150}
        className="text-primary"
        priority
      />
    </div>
  );
}
